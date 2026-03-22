
"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db, auth, isAdminEmail } from "@/lib/firebase/admin";
import slugify from "slugify";
import { generateInsights } from "@/lib/ai/deepseek";
import { getEntries as getEntriesForUser } from "@/lib/firebase/firestore";
import { getAuthedUserId } from "@/app/actions/auth";
import { logger } from "@/lib/logger/safe";
import { trackServerEvent } from "@/lib/analytics/server";
import { getRequestLocale } from "@/lib/locale-server";
import type { Locale } from "@/lib/locale";
import { FREE_ENTRY_LIMIT } from "@/lib/billing/config";
import { getActiveEmailAttribution, EMAIL_ATTRIBUTION_WINDOW_HOURS } from "@/lib/onboarding/email-attribution";
import { getFreeEntryState, resolveAurumAccessState } from "@/lib/billing/aurum-access";

const txt = (locale: Locale, fr: string, en: string) =>
  locale === "fr" ? fr : en;

const requiredString = (message: string) =>
  z.preprocess(
    (value) => (typeof value === "string" ? value : ""),
    z.string().min(1, { message })
  );

const optionalString = () =>
  z.preprocess(
    (value) => (typeof value === "string" ? value : undefined),
    z.string().optional()
  );

const journalImageSchema = z.object({
  id: z.string().min(1),
  url: z.string().url(),
  path: z.string().min(1),
  caption: z.string().optional(),
  name: z.string().min(1),
});

function buildFormSchema(locale: Locale) {
  return z
    .object({
      // Encrypted fields
      encryptedContent: optionalString(),
      iv: optionalString(),
      version: optionalString(), // Encryption version for future migration
      // Plaintext field (optional - legacy compatibility)
      content: optionalString(),
      previewTitle: optionalString(),
      previewExcerpt: optionalString(),
      idToken: optionalString(),
      images: optionalString(),
      tags: optionalString(),
      publishAsPost: z.boolean(),
      sentiment: optionalString(),
      mood: optionalString(),
      insight: optionalString(),
    })
    .refine((data) => data.encryptedContent || data.content, {
      message: txt(
        locale,
        "Contenu (chiffré ou texte) requis.",
        "Content (encrypted or plaintext) is required."
      ),
      path: ["content"],
    });
}

export type FormState = {
  message?: string;
  errors?: {
    content?: string[];
    tags?: string[];
    publishAsPost?: string[];
    encryptedContent?: string[];
    iv?: string[];
    version?: string[];
    idToken?: string[];
    previewTitle?: string[];
    previewExcerpt?: string[];
    images?: string[];
    sentiment?: string[];
    mood?: string[];
    insight?: string[];
  };
  isFirstEntry?: boolean;
  entryId?: string;
  freeLimitReached?: boolean;
  entriesUsed?: number;
  entriesLimit?: number;
};

export type EntryMutationState = {
  message?: string;
  error?: string;
};

// Helper function to create a unique slug
function createSlug(text: string) {
  const slug = slugify(text, {
    lower: true,
    strict: true,
    remove: /[*+~.()'"!:@]/g,
  });
  // Append a unique identifier to avoid collisions
  return `${slug}-${Date.now().toString(36)}`;
}

// Helper function to generate a title from the content
function generateTitle(content: string) {
  const words = content.split(/\s+/);
  return words.slice(0, 8).join(' ') + (words.length > 8 ? '...' : '');
}

function stripImageMarkdown(content: string) {
  return content
    .replace(/!\[[^\]]*]\(([^)]+)\)/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function generateExcerpt(content: string, maxLength = 170) {
  const plain = stripImageMarkdown(content);
  if (!plain) return "";
  const titleLead = generateTitle(plain).replace(/\.\.\.$/, "").trim();
  const withoutTitleLead = plain.toLowerCase().startsWith(titleLead.toLowerCase())
    ? plain.slice(titleLead.length).trimStart().replace(/^[,.:;!?-]+\s*/, "")
    : plain;
  if (withoutTitleLead.length <= maxLength) return withoutTitleLead;
  return `${withoutTitleLead.slice(0, maxLength).trim()}...`;
}

function toDate(value: unknown): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value === "object" && value && "toDate" in value) {
    try {
      const parsed = (value as { toDate?: () => Date }).toDate?.();
      return parsed instanceof Date ? parsed : null;
    } catch {
      return null;
    }
  }
  return null;
}

