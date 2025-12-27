
export type JournalEntry = {
  id: string;
  userId: string;
  content: string;
  tags: string[];
  createdAt: Date;
  sentiment: string;
  sentimentScore: number;
};
