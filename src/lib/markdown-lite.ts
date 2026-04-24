export type MarkdownLiteSegment = {
  text: string;
  bold: boolean;
};

export function parseMarkdownLiteInline(input: string): MarkdownLiteSegment[] {
  const segments: MarkdownLiteSegment[] = [];
  let cursor = 0;

  while (cursor < input.length) {
    const start = input.indexOf("**", cursor);
    if (start === -1) {
      segments.push({ text: input.slice(cursor), bold: false });
      break;
    }

    const end = input.indexOf("**", start + 2);
    if (end === -1) {
      segments.push({ text: input.slice(cursor), bold: false });
      break;
    }

    if (start > cursor) {
      segments.push({ text: input.slice(cursor, start), bold: false });
    }

    const boldText = input.slice(start + 2, end);
    if (boldText) {
      segments.push({ text: boldText, bold: true });
    }
    cursor = end + 2;
  }

  return segments.filter((segment) => segment.text.length > 0);
}

export function splitMarkdownLiteParagraphs(input: string): string[] {
  return input
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}
