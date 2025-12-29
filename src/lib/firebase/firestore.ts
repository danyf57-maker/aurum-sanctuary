import { collection, query, where, getDocs, orderBy, Timestamp, limit as firestoreLimit } from "firebase/firestore";
import { db } from "./config";
import type { JournalEntry, PublicPost } from '@/lib/types';
import slugify from "slugify";

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

// Données de départ pour le blog d'Alma
const almaInitialPosts = [
  {
    title: "Ce succès qui me donne le vertige",
    content: "Ils ont applaudi ma présentation. Pourquoi j'ai l'impression d'avoir volé leur admiration ? J'attends juste le moment où ils découvriront que je n'ai aucune idée de ce que je fais. Chaque compliment ressemble à un sursis. Le succès ne chasse pas la peur, il la met en lumière. Ce vertige est la preuve de ma compétence, pas de mon imposture. C'est ce que je me répète, en boucle.",
    tags: ['syndrome de l\'imposteur', 'carrière', 'anxiété'],
  },
  {
    title: "Mon cerveau refuse le bouton 'off'",
    content: "La nuit, la liste des tâches tourne en boucle dans ma tête. Chaque détail, chaque e-mail en attente, chaque conversation à venir. Si je m'endors maintenant, j'ai cette peur irrationnelle d'oublier l'essentiel pour demain. Mon esprit refuse de s'éteindre. Il est à la fois mon outil le plus précieux et ma cage la plus solide. Ce sanctuaire est le seul endroit où je peux déposer tout ça, en espérant trouver le silence.",
    tags: ['anxiété', 'insomnie', 'charge mentale'],
  },
  {
    title: "La fatigue d'être 'super'",
    content: "J'ai dit 'ça va super' douze fois aujourd'hui. C'est devenu un réflexe, un masque si bien ajusté que j'oublie parfois le visage qu'il cache. Je crois que je ne sais même plus ce que je ressens vraiment sous cette façade. La dissonance entre mon état interne et l'image que je projette est épuisante. Ici, au moins, je n'ai pas de public. Ici, je peux juste dire la vérité : aujourd'hui, ça ne va pas.",
    tags: ['fatigue émotionnelle', 'introspection', 'masque social'],
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
  const postsCollection = collection(db, publicPostsCollectionName);
  try {
    const constraints = [
      where("isPublic", "==", true),
      orderBy("publishedAt", "desc"),
    ];

    if (limit) {
      constraints.push(firestoreLimit(limit));
    }

    const q = query(postsCollection, ...constraints);
    
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
        // Si la base de données est vide, on renvoie les articles de départ.
        const baseDate = new Date();
        return almaInitialPosts.map((post, index) => {
            const postDate = new Date(baseDate.getTime() - index * 24 * 60 * 60 * 1000); // 1 jour d'intervalle
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
        }).slice(0, limit);
    }
    
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
    // En cas d'erreur, on peut toujours renvoyer les articles de départ.
    const baseDate = new Date();
    return almaInitialPosts.map((post, index) => {
        const postDate = new Date(baseDate.getTime() - index * 24 * 60 * 60 * 1000);
        return {
            id: `error-initial-${index}`,
            title: post.title,
            content: post.content,
            tags: post.tags,
            slug: createSlug(post.title),
            publishedAt: postDate,
            userId: "ALMA_SPECIAL_USER_ID",
            isPublic: true,
        };
    }).slice(0, limit);
  }
}

export async function getPublicPostBySlug(slug: string): Promise<PublicPost | null> {
    // D'abord, on cherche dans les articles de départ
    const initialPost = almaInitialPosts.find(p => createSlug(p.title) === slug);
    if(initialPost) {
        return {
             id: `initial-slug-${slug}`,
            title: initialPost.title,
            content: initialPost.content,
            tags: initialPost.tags,
            slug: createSlug(initialPost.title),
            publishedAt: new Date(),
            userId: "ALMA_SPECIAL_USER_ID",
            isPublic: true,
        }
    }

    const postsCollection = collection(db, publicPostsCollectionName);
    try {
        const q = query(postsCollection, where("slug", "==", slug), firestoreLimit(1));
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
