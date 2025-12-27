import { collection, addDoc, query, where, getDocs, orderBy, Timestamp } from "firebase/firestore";
import { db as clientDb } from "./config";
import { db as serverDb } from "./server-config";
import type { JournalEntry } from '@/lib/types';

// A helper function to determine if we are on the server
function isServer() {
  return typeof window === 'undefined';
}

const entriesCollectionName = "entries";

export async function addEntry(entryData: Omit<JournalEntry, 'id'>) {
  const db = serverDb;
  const entriesCollection = collection(db, entriesCollectionName);
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

export async function getEntries(userId: string, tag?: string | null): Promise<JournalEntry[]> {
  const db = isServer() ? serverDb : clientDb;
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
    const db = isServer() ? serverDb : clientDb;
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