// Accept encrypted (AES-256-GCM) OR plaintext (legacy)
async function addEntryOnServer(entryData: {
  userId: string;
  encryptedContent?: string;
  iv?: string;
  version?: string;
  content?: string; // Legacy: support plaintext for backward compatibility
  images?: Array<z.infer<typeof journalImageSchema>>;
  tags: string[];
  createdAt: Date;
  sentiment?: string;
  mood?: string;
  insight?: string;
}, publishAsPost: boolean, userEmail: string, locale: Locale) {
  try {
    // Extract userId for routing, but don't store it in the document
    const { userId, ...dataToStore } = entryData;

    // Save encrypted (AES-256-GCM) OR plaintext (legacy)
    const entryToSave = entryData.encryptedContent && entryData.iv
      ? {
          encryptedContent: dataToStore.encryptedContent!,
          iv: dataToStore.iv!,
          version: dataToStore.version || '1', // Default to version 1
          images: dataToStore.images || [],
          tags: dataToStore.tags,
          createdAt: entryData.createdAt,
          updatedAt: entryData.createdAt,
          sentiment: dataToStore.sentiment,
          mood: dataToStore.mood,
          insight: dataToStore.insight,
        }
      : {
          content: dataToStore.content!, // PLAINTEXT (legacy)
          images: dataToStore.images || [],
          tags: dataToStore.tags,
          createdAt: entryData.createdAt,
          updatedAt: entryData.createdAt,
          sentiment: dataToStore.sentiment,
          mood: dataToStore.mood,
          insight: dataToStore.insight,
        };

    // Save the private journal entry to user's subcollection using Admin SDK API
    const privateDocRef = await db
      .collection("users")
      .doc(userId)
      .collection("entries")
      .add(entryToSave);

    // If "publish" is checked and the user is Alma, save to publicPosts as well
    if (publishAsPost && isAdminEmail(userEmail)) {
      if (!entryData.content) {
        throw new Error(
          txt(
            locale,
            "Contenu manquant pour la publication publique.",
            "Missing content for public post publishing."
          )
        );
      }
      const title = generateTitle(entryData.content);
      const slug = createSlug(title);

      await db.collection("publicPosts").add({
        userId: userId,
        title: title,
        content: entryData.content,
        tags: entryData.tags,
        slug: slug,
        publishedAt: entryData.createdAt,
        isPublic: true,
      });
    }

    return { id: privateDocRef.id };
  } catch (error: any) {
    logger.errorSafe("Error adding document(s)", error);
    return { error: error.message };
  }
}

