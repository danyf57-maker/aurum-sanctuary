
"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";
import { db, ALMA_EMAIL } from "@/lib/firebase/server-config";
import { Timestamp } from "firebase-admin/firestore";
import slugify from "slugify";
import { generateInsights } from "@/lib/ai/deepseek";
import { getEntries as getEntriesForUser } from "@/lib/firebase/firestore";
import { getAuthedUserId } from "@/app/actions/auth";

const formSchema = z.object({
  content: z.string().min(10, { message: "Votre entrée doit comporter au moins 10 caractères." }),
  tags: z.string().optional(),
  publishAsPost: z.boolean(),
});

export type FormState = {
  message?: string;
  errors?: {
    content?: string[];
    tags?: string[];
    publishAsPost?: string[];
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
  content: string;
  tags: string[];
  createdAt: Date;
  sentiment: string;
  mood: string;
  insight: string;
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
      });

    // If "publish" is checked and the user is Alma, save to publicPosts as well
    if (publishAsPost && userEmail === ALMA_EMAIL) {
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
    console.error("Error adding document(s): ", error);
    return { error: error.message };
  }
}

async function analyzeEntrySentiment(content: string) {
  // Build absolute URL based on the incoming request (works on App Hosting)
  const reqHeaders = headers();
  const host = reqHeaders.get('x-forwarded-host') || reqHeaders.get('host');
  const proto = reqHeaders.get('x-forwarded-proto') || 'https';
  const baseUrl = host ? `${proto}://${host}` : (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9002');
  const apiUrl = `${baseUrl}/api/analyze`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!response.ok) {
      const errorBody = await response.json();
      console.error("Sentiment analysis API error:", errorBody);
      throw new Error(errorBody.error || "Échec de l'analyse des sentiments");
    }

    return response.json();
  } catch (error) {
    console.error("Fetch to sentiment analysis failed:", error);
    throw error;
  }
}

export async function saveJournalEntry(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const validatedFields = formSchema.safeParse({
    content: formData.get("content"),
    tags: formData.get("tags"),
    publishAsPost: formData.get("publishAsPost") === "on",
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "La validation a échoué.",
    };
  }

  const { content, tags, publishAsPost } = validatedFields.data;
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
    const userDocRef = db.collection('users').doc(userId);
    const userDoc = await userDocRef.get();
    const userData = userDoc.data();
    userEmail = userData?.email || '';
    const entryCount = userData?.entryCount || 0;
    isFirstEntry = entryCount === 0;

    const analysisResult = await analyzeEntrySentiment(content);

    await addEntryOnServer({
      userId,
      content,
      tags: tags ? tags.split(",").map((tag) => tag.trim().toLowerCase()).filter(Boolean) : [],
      createdAt: new Date(),
      sentiment: analysisResult.sentiment,
      mood: analysisResult.mood,
      insight: analysisResult.insight,
    }, publishAsPost, userEmail);

    // Update entry count using Admin SDK API
    await userDocRef.update({
      entryCount: entryCount + 1,
    });


  } catch (error) {
    console.error("Error saving entry:", error);
    if (error instanceof Error) {
      return { message: error.message };
    }
    return { message: "Une erreur inattendue est survenue lors de l'enregistrement de votre entrée. Veuillez réessayer." };
  }

  if (publishAsPost && userEmail === ALMA_EMAIL) {
    revalidatePath("/blog");
  }
  revalidatePath("/dashboard");
  revalidatePath("/sanctuary");

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
    console.error("Error generating user insights:", error);
    return { error: error.message || "Une erreur est survenue lors de la génération des insights." };
  }
}
