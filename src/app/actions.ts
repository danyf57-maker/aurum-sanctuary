
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

// TABULA RASA: Schema simplifié pour accepter plaintext
const formSchema = z.object({
  // Encrypted fields (optional - legacy compatibility)
  encryptedContent: optionalString(),
  iv: optionalString(),
  // Plaintext field (temporary - Biométrie-First migration)
  content: optionalString(),
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
    sentiment?: string[];
    mood?: string[];
    insight?: string[];
  };
  isFirstEntry?: boolean;
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

// TABULA RASA: Fonction simplifiée pour accepter encrypted OU plaintext
async function addEntryOnServer(entryData: {
  userId: string;
  encryptedContent?: string;
  iv?: string;
  content?: string; // NOUVEAU: support plaintext temporaire
  tags: string[];
  createdAt: Date;
  sentiment?: string;
  mood?: string;
  insight?: string;
}, publishAsPost: boolean, userEmail: string) {
  try {
    logger.infoSafe("[addEntryOnServer] Starting entry creation", {
      hasEncrypted: !!(entryData.encryptedContent && entryData.iv),
      hasPlaintext: !!entryData.content,
      publishAsPost
    });

    // Extract userId for routing, but don't store it in the document
    const { userId, ...dataToStore } = entryData;

    // TABULA RASA: Sauvegarder encrypted OU plaintext
    // Si encryptedContent existe, on utilise l'ancien format
    // Sinon, on sauvegarde directement content en clair (temporaire)
    const entryToSave = entryData.encryptedContent && entryData.iv
      ? {
          encryptedContent: dataToStore.encryptedContent!,
          iv: dataToStore.iv!,
          tags: dataToStore.tags,
          createdAt: Timestamp.fromDate(entryData.createdAt),
          updatedAt: Timestamp.fromDate(entryData.createdAt),
          sentiment: dataToStore.sentiment,
          mood: dataToStore.mood,
          insight: dataToStore.insight,
        }
      : {
          content: dataToStore.content!, // PLAINTEXT (temporaire)
          tags: dataToStore.tags,
          createdAt: Timestamp.fromDate(entryData.createdAt),
          updatedAt: Timestamp.fromDate(entryData.createdAt),
          sentiment: dataToStore.sentiment,
          mood: dataToStore.mood,
          insight: dataToStore.insight,
        };

    logger.infoSafe("[addEntryOnServer] Entry object prepared, saving to Firestore");

    // Save the private journal entry to user's subcollection using Admin SDK API
    const privateDocRef = await db
      .collection("users")
      .doc(userId)
      .collection("entries")
      .add(entryToSave);

    logger.infoSafe("[addEntryOnServer] Entry saved to Firestore", { id: privateDocRef.id });

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
  // DEBUG: Log entry to server action
  logger.infoSafe("[saveJournalEntry] Server action called");

  const validatedFields = formSchema.safeParse({
    encryptedContent: formData.get("encryptedContent"),
    iv: formData.get("iv"),
    tags: formData.get("tags"),
    publishAsPost: formData.get("publishAsPost") === "on",
    content: formData.get("content"),
    sentiment: formData.get("sentiment"),
    mood: formData.get("mood"),
    insight: formData.get("insight"),
  });

  if (!validatedFields.success) {
    logger.warnSafe("[saveJournalEntry] Validation failed", {
      errors: validatedFields.error.flatten().fieldErrors
    });
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "La validation a échoué.",
    };
  }

  logger.infoSafe("[saveJournalEntry] Validation passed");

  const { encryptedContent, iv, tags, publishAsPost, content, sentiment, mood, insight } = validatedFields.data;

  let userId: string | null = null;
  try {
    logger.infoSafe("[saveJournalEntry] Attempting to get authenticated user ID");
    userId = await getAuthedUserId();
    logger.infoSafe("[saveJournalEntry] Got user ID", { hasUserId: !!userId });
  } catch (authError) {
    logger.errorSafe("[saveJournalEntry] Failed to get authenticated user ID", authError);
    return {
      message: "Erreur d'authentification. Veuillez vous reconnecter.",
    };
  }

  if (!userId) {
    logger.warnSafe("[saveJournalEntry] User not authenticated");
    return {
      message: "Utilisateur non authentifié. Veuillez vous reconnecter.",
    };
  }

  let isFirstEntry = false;
  let userEmail = '';

  try {
    // Get user document using Admin SDK API
    // If db is mocked, this will return a mock document
    logger.infoSafe("[saveJournalEntry] Fetching user document from Firestore");
    const userDocRef = db.collection('users').doc(userId);
    const userDoc = await userDocRef.get();
    logger.infoSafe("[saveJournalEntry] User document fetched", { exists: userDoc.exists });

    const userData = userDoc.data();
    userEmail = userData?.email || '';
    const entryCount = userData?.entryCount || 0;
    isFirstEntry = entryCount === 0;

    logger.infoSafe("[saveJournalEntry] User data retrieved", {
      entryCount,
      isFirstEntry,
      hasEmail: !!userEmail
    });

    // TABULA RASA: Passer encrypted OU plaintext
    logger.infoSafe("[saveJournalEntry] Calling addEntryOnServer");
    const entryResult = await addEntryOnServer({
      userId,
      encryptedContent,
      iv,
      content, // NOUVEAU: support plaintext
      tags: tags ? tags.split(",").map((tag) => tag.trim().toLowerCase()).filter(Boolean) : [],
      createdAt: new Date(),
      sentiment,
      mood,
      insight,
    }, publishAsPost, userEmail);

    logger.infoSafe("[saveJournalEntry] Entry saved", { hasError: !!entryResult.error });

    if (entryResult.error) {
      throw new Error(entryResult.error);
    }

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
