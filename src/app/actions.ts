
"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db, ALMA_EMAIL } from "@/lib/firebase/admin";
import { Timestamp } from "firebase-admin/firestore";
import slugify from "slugify";
import { generateInsights } from "@/lib/ai/deepseek";
import { getEntries as getEntriesForUser } from "@/lib/firebase/firestore";
import { getAuthedUserId } from "@/app/actions/auth";
import { logger } from "@/lib/logger/safe";

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

// TABULA RASA: Schema simplifié pour accepter plaintext
const formSchema = z.object({
  // Encrypted fields (optional - legacy compatibility)
  encryptedContent: optionalString(),
  iv: optionalString(),
  // Plaintext field (temporary - Biométrie-First migration)
  content: optionalString(),
  images: optionalString(),
  tags: optionalString(),
  publishAsPost: z.boolean(),
  sentiment: optionalString(),
  mood: optionalString(),
  insight: optionalString(),
}).refine(
  (data) => data.encryptedContent || data.content,
  { message: "Contenu (chiffré ou plaintext) requis.", path: ["content"] }
);

export type FormState = {
  message?: string;
  errors?: {
    content?: string[];
    tags?: string[];
    publishAsPost?: string[];
    encryptedContent?: string[];
    iv?: string[];
    images?: string[];
    sentiment?: string[];
    mood?: string[];
    insight?: string[];
  };
  isFirstEntry?: boolean;
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
  if (plain.length <= maxLength) return plain;
  return `${plain.slice(0, maxLength).trim()}...`;
}

