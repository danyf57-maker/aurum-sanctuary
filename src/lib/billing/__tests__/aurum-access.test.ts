import { describe, expect, it } from 'vitest';
import { getFreeAurumConversationState, getFreeEntryState } from '../free-limits';

describe('aurum access helpers', () => {
  it('keeps the free topic limit at five', () => {
    expect(getFreeEntryState({ entryCount: 0 })).toEqual({
      entriesUsed: 0,
      entriesLimit: 5,
      hasReachedLimit: false,
    });

    expect(getFreeEntryState({ entryCount: 5 })).toEqual({
      entriesUsed: 5,
      entriesLimit: 5,
      hasReachedLimit: true,
    });
  });

  it('allows eight Aurum replies per topic', () => {
    expect(getFreeAurumConversationState({ aurumReplyCount: 0 })).toEqual({
      repliesUsed: 0,
      repliesLimit: 8,
      repliesRemaining: 8,
      hasReachedLimit: false,
    });

    expect(getFreeAurumConversationState({ aurumReplyCount: 1 })).toEqual({
      repliesUsed: 1,
      repliesLimit: 8,
      repliesRemaining: 7,
      hasReachedLimit: false,
    });

    expect(getFreeAurumConversationState({ aurumReplyCount: 8 })).toEqual({
      repliesUsed: 8,
      repliesLimit: 8,
      repliesRemaining: 0,
      hasReachedLimit: true,
    });
  });
});
