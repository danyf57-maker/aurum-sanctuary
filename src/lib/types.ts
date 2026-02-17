export type JournalEntry = {
  id: string;
  userId: string;
  content: string;
  encryptedContent?: string;
  tags: string[];
  createdAt: Date;
  sentiment: string;
  mood: string;
  insight: string;
  images?: { url: string; caption?: string }[];
};

export type PublicPost = {
  id: string;
  userId: string;
  title: string;
  content: string;
  slug: string;
  tags: string[];
  publishedAt: Date;
  isPublic: boolean;
};

export type UserInsights = {
  mainTheme: string;
  recurringPatterns: string;
  gentleAdvice: string;
  lastUpdatedAt: Date;
};

export type RyffDimensionScores = {
  acceptationDeSoi: number;
  developpementPersonnel: number;
  sensDeLaVie: number;
  maitriseEnvironnement: number;
  autonomie: number;
  relationsPositives: number;
};

export type WellbeingScore = {
  id?: string;
  source: 'ai' | 'questionnaire' | 'combined';
  computedAt: Date;
  entryCount?: number;
  scores: RyffDimensionScores;
  aiConfidence?: number;
  narrative?: string;
};

export type PersonalityScores = {
  determination: number;
  influence: number;
  stabilite: number;
  rigueur: number;
};

export type PersonalityResult = {
  id?: string;
  source: 'ai' | 'questionnaire' | 'combined';
  computedAt: Date;
  entryCount?: number;
  scores: PersonalityScores;
  archetype?: string;
  aiConfidence?: number;
  narrative?: string;
};

export type UserProfile = {
  uid: string;
  email?: string | null;
  displayName?: string | null;
  photoURL?: string | null;
  createdAt: Date;
  insights?: UserInsights;
  entryCount?: number;
};
