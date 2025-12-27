import { collection, query, where, getDocs, orderBy, Timestamp, limit } from "firebase/firestore";
import { db } from "./config";
import type { JournalEntry, PublicPost } from '@/lib/types';

const entriesCollectionName = "entries";
const publicPostsCollectionName = "publicPosts";

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

export async function getPublicPosts(): Promise<PublicPost[]> {
  const postsCollection = collection(db, publicPostsCollectionName);
  try {
    const q = query(
      postsCollection,
      where("isPublic", "==", true),
      orderBy("publishedAt", "desc")
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        publishedAt: (data.publishedAt as Timestamp).toDate(),
      } as PublicPost;
    });
  } catch (error) {
    console.error("Error getting public posts: ", error);
    return [];
  }
}

export async function getPublicPostBySlug(slug: string): Promise<PublicPost | null> {
    const postsCollection = collection(db, publicPostsCollectionName);
    try {
        const q = query(postsCollection, where("slug", "==", slug), limit(1));
        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) {
            return null;
        }
        const doc = querySnapshot.docs[0];
        const data = doc.data();
        return {
            id: doc.id,
            ...data,
            publishedAt: (data.publishedAt as Timestamp).toDate(),
        } as PublicPost;
    } catch (error) {
        console.error("Error getting post by slug: ", error);
        return null;
    }
}
