import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  Timestamp,
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

// Données de départ pour le blog d'Alma
const almaInitialPosts = [
  {
    title: "Ce succès qui me donne le vertige",
    content:
      "Ils ont applaudi ma présentation. Pourquoi j'ai l'impression d'avoir volé leur admiration ? J'attends juste le moment où ils découvriront que je n'ai aucune idée de ce que je fais. Chaque compliment ressemble à un sursis. Le succès ne chasse pas la peur, il la met en lumière. Ce vertige est la preuve de ma compétence, pas de mon imposture. C'est ce que je me répète, en boucle.",
    tags: ["syndrome de l'imposteur", "carrière", "anxiété"],
  },
  {
    title: "Mon cerveau refuse le bouton 'off'",
    content:
      "La nuit, la liste des tâches tourne en boucle dans ma tête. Chaque détail, chaque e-mail en attente, chaque conversation à venir. Si je m'endors maintenant, j'ai cette peur irrationnelle d'oublier l'essentiel pour demain. Mon esprit refuse de s'éteindre. Il est à la fois mon outil le plus précieux et ma cage la plus solide. Ce sanctuaire est le seul endroit où je peux déposer tout ça, en espérant trouver le silence.",
    tags: ["anxiété", "insomnie", "charge mentale"],
  },
  {
    title: "La fatigue d'être 'super'",
    content:
      "J'ai dit 'ça va super' douze fois aujourd'hui. C'est devenu un réflexe, un masque si bien ajusté que j'oublie parfois le visage qu'il cache. Je crois que je ne sais même plus ce que je ressens vraiment sous cette façade. La dissonance entre mon état interne et l'image que je projette est épuisante. Ici, au moins, je n'ai pas de public. Ici, je peux juste dire la vérité : aujourd'hui, ça ne va pas.",
    tags: ["fatigue émotionnelle", "introspection", "masque social"],
  },
];

function createSlug(text: string) {
  return slugify(text, {
    lower: true,
    strict: true,
    remove: /[*+~.()'"!:@]/g,
  });
}

export async function getPublicPosts(limit?: number): Promise<PublicPost[]> {
  // BYPASS FIRESTORE FOR BUILD
  const baseDate = new Date();
  return almaInitialPosts
    .map((post, index) => {
      const postDate = new Date(
        baseDate.getTime() - index * 24 * 60 * 60 * 1000
      );
      return {
        id: `initial-${index}`,
        title: post.title,
        content: post.content,
        tags: post.tags,
        slug: createSlug(post.title),
        publishedAt: postDate,
        userId: "ALMA_SPECIAL_USER_ID",
        isPublic: true,
      };
    })
    .slice(0, limit);
}

export async function getPublicPostBySlug(
  slug: string
): Promise<PublicPost | null> {
  // BYPASS FIRESTORE FOR BUILD
  const initialPost = almaInitialPosts.find(
    (p) => createSlug(p.title) === slug
  );
  if (initialPost) {
    return {
      id: `initial-slug-${slug}`,
      title: initialPost.title,
      content: initialPost.content,
      tags: initialPost.tags,
      slug: createSlug(initialPost.title),
      publishedAt: new Date(),
      userId: "ALMA_SPECIAL_USER_ID",
      isPublic: true,
    };
  }
  return null;
}
