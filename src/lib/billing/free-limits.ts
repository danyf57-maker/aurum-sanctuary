import { FREE_AURUM_REPLY_LIMIT, FREE_ENTRY_LIMIT } from '@/lib/billing/config';

type FreeEntrySnapshot = {
  entryCount?: number;
};

type EntryConversationSnapshot = {
  aurumReplyCount?: number;
};

export function getFreeEntryState(userData: Pick<FreeEntrySnapshot, 'entryCount'>): {
  entriesUsed: number;
  entriesLimit: number;
  hasReachedLimit: boolean;
} {
  const entriesUsed = typeof userData.entryCount === 'number' ? userData.entryCount : 0;

  return {
    entriesUsed,
    entriesLimit: FREE_ENTRY_LIMIT,
    hasReachedLimit: entriesUsed >= FREE_ENTRY_LIMIT,
  };
}

export function getFreeAurumConversationState(
  entryData?: Pick<EntryConversationSnapshot, 'aurumReplyCount'> | null,
): {
  repliesUsed: number;
  repliesLimit: number;
  repliesRemaining: number;
  hasReachedLimit: boolean;
} {
  const repliesUsed = typeof entryData?.aurumReplyCount === 'number' ? entryData.aurumReplyCount : 0;

  return {
    repliesUsed,
    repliesLimit: FREE_AURUM_REPLY_LIMIT,
    repliesRemaining: Math.max(0, FREE_AURUM_REPLY_LIMIT - repliesUsed),
    hasReachedLimit: repliesUsed >= FREE_AURUM_REPLY_LIMIT,
  };
}
