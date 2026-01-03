

export type JournalEntry = {
  id: string;
  userId: string;
  content: string;
  tags: string[];
  createdAt: Date;
  sentiment: string;
  mood: string;
  insight: string;
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
}

export type UserProfile = {
    uid: string;
    email?: string | null;
    displayName?: string | null;
    photoURL?: string | null;
    createdAt: Date;
    insights?: UserInsights;
    entryCount?: number;
}
