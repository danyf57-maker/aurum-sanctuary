import { collection, addDoc, query, where, getDocs, orderBy, Timestamp } from "firebase/firestore";
import { db } from "./config";
import type { JournalEntry } from '@/lib/types';

const entriesCollectionName = "entries";

// This function is now client-side only.
// The addEntry logic is handled by the server action directly.

export async function getEntries(userId: string, tag?: string | null): Promise<JournalEntry[]> {
  const entriesCollection = collection(db, entriesCollectionName);
  try {
    let q;
    if (tag) {
        q = query(
            entriesCollection,
            where("userId", "==", userId),
            where("tags", "array-contains", tag),
            orderBy("createdAt", "desc")
        );
    } else {
        q = query(
            entriesCollection, 
            where("userId", "==", userId),
            orderBy("createdAt", "desc")
        );
    }
    
    const querySnapshot = await getDocs(q);
    const entries: JournalEntry[] = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: (data.createdAt as Timestamp).toDate(),
      } as JournalEntry;
    });
    return entries;
  } catch (error: any) {
    console.error("Error getting documents: ", error);
    return [];
  }
}

export async function getUniqueTags(userId: string): Promise<string[]> {
    const entriesCollection = collection(db, entriesCollectionName);
    try {
        const q = query(entriesCollection, where("userId", "==", userId));
        const querySnapshot = await getDocs(q);
        const tags = new Set<string>();
        querySnapshot.forEach(doc => {
            const data = doc.data();
            if (data.tags && Array.isArray(data.tags)) {
                data.tags.forEach((tag: string) => tags.add(tag));
            }
        });
        return Array.from(tags).sort();
    } catch (error) {
        console.error("Error getting unique tags: ", error);
        return [];
    }
}
