import "server-only";

import { db } from "@/lib/firebase/admin";

const MEMORY_VERSION = "v1";
const DEFAULT_MAX_ENTRIES = 200;
const MEMORY_STALE_HOURS = 24;

type RawEntry = {
  id: string;
  content: string;
  tags: string[];
  mood: string | null;
  createdAt: Date;
};

export type LongMemorySettings = {
  enabled: boolean;
  updatedAt?: Date | null;
};

export type LongMemoryProfile = {
  version: string;
  enabled: boolean;
  totalEntries: number;
  analyzedEntries: number;
  encryptedEntriesSkipped: number;
  firstEntryAt: string | null;
  lastEntryAt: string | null;
  topTags: Array<{ tag: string; count: number }>;
  topMoods: Array<{ mood: string; count: number }>;
  keyThemes: string[];
  summary: string;
  updatedAt: string;
};

const STOP_WORDS = new Set([
  "alors",
  "au",
  "aucuns",
  "aussi",
  "autre",
  "avant",
  "avec",
  "avoir",
  "bon",
  "car",
  "ce",
  "cela",
  "ces",
  "ceux",
  "chaque",
  "ci",
  "comme",
  "comment",
  "dans",
  "des",
  "du",
  "dedans",
  "dehors",
  "depuis",
  "devrait",
  "doit",
  "donc",
  "dos",
  "droite",
  "debut",
  "elle",
  "elles",
  "en",
  "encore",
  "essai",
  "est",
  "et",
  "eu",
  "fait",
  "faites",
  "fois",
  "font",
  "force",
  "haut",
  "hors",
  "ici",
  "il",
  "ils",
  "je",
  "juste",
  "la",
  "le",
  "les",
  "leur",
  "là",
  "ma",
  "maintenant",
  "mais",
  "mes",
  "mine",
  "moins",
  "mon",
  "mot",
  "meme",
  "ni",
  "nommes",
  "notre",
  "nous",
  "nouveaux",
  "ou",
  "où",
  "par",
  "parce",
  "parole",
  "pas",
  "personnes",
  "peut",
  "peu",
  "piece",
  "plupart",
  "pour",
  "pourquoi",
  "quand",
  "que",
  "quel",
  "quelle",
  "quelles",
  "quels",
  "qui",
  "sa",
  "sans",
  "ses",
  "seulement",
  "si",
  "sien",
  "son",
  "sont",
  "sous",
  "soyez",
  "sujet",
  "sur",
  "ta",
  "tandis",
  "tellement",
  "tels",
  "tes",
  "ton",
  "tous",
  "tout",
  "trop",
  "tres",
  "tu",
  "valeur",
  "voie",
  "voient",
  "vont",
  "votre",
  "vous",
  "vu",
  "ça",
  "j",
  "d",
  "l",
  "m",
  "n",
  "s",
  "t",
]);

function asDate(value: unknown): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value === "object" && value && "toDate" in value) {
    try {
      return (value as { toDate: () => Date }).toDate();
    } catch {
      return null;
    }
  }
  return null;
}

