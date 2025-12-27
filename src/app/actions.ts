"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { analyzeEntrySentiment } from "@/ai/flows/entry-sentiment-analysis";
import { db } from "@/lib/firebase/server-config";
import { collection, addDoc, Timestamp } from "firebase-admin/firestore";

const formSchema = z.object({
  content: z.string().min(10, { message: "Votre entrée doit comporter au moins 10 caractères." }),
  tags: z.string().optional(),
  userId: z.string().min(1, { message: "Vous devez être connecté pour enregistrer une entrée." }),
});

export type FormState = {
  message?: string;
  errors?: {
    content?: string[];
    tags?: string[];
    userId?: string[];
  };
};

async function addEntryOnServer(entryData: {
  userId: string;
  content: string;
  tags: string[];
  createdAt: Date;
  sentiment: string;
  sentimentScore: number;
}) {
  const entriesCollection = collection(db, "entries");
  try {
    const docRef = await addDoc(entriesCollection, {
      ...entryData,
      createdAt: Timestamp.fromDate(entryData.createdAt),
    });
    return { id: docRef.id };
  } catch (error: any) {
    console.error("Error adding document: ", error);
    return { error: error.message };
  }
}


export async function saveJournalEntry(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const validatedFields = formSchema.safeParse({
    content: formData.get("content"),
    tags: formData.get("tags"),
    userId: formData.get("userId"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "La validation a échoué.",
    };
  }

  const { content, tags, userId } = validatedFields.data;

  try {
    const sentimentResult = await analyzeEntrySentiment({ entryText: content });

    await addEntryOnServer({
      userId,
      content,
      tags: tags ? tags.split(",").map((tag) => tag.trim().toLowerCase()).filter(Boolean) : [],
      createdAt: new Date(),
      sentiment: sentimentResult.sentiment,
      sentimentScore: sentimentResult.score,
    });
  } catch (error) {
    console.error("Error saving entry:", error);
    return { message: "Une erreur inattendue est survenue lors de l'enregistrement de votre entrée. Veuillez réessayer." };
  }

  revalidatePath("/sanctuary");
  redirect("/sanctuary");
}
