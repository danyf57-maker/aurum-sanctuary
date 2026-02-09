
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

const formSchema = z.object({
  encryptedContent: requiredString("Contenu chiffré manquant."),
  iv: requiredString("IV manquant."),
  tags: optionalString(),
  publishAsPost: z.boolean(),
  // Only required for Alma public posts
  content: optionalString(),
  sentiment: optionalString(),
  mood: optionalString(),
  insight: optionalString(),
});

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

async function addEntryOnServer(entryData: {
  userId: string;
  encryptedContent: string;
  iv: string;
  tags: string[];
  createdAt: Date;
  sentiment?: string;
  mood?: string;
  insight?: string;
  content?: string;
}, publishAsPost: boolean, userEmail: string) {
  try {
    // Extract userId for routing, but don't store it in the document
    const { userId, ...dataToStore } = entryData;

    // Save the private journal entry to user's subcollection using Admin SDK API
    const privateDocRef = await db
      .collection("users")
      .doc(userId)
      .collection("entries")
      .add({
        ...dataToStore,
        createdAt: Timestamp.fromDate(entryData.createdAt),
        updatedAt: Timestamp.fromDate(entryData.createdAt),
      });

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

  const { encryptedContent, iv, tags, publishAsPost, content, sentiment, mood, insight } = validatedFields.data;
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

    const entryResult = await addEntryOnServer({
      userId,
      encryptedContent,
      iv,
      tags: tags ? tags.split(",").map((tag) => tag.trim().toLowerCase()).filter(Boolean) : [],
      createdAt: new Date(),
      sentiment,
      mood,
      insight,
      content: publishAsPost ? content : undefined,
    }, publishAsPost, userEmail);

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