// TABULA RASA: Fonction simplifiée pour accepter encrypted OU plaintext
async function addEntryOnServer(entryData: {
  userId: string;
  encryptedContent?: string;
  iv?: string;
  content?: string; // NOUVEAU: support plaintext temporaire
  images?: Array<z.infer<typeof journalImageSchema>>;
  tags: string[];
  createdAt: Date;
  sentiment?: string;
  mood?: string;
  insight?: string;
}, publishAsPost: boolean, userEmail: string) {
  try {
    // Extract userId for routing, but don't store it in the document
    const { userId, ...dataToStore } = entryData;

    // TABULA RASA: Sauvegarder encrypted OU plaintext
    // Si encryptedContent existe, on utilise l'ancien format
    // Sinon, on sauvegarde directement content en clair (temporaire)
    const entryToSave = entryData.encryptedContent && entryData.iv
      ? {
          encryptedContent: dataToStore.encryptedContent!,
          iv: dataToStore.iv!,
          images: dataToStore.images || [],
          tags: dataToStore.tags,
          createdAt: Timestamp.fromDate(entryData.createdAt),
          updatedAt: Timestamp.fromDate(entryData.createdAt),
          sentiment: dataToStore.sentiment,
          mood: dataToStore.mood,
          insight: dataToStore.insight,
        }
      : {
          content: dataToStore.content!, // PLAINTEXT (temporaire)
          images: dataToStore.images || [],
          tags: dataToStore.tags,
          createdAt: Timestamp.fromDate(entryData.createdAt),
          updatedAt: Timestamp.fromDate(entryData.createdAt),
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
    if (publishAsPost && userEmail === ALMA_EMAIL) {
      if (!entryData.content) {
        throw new Error("Contenu manquant pour la publication publique.");
      }
      const title = generateTitle(entryData.content);
      const slug = createSlug(title);

      await db.collection("publicPosts").add({
        userId: userId,
        title: title,
        content: entryData.content,
        tags: entryData.tags,
        slug: slug,
        publishedAt: Timestamp.fromDate(entryData.createdAt),
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
  const validatedFields = formSchema.safeParse({
    encryptedContent: formData.get("encryptedContent"),
    iv: formData.get("iv"),
    tags: formData.get("tags"),
    publishAsPost: formData.get("publishAsPost") === "on",
    content: formData.get("content"),
    images: formData.get("images"),
    sentiment: formData.get("sentiment"),
    mood: formData.get("mood"),
    insight: formData.get("insight"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "La validation a échoué.",
    };
  }

  const { encryptedContent, iv, tags, publishAsPost, content, images, sentiment, mood, insight } = validatedFields.data;
  let parsedImages: Array<z.infer<typeof journalImageSchema>> = [];
  if (images) {
    try {
      const maybeImages = JSON.parse(images);
      parsedImages = z.array(journalImageSchema).parse(maybeImages);
    } catch {
      return {
        errors: { images: ["Format d'images invalide."] },
        message: "La validation a échoué.",
      };
    }
  }
  const userId = await getAuthedUserId();
  if (!userId) {
    return {
      message: "Utilisateur non authentifié. Veuillez vous reconnecter.",
    };
  }
  let isFirstEntry = false;
  let userEmail = '';

  try {
    // Get user document using Admin SDK API
    // If db is mocked, this will return a mock document
    const userDocRef = db.collection('users').doc(userId);
    const userDoc = await userDocRef.get();
    const userData = userDoc.data();
    userEmail = userData?.email || '';
    const entryCount = userData?.entryCount || 0;
    isFirstEntry = entryCount === 0;

    // TABULA RASA: Passer encrypted OU plaintext
    const entryResult = await addEntryOnServer({
      userId,
      encryptedContent,
      iv,
      content, // NOUVEAU: support plaintext
      images: parsedImages,
      tags: tags ? tags.split(",").map((tag) => tag.trim().toLowerCase()).filter(Boolean) : [],
      createdAt: new Date(),
      sentiment,
      mood,
      insight,
    }, publishAsPost, userEmail);

    if (entryResult.error) {
      throw new Error(entryResult.error);
    }
    if (!entryResult.id) {
      throw new Error("ID d'entrée manquant après sauvegarde.");
    }

    // Build magazine card data (cover + excerpt) for gallery-style browsing
    const coverImageUrl = parsedImages[0]?.url || null;
    const baseContent = content || encryptedContent || "";
    const excerpt = generateExcerpt(baseContent);
    const title = generateTitle(stripImageMarkdown(baseContent) || "Entrée");

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
        createdAt: Timestamp.now(),
        publishedAt: Timestamp.now(),
      }, { merge: true });

    // Update entry count using Admin SDK API
    // Use set with merge to create document if it doesn't exist (fallback for missing Cloud Function trigger)
    await userDocRef.set({
      entryCount: entryCount + 1,
      email: userEmail || null,
      updatedAt: Timestamp.now(),
    }, { merge: true });

    if (publishAsPost && userEmail === ALMA_EMAIL) {
      revalidatePath("/blog");
    }
    revalidatePath("/dashboard");
    revalidatePath("/sanctuary");
    revalidatePath("/sanctuary/magazine");

  } catch (error) {
    logger.errorSafe("Error saving entry", error);
    if (error instanceof Error) {
      return { message: error.message };
    }
    return { message: "Une erreur inattendue est survenue lors de l'enregistrement de votre entrée. Veuillez réessayer." };
  }

  // No redirect, component will handle UI changes
  return { isFirstEntry: isFirstEntry };
}

export async function generateUserInsights() {
  const userId = await getAuthedUserId();
  if (!userId) {
    return { error: 'Utilisateur non authentifié.' };
  }

  try {
    const entries = await getEntriesForUser(userId, null, 30); // Use last 30 entries for insights

    if (entries.length < 3) {
      return { error: 'Pas assez de données pour générer des insights significatifs. Continuez à écrire !' };
    }

    const insights = await generateInsights(entries);

    // Update user document using Admin SDK API
    const userDocRef = db.collection('users').doc(userId);

    await userDocRef.update({
      insights: {
        ...insights,
        lastUpdatedAt: Timestamp.now()
      }
    });

    revalidatePath('/dashboard');
    return { success: true };

  } catch (error: any) {
    logger.errorSafe("Error generating user insights", error);
    return { error: error.message || "Une erreur est survenue lors de la génération des insights." };
  }
}

export async function updateJournalEntry(
  entryId: string,
  payload: { content: string; tags?: string }
): Promise<EntryMutationState> {
  try {
    const userId = await getAuthedUserId();
    if (!userId) {
      return { error: "Utilisateur non authentifié." };
    }

    const cleanContent = String(payload.content || "").trim();
    if (!cleanContent) {
      return { error: "Le contenu ne peut pas être vide." };
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
      return { error: "Entrée introuvable." };
    }

    await entryRef.set(
      {
        content: cleanContent,
        tags: nextTags,
        updatedAt: Timestamp.now(),
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
          updatedAt: Timestamp.now(),
        },
        { merge: true }
      );

    revalidatePath("/sanctuary/magazine");
    revalidatePath(`/sanctuary/magazine/${entryId}`);
    revalidatePath("/sanctuary/write");
    return { message: "Entrée mise à jour." };
  } catch (error) {
    logger.errorSafe("Error updating entry", error);
    return { error: "Impossible de mettre à jour l'entrée." };
  }
}

export async function deleteJournalEntry(entryId: string): Promise<EntryMutationState> {
  try {
    const userId = await getAuthedUserId();
    if (!userId) {
      return { error: "Utilisateur non authentifié." };
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

    revalidatePath("/sanctuary/magazine");
    revalidatePath(`/sanctuary/magazine/${entryId}`);
    revalidatePath("/sanctuary/write");
    return { message: "Entrée supprimée." };
  } catch (error) {
    logger.errorSafe("Error deleting entry", error);
    return { error: "Impossible de supprimer l'entrée." };
  }
}
