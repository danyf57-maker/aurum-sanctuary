export function extractSseDataMessages(
  previousRemainder: string,
  chunk: string
): { messages: string[]; remainder: string } {
  const combined = previousRemainder + chunk;
  const normalized = combined.replace(/\r\n/g, "\n");
  const events = normalized.split("\n\n");
  const remainder = events.pop() ?? "";

  const messages = events.flatMap((event) => {
    const dataLines = event
      .split("\n")
      .filter((line) => line.startsWith("data: "))
      .map((line) => line.slice(6).trim());

    return dataLines.length > 0 ? [dataLines.join("\n")] : [];
  });

  return { messages, remainder };
}

export function flushSseDataMessages(remainder: string): string[] {
  const dataLines = remainder
    .replace(/\r\n/g, "\n")
    .split("\n")
    .filter((line) => line.startsWith("data: "))
    .map((line) => line.slice(6).trim());

  return dataLines.length > 0 ? [dataLines.join("\n")] : [];
}