function cleanText(input: string) {
  return input
    .normalize("NFKD")
    .replace(/[^\w\s']/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function topN(counter: Map<string, number>, limit: number) {
  return Array.from(counter.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit);
}

function extractThemes(entries: RawEntry[], limit = 6) {
  const counter = new Map<string, number>();
  for (const entry of entries) {
    const source = cleanText(entry.content);
    if (!source) continue;
    const tokens = source.split(" ");
    for (const token of tokens) {
      if (!token || token.length < 4) continue;
      if (STOP_WORDS.has(token)) continue;
      counter.set(token, (counter.get(token) ?? 0) + 1);
    }
  }
  return topN(counter, limit).map(([theme]) => theme);
}

function summarize(entries: RawEntry[], themes: string[]) {
  if (entries.length === 0) {
    return "Pas encore assez de contenu exploitable pour construire une mémoire longue.";
  }

  const lastDate = entries[0]?.createdAt
    ? entries[0].createdAt.toLocaleDateString("fr-FR")
    : "inconnue";
  const firstDate = entries[entries.length - 1]?.createdAt
    ? entries[entries.length - 1].createdAt.toLocaleDateString("fr-FR")
    : "inconnue";

  const lead = `Aurum s'appuie sur ${entries.length} entrées, du ${firstDate} au ${lastDate}.`;
  const themesLine =
    themes.length > 0
      ? `Thèmes dominants détectés: ${themes.slice(0, 5).join(", ")}.`
      : "Thèmes dominants encore en cours d'émergence.";
  const guidance =
    "Utiliser ce contexte pour relier la situation actuelle aux schémas récurrents, sans surinterprétation.";

  return `${lead} ${themesLine} ${guidance}`;
}

export async function getLongMemorySettings(userId: string): Promise<LongMemorySettings> {
  const settingsRef = db.collection("users").doc(userId).collection("settings").doc("memory");
  const snapshot = await settingsRef.get();
  if (!snapshot.exists) {
    return { enabled: true };
  }
  const data = snapshot.data() || {};
  return {
    enabled: data.enabled !== false,
    updatedAt: asDate(data.updatedAt),
  };
}

export async function setLongMemoryEnabled(userId: string, enabled: boolean) {
  const settingsRef = db.collection("users").doc(userId).collection("settings").doc("memory");
  await settingsRef.set(
    {
      enabled,
      updatedAt: new Date(),
    },
    { merge: true }
  );
  return { enabled };
}

async function getEntriesForMemory(userId: string, maxEntries: number) {
  const snapshot = await db
    .collection("users")
    .doc(userId)
    .collection("entries")
    .orderBy("createdAt", "desc")
    .limit(maxEntries)
    .get();

  const entries: RawEntry[] = [];
  let encryptedEntriesSkipped = 0;

  for (const doc of snapshot.docs) {
    const data = doc.data();
    const createdAt = asDate(data.createdAt) || new Date();
    const content = typeof data.content === "string" ? data.content.trim() : "";
    const encryptedContent = typeof data.encryptedContent === "string" ? data.encryptedContent : "";

    if (!content && encryptedContent) {
      encryptedEntriesSkipped += 1;
      continue;
    }
    if (!content) continue;

    entries.push({
      id: doc.id,
      content,
      tags: Array.isArray(data.tags) ? data.tags.filter(Boolean) : [],
      mood: typeof data.mood === "string" ? data.mood : null,
      createdAt,
    });
  }

  return { entries, encryptedEntriesSkipped };
}

export async function rebuildLongMemory(
  userId: string,
  options?: { maxEntries?: number; reason?: string; force?: boolean }
): Promise<LongMemoryProfile | null> {
  const settings = await getLongMemorySettings(userId);
  if (!settings.enabled && !options?.force) {
    return null;
  }

  const maxEntries = options?.maxEntries ?? DEFAULT_MAX_ENTRIES;
  const { entries, encryptedEntriesSkipped } = await getEntriesForMemory(userId, maxEntries);

  const tagsCounter = new Map<string, number>();
  const moodCounter = new Map<string, number>();
  for (const entry of entries) {
    for (const tag of entry.tags) {
      const normalized = String(tag).trim().toLowerCase();
      if (!normalized) continue;
      tagsCounter.set(normalized, (tagsCounter.get(normalized) ?? 0) + 1);
    }
    if (entry.mood) {
      const mood = entry.mood.trim().toLowerCase();
      if (mood) moodCounter.set(mood, (moodCounter.get(mood) ?? 0) + 1);
    }
  }

  const topTags = topN(tagsCounter, 8).map(([tag, count]) => ({ tag, count }));
  const topMoods = topN(moodCounter, 6).map(([mood, count]) => ({ mood, count }));
  const keyThemes = extractThemes(entries, 6);
  const summary = summarize(entries, keyThemes);

  const profile: LongMemoryProfile = {
    version: MEMORY_VERSION,
    enabled: settings.enabled,
    totalEntries: entries.length + encryptedEntriesSkipped,
    analyzedEntries: entries.length,
    encryptedEntriesSkipped,
    firstEntryAt: entries.length > 0 ? entries[entries.length - 1].createdAt.toISOString() : null,
    lastEntryAt: entries.length > 0 ? entries[0].createdAt.toISOString() : null,
    topTags,
    topMoods,
    keyThemes,
    summary,
    updatedAt: new Date().toISOString(),
  };

  const memoryRef = db.collection("users").doc(userId).collection("derivedMemory");
  await memoryRef.doc("profile").set(
    {
      ...profile,
      reason: options?.reason ?? "manual",
      updatedAt: new Date(),
    },
    { merge: true }
  );

  const snapshotId = new Date().toISOString().slice(0, 10);
  await memoryRef.doc(`snapshot-${snapshotId}`).set(
    {
      ...profile,
      snapshotAt: new Date(),
      reason: options?.reason ?? "manual",
    },
    { merge: true }
  );

  return profile;
}

export async function getLongMemoryProfile(userId: string): Promise<LongMemoryProfile | null> {
  const settings = await getLongMemorySettings(userId);
  if (!settings.enabled) return null;

  const ref = db.collection("users").doc(userId).collection("derivedMemory").doc("profile");
  const snapshot = await ref.get();
  if (!snapshot.exists) return null;
  const data = snapshot.data() || {};

  const profile: LongMemoryProfile = {
    version: (data.version as string) || MEMORY_VERSION,
    enabled: data.enabled !== false,
    totalEntries: Number(data.totalEntries || 0),
    analyzedEntries: Number(data.analyzedEntries || 0),
    encryptedEntriesSkipped: Number(data.encryptedEntriesSkipped || 0),
    firstEntryAt: (data.firstEntryAt as string) || null,
    lastEntryAt: (data.lastEntryAt as string) || null,
    topTags: Array.isArray(data.topTags) ? data.topTags : [],
    topMoods: Array.isArray(data.topMoods) ? data.topMoods : [],
    keyThemes: Array.isArray(data.keyThemes) ? data.keyThemes : [],
    summary: (data.summary as string) || "",
    updatedAt: asDate(data.updatedAt)?.toISOString() || new Date().toISOString(),
  };

  return profile;
}

export async function ensureLongMemoryFresh(userId: string): Promise<LongMemoryProfile | null> {
  const current = await getLongMemoryProfile(userId);
  if (!current) {
    return rebuildLongMemory(userId, { reason: "bootstrap" });
  }

  const updatedAt = new Date(current.updatedAt);
  const staleMs = MEMORY_STALE_HOURS * 60 * 60 * 1000;
  const isStale = Date.now() - updatedAt.getTime() > staleMs;
  if (!isStale) return current;

  return rebuildLongMemory(userId, { reason: "stale_refresh" });
}

export function buildLongMemoryPrompt(profile: LongMemoryProfile | null) {
  if (!profile) return "";

  const tags = profile.topTags.slice(0, 5).map((item) => `${item.tag}(${item.count})`).join(", ");
  const moods = profile.topMoods.slice(0, 5).map((item) => `${item.mood}(${item.count})`).join(", ");
  const themes = profile.keyThemes.slice(0, 6).join(", ");

  return [
    "Contexte memoire longue utilisateur (prive):",
    `- Entrees analysees: ${profile.analyzedEntries}/${profile.totalEntries}`,
    `- Periode: ${profile.firstEntryAt || "n/a"} -> ${profile.lastEntryAt || "n/a"}`,
    `- Tags dominants: ${tags || "n/a"}`,
    `- Moods dominants: ${moods || "n/a"}`,
    `- Themes recurrents: ${themes || "n/a"}`,
    `- Synthese: ${profile.summary || "n/a"}`,
    "Instruction: utilise ce contexte pour offrir de la profondeur historique, sans affirmer de causalite certaine.",
  ].join("\n");
}
