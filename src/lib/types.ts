

export type JournalEntry = {
  id: string;
  userId: string;
  content: string;
  tags: string[];
  createdAt: Date;
  sentiment: string;
  sentimentScore: number;
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
