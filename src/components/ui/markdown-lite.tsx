"use client";

import { parseMarkdownLiteInline, splitMarkdownLiteParagraphs } from "@/lib/markdown-lite";

type MarkdownLiteProps = {
  content: string;
  className?: string;
};

export function MarkdownLite({ content, className }: MarkdownLiteProps) {
  const paragraphs = splitMarkdownLiteParagraphs(content);

  return (
    <div className={className}>
      {paragraphs.map((paragraph, paragraphIndex) => (
        <p key={paragraphIndex}>
          {parseMarkdownLiteInline(paragraph).map((segment, segmentIndex) =>
            segment.bold ? (
              <strong key={segmentIndex} className="font-semibold text-stone-900">
                {segment.text}
              </strong>
            ) : (
              <span key={segmentIndex}>{segment.text}</span>
            )
          )}
        </p>
      ))}
    </div>
  );
}