export async function saveJournalEntry(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const locale = await getRequestLocale();
  const formSchema = buildFormSchema(locale);
  const validatedFields = formSchema.safeParse({
    encryptedContent: formData.get("encryptedContent"),
    iv: formData.get("iv"),
    version: formData.get("version"),
    tags: formData.get("tags"),
    publishAsPost: formData.get("publishAsPost") === "on",
    content: formData.get("content"),
    previewTitle: formData.get("previewTitle"),
    previewExcerpt: formData.get("previewExcerpt"),
    idToken: formData.get("idToken"),
    images: formData.get("images"),
    sentiment: formData.get("sentiment"),
    mood: formData.get("mood"),
    insight: formData.get("insight"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: txt(locale, "La validation a échoué.", "Validation failed."),
    };
  }

  const {
    encryptedContent,
    iv,
    version,
    tags,
    publishAsPost,
    content,
    previewTitle,
    previewExcerpt,
    idToken,
    images,
    sentiment,
    mood,
    insight,
  } = validatedFields.data;
  let parsedImages: Array<z.infer<typeof journalImageSchema>> = [];
  if (images) {
    try {
      const maybeImages = JSON.parse(images);
      parsedImages = z.array(journalImageSchema).parse(maybeImages);
    } catch {
      return {
        errors: {
          images: [
            txt(locale, "Format d'images invalide.", "Invalid images format."),
          ],
        },
        message: txt(locale, "La validation a échoué.", "Validation failed."),
      };
    }
  }
  let userId = await getAuthedUserId();
  if (!userId && idToken) {
    try {
      const decoded = await auth.verifyIdToken(idToken);
      userId = decoded.uid;
    } catch (error) {
      logger.warnSafe("saveJournalEntry: invalid idToken fallback", {
        reason: error instanceof Error ? error.message : String(error),
      });
    }
  }
  if (!userId) {
    return {
      message: txt(
        locale,
        "Utilisateur non authentifié. Veuillez vous reconnecter.",
        "Unauthenticated user. Please sign in again."
      ),
    };
  }
  let isFirstEntry = false;
  let entryId: string | undefined;
  let userEmail = '';

  try {
    // Get user document using Admin SDK API
    // If db is mocked, this will return a mock document
    const userDocRef = db.collection('users').doc(userId);
    const userDoc = await userDocRef.get();
    const userData = userDoc.data();
    userEmail = userData?.email || '';
    const { entriesUsed: entryCount } = getFreeEntryState(userData || {});
    isFirstEntry = entryCount === 0;
    const { hasSubscription: hasPremiumAccess } = resolveAurumAccessState(userData || {});

    if (!hasPremiumAccess && entryCount >= FREE_ENTRY_LIMIT) {
      if (!userData?.freeLimitReachedAt) {
        await userDocRef.set(
          {
            freeLimitReachedAt: new Date(),
            updatedAt: new Date(),
          },
          { merge: true }
        );
      }

      await trackServerEvent("free_limit_reached", {
        userId,
        userEmail,
        path: "/sanctuary/write",
        params: {
          entriesUsed: entryCount,
          entriesLimit: FREE_ENTRY_LIMIT,
        },
      });

      return {
        message: txt(
          locale,
          `Vous avez utilisé vos ${FREE_ENTRY_LIMIT} sujets gratuits. Activez 7 jours offerts pour ouvrir de nouveaux sujets et continuer vos lectures psychologiques avec Aurum.`,
          `You have used your ${FREE_ENTRY_LIMIT} free topics. Start your 7-day free trial to open new topics and continue your psychological reflections with Aurum.`
        ),
        freeLimitReached: true,
        entriesUsed: entryCount,
        entriesLimit: FREE_ENTRY_LIMIT,
      };
    }

    // Pass encrypted data (AES-256-GCM) OR plaintext (legacy)
    const entryResult = await addEntryOnServer({
      userId,
      encryptedContent,
      iv,
      version,
      content, // Legacy: support plaintext
      images: parsedImages,
      tags: tags ? tags.split(",").map((tag) => tag.trim().toLowerCase()).filter(Boolean) : [],
      createdAt: new Date(),
      sentiment,
      mood,
      insight,
    }, publishAsPost, userEmail, locale);

    if (entryResult.error) {
      throw new Error(entryResult.error);
    }
    if (!entryResult.id) {
      throw new Error(
        txt(
          locale,
          "ID d'entrée manquant après sauvegarde.",
          "Missing entry ID after save."
        )
      );
    }
    entryId = entryResult.id;

    // Build magazine card data (cover + excerpt) for gallery-style browsing
    const coverImageUrl = parsedImages[0]?.url || null;
    const isEncrypted = !!encryptedContent;
    const plainContent = stripImageMarkdown(content || "").trim();
    const excerpt = previewExcerpt?.trim()
      ? previewExcerpt.trim()
      : plainContent
        ? generateExcerpt(content || "")
        : txt(locale, "Un aperçu privé de ton écriture apparaîtra ici.", "A private glimpse of your writing will appear here.");
    const title = previewTitle?.trim()
      ? previewTitle.trim()
      : plainContent
        ? generateTitle(plainContent)
        : txt(locale, "Extrait privé", "Private excerpt");

    await db
      .collection("users")
      .doc(userId)
      .collection("magazineIssues")
      .doc(entryResult.id)
      .set({
        entryId: entryResult.id,
        title,
        excerpt,
        coverImageUrl,
        tags: tags ? tags.split(",").map((tag) => tag.trim().toLowerCase()).filter(Boolean) : [],
        mood: mood || null,
        sentiment: sentiment || null,
        createdAt: new Date(),
        publishedAt: new Date(),
      }, { merge: true });

    // Update entry count using Admin SDK API
    // Use set with merge to create document if it doesn't exist (fallback for missing Cloud Function trigger)
    await userDocRef.set({
      entryCount: entryCount + 1,
      email: userEmail || null,
      firstEntryAt: isFirstEntry ? new Date() : (userData?.firstEntryAt || null),
      updatedAt: new Date(),
    }, { merge: true });

    await trackServerEvent("entry_created", {
      userId,
      userEmail,
      path: "/sanctuary/write",
      params: {
        tagsCount: tags ? tags.split(",").filter(Boolean).length : 0,
        publishedAsPost: publishAsPost,
        ...(await (async () => {
          const attribution = await getActiveEmailAttribution(userId);
          return attribution
            ? {
                attributed_email_id: attribution.emailId,
                attributed_email_clicked_at: attribution.clickedAt.toISOString(),
                attribution_window_hours: EMAIL_ATTRIBUTION_WINDOW_HOURS,
              }
            : {};
        })()),
      },
    });

    if (isFirstEntry) {
      await trackServerEvent("first_entry", {
        userId,
        userEmail,
        path: "/sanctuary/write",
      });
    }

    if (publishAsPost && isAdminEmail(userEmail)) {
      revalidatePath("/blog");
    }
    revalidatePath("/sanctuary/write");
    revalidatePath("/sanctuary");
    revalidatePath("/sanctuary/entry/[entryId]", "page");

  } catch (error) {
    logger.errorSafe("Error saving entry", error);
    if (error instanceof Error) {
      return { message: error.message };
    }
    return {
      message: txt(
        locale,
        "Une erreur inattendue est survenue lors de l'enregistrement de votre entrée. Veuillez réessayer.",
        "An unexpected error occurred while saving your entry. Please try again."
      ),
    };
  }

  // No redirect, component will handle UI changes
  return { isFirstEntry: isFirstEntry, entryId };
}

export async function generateUserInsights() {
  const locale = await getRequestLocale();
  const userId = await getAuthedUserId();
  if (!userId) {
    return {
      error: txt(locale, "Utilisateur non authentifié.", "Unauthenticated user."),
    };
  }

  try {
    const entries = await getEntriesForUser(userId, null, 30); // Use last 30 entries for insights

    if (entries.length < 3) {
      return {
        error: txt(
          locale,
          "Pas assez de données pour générer des insights significatifs. Continuez à écrire !",
          "Not enough data to generate meaningful insights yet. Keep writing!"
        ),
      };
    }

    const insights = await generateInsights(entries);

    // Update user document using Admin SDK API
    const userDocRef = db.collection('users').doc(userId);

    await userDocRef.update({
      insights: {
        ...insights,
        lastUpdatedAt: new Date()
      }
    });

    revalidatePath('/sanctuary/write');
    return { success: true };

  } catch (error: any) {
    logger.errorSafe("Error generating user insights", error);
    return {
      error:
        error.message ||
        txt(
          locale,
          "Une erreur est survenue lors de la génération des insights.",
          "An error occurred while generating insights."
        ),
    };
  }
}

export async function updateJournalEntry(
  entryId: string,
  payload: { content: string; tags?: string }
): Promise<EntryMutationState> {
  const locale = await getRequestLocale();
  try {
    const userId = await getAuthedUserId();
    if (!userId) {
      return {
        error: txt(locale, "Utilisateur non authentifié.", "Unauthenticated user."),
      };
    }

    const cleanContent = String(payload.content || "").trim();
    if (!cleanContent) {
      return {
        error: txt(locale, "Le contenu ne peut pas être vide.", "Content cannot be empty."),
      };
    }

    const nextTags = String(payload.tags || "")
      .split(",")
      .map((tag) => tag.trim().toLowerCase())
      .filter(Boolean);

    const entryRef = db
      .collection("users")
      .doc(userId)
      .collection("entries")
      .doc(entryId);

    const entryDoc = await entryRef.get();
    if (!entryDoc.exists) {
      return { error: txt(locale, "Entrée introuvable.", "Entry not found.") };
    }

    await entryRef.set(
      {
        content: cleanContent,
        tags: nextTags,
        updatedAt: new Date(),
      },
      { merge: true }
    );

    const coverImageUrl = Array.isArray(entryDoc.data()?.images) && entryDoc.data()?.images?.[0]?.url
      ? String(entryDoc.data()?.images?.[0]?.url)
      : null;
    const excerpt = generateExcerpt(cleanContent);
    const title = generateTitle(stripImageMarkdown(cleanContent) || "Entrée");

    await db
      .collection("users")
      .doc(userId)
      .collection("magazineIssues")
      .doc(entryId)
      .set(
        {
          entryId,
          title,
          excerpt,
          coverImageUrl,
          tags: nextTags,
          updatedAt: new Date(),
        },
        { merge: true }
      );

    revalidatePath("/sanctuary");
    revalidatePath(`/sanctuary/entry/${entryId}`);
    revalidatePath("/sanctuary/write");
    return { message: txt(locale, "Entrée mise à jour.", "Entry updated.") };
  } catch (error) {
    logger.errorSafe("Error updating entry", error);
    return {
      error: txt(locale, "Impossible de mettre à jour l'entrée.", "Unable to update entry."),
    };
  }
}

export async function deleteJournalEntry(entryId: string): Promise<EntryMutationState> {
  const locale = await getRequestLocale();
  try {
    const userId = await getAuthedUserId();
    if (!userId) {
      return {
        error: txt(locale, "Utilisateur non authentifié.", "Unauthenticated user."),
      };
    }

    await db
      .collection("users")
      .doc(userId)
      .collection("entries")
      .doc(entryId)
      .delete();

    await db
      .collection("users")
      .doc(userId)
      .collection("magazineIssues")
      .doc(entryId)
      .delete();

    revalidatePath("/sanctuary");
    revalidatePath(`/sanctuary/entry/${entryId}`);
    revalidatePath("/sanctuary/write");
    return { message: txt(locale, "Entrée supprimée.", "Entry deleted.") };
  } catch (error) {
    logger.errorSafe("Error deleting entry", error);
    return {
      error: txt(locale, "Impossible de supprimer l'entrée.", "Unable to delete entry."),
    };
  }
}
