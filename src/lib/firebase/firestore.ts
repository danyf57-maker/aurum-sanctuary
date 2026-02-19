import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit as firestoreLimit,
  getDoc,
  doc,
} from "firebase/firestore";
import { db } from "./config";

import type { JournalEntry, PublicPost, UserProfile } from "@/lib/types";
import slugify from "slugify";

const entriesCollectionName = "entries";
const publicPostsCollectionName = "publicPosts";
const usersCollectionName = "users";

export async function getUserProfile(
  userId: string
): Promise<UserProfile | null> {
  try {
    const userDocRef = doc(db, usersCollectionName, userId);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      return null;
    }

    const data = userDoc.data();
    return {
      uid: userId,
      email: data.email || null,
      displayName: data.displayName || null,
      photoURL: data.photoURL || null,
      entryCount: data.entryCount || 0,
      createdAt: data.createdAt?.toDate?.() || new Date(),
      updatedAt: data.updatedAt?.toDate?.() || new Date(),
    } as UserProfile;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }
}

export async function getEntries(
  userId: string,
  tag?: string | null,
  limit?: number
): Promise<JournalEntry[]> {
  try {
    const entriesRef = collection(
      db,
      usersCollectionName,
      userId,
      entriesCollectionName
    );

    let q = query(entriesRef, orderBy("createdAt", "desc"));

    if (tag) {
      q = query(
        entriesRef,
        where("tags", "array-contains", tag),
        orderBy("createdAt", "desc")
      );
    }

    if (limit) {
      q = query(q, firestoreLimit(limit));
    }

    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        userId,
        content: data.content || null,
        encryptedContent: data.encryptedContent || null,
        iv: data.iv || null,
        version: data.version || null,
        images: data.images || [],
        tags: data.tags || [],
        createdAt: data.createdAt?.toDate?.() || new Date(),
        sentiment: data.sentiment || null,
        mood: data.mood || null,
        insight: data.insight || null,
      } as JournalEntry;
    });
  } catch (error) {
    console.error("Error fetching entries:", error);
    return [];
  }
}

export async function getUniqueTags(userId: string): Promise<string[]> {
  try {
    const entriesRef = collection(
      db,
      usersCollectionName,
      userId,
      entriesCollectionName
    );
    const snapshot = await getDocs(entriesRef);

    const tagsSet = new Set<string>();
    snapshot.docs.forEach((doc) => {
      const data = doc.data();
      const tags = data.tags || [];
      tags.forEach((tag: string) => tagsSet.add(tag));
    });

    return Array.from(tagsSet).sort();
  } catch (error) {
    console.error("Error fetching unique tags:", error);
    return [];
  }
}

function createSlug(text: string) {
  return slugify(text, {
    lower: true,
    strict: true,
    remove: /[*+~.()'"!:@]/g,
  });
}

export async function getPublicPosts(limit?: number): Promise<PublicPost[]> {
  try {
    const postsRef = collection(db, publicPostsCollectionName);
    let postsQuery = query(
      postsRef,
      where("isPublic", "==", true),
      orderBy("publishedAt", "desc")
    );

    if (limit) {
      postsQuery = query(postsQuery, firestoreLimit(limit));
    }

    const snapshot = await getDocs(postsQuery);
    return snapshot.docs.map((postDoc) => {
      const data = postDoc.data();
      return {
        id: postDoc.id,
        title: data.title || "Sans titre",
        content: data.content || "",
        tags: data.tags || [],
        slug: data.slug || createSlug(data.title || postDoc.id),
        publishedAt: data.publishedAt?.toDate?.() || new Date(),
        userId: data.userId || "",
        isPublic: data.isPublic === true,
      } as PublicPost;
    });
  } catch (error) {
    console.error("Error fetching public posts:", error);
    return [];
  }
}

export async function getPublicPostBySlug(
  slug: string
): Promise<PublicPost | null> {
  try {
    const postsRef = collection(db, publicPostsCollectionName);
    const postQuery = query(
      postsRef,
      where("isPublic", "==", true),
      where("slug", "==", slug),
      firestoreLimit(1)
    );
    const snapshot = await getDocs(postQuery);
    if (snapshot.empty) {
      return null;
    }

    const postDoc = snapshot.docs[0];
    const data = postDoc.data();
    return {
      id: postDoc.id,
      title: data.title || "Sans titre",
      content: data.content || "",
      tags: data.tags || [],
      slug: data.slug || slug,
      publishedAt: data.publishedAt?.toDate?.() || new Date(),
      userId: data.userId || "",
      isPublic: data.isPublic === true,
    } as PublicPost;
  } catch (error) {
    console.error("Error fetching public post by slug:", error);
    return null;
  }
}
