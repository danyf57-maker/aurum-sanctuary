import { describe, expect, it } from "vitest";
import { extractSseDataMessages, flushSseDataMessages } from "@/lib/sse";

describe("SSE data parser", () => {
  it("keeps a split data event until the complete delimiter arrives", () => {
    const first = extractSseDataMessages("", 'data: {"token":"bon');

    expect(first.messages).toEqual([]);
    expect(first.remainder).toBe('data: {"token":"bon');

    const second = extractSseDataMessages(first.remainder, 'jour"}\n\n');

    expect(second.messages).toEqual(['{"token":"bonjour"}']);
    expect(second.remainder).toBe("");
  });

  it("flushes a final unterminated data event", () => {
    expect(flushSseDataMessages('data: {"done":true}\n')).toEqual(['{"done":true}']);
  });
});
