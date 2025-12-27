
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/firebase/server-config";
import { collection, addDoc, Timestamp } from "firebase-admin/firestore";
import slugify from "slugify";

// A simple hardcoded ID for our special user, Alma.
const ALMA_USER_ID = "alma_user_placeholder_id";

const formSchema = z.object({
  content: z.string().min(10, { message: "Votre entrée doit comporter au moins 10 caractères." }),
  tags: z.string().optional(),
  userId: z.string().min(1, { message: "Vous devez être connecté pour enregistrer une entrée." }),
  publishAsPost: z.boolean(),
});

export type FormState = {
  message?: string;
  errors?: {
    content?: string[];
    tags?: string[];
    userId?: string[];
    publishAsPost?: string[];
  };
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
  sentimentScore: number;
}, publishAsPost: boolean) {
  const entriesCollection = collection(db, "entries");
  const publicPostsCollection = collection(db, "publicPosts");

  try {
    // Save the private journal entry
    const privateDocRef = await addDoc(entriesCollection, {
      ...entryData,
      createdAt: Timestamp.fromDate(entryData.createdAt),
    });

    // If "publish" is checked and the user is Alma, save to publicPosts as well
    if (publishAsPost && entryData.userId === ALMA_USER_ID) {
        const title = generateTitle(entryData.content);
        const slug = createSlug(title);

        await addDoc(publicPostsCollection, {
            userId: entryData.userId,
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

async function analyzeEntrySentiment(entryText: string) {
  // We need to use the full URL for server-side fetch
  const host = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:9002';
  const apiUrl = `${host}/api/analyze`;

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ entryText }),
  });

  if (!response.ok) {
    const errorBody = await response.json();
    throw new Error(errorBody.error || "Échec de l'analyse des sentiments");
  }

  return response.json();
}

export async function saveJournalEntry(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const validatedFields = formSchema.safeParse({
    content: formData.get("content"),
    tags: formData.get("tags"),
    userId: formData.get("userId"),
    publishAsPost: formData.get("publishAsPost") === "on",
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "La validation a échoué.",
    };
  }

  const { content, tags, userId, publishAsPost } = validatedFields.data;

  try {
    const sentimentResult = await analyzeEntrySentiment(content);

    await addEntryOnServer({
      userId,
      content,
      tags: tags ? tags.split(",").map((tag) => tag.trim().toLowerCase()).filter(Boolean) : [],
      createdAt: new Date(),
      sentiment: sentimentResult.sentiment,
      sentimentScore: sentimentResult.score,
    }, publishAsPost);

  } catch (error) {
    console.error("Error saving entry:", error);
    if (error instanceof Error) {
        return { message: error.message };
    }
    return { message: "Une erreur inattendue est survenue lors de l'enregistrement de votre entrée. Veuillez réessayer." };
  }

  if (publishAsPost && userId === ALMA_USER_ID) {
      revalidatePath("/blog");
  }
  revalidatePath("/sanctuary");
  redirect("/sanctuary");
}
