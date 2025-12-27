import { JournalEntry } from "@/lib/types";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Smile, Meh, Frown } from 'lucide-react';

type JournalCardProps = {
  entry: JournalEntry;
  style?: React.CSSProperties;
  className?: string;
};

function SentimentIcon({ sentiment }: { sentiment: string }) {
  switch (sentiment.toLowerCase()) {
    case 'positive':
      return <Smile className="h-5 w-5 text-green-600 dark:text-green-500" />;
    case 'negative':
      return <Frown className="h-5 w-5 text-red-600 dark:text-red-500" />;
    default:
      return <Meh className="h-5 w-5 text-yellow-600 dark:text-yellow-500" />;
  }
}

export function JournalCard({ entry, style, className }: JournalCardProps) {
  const formattedDate = new Intl.DateTimeFormat('en-US', {
    dateStyle: 'long',
  }).format(new Date(entry.createdAt));

  return (
    <Card className={`flex flex-col transition-all hover:shadow-md ${className}`} style={style}>
      <CardHeader>
        <div className="flex justify-between items-start gap-4">
            <CardTitle className="text-base font-medium font-body text-muted-foreground">{formattedDate}</CardTitle>
            <div className="flex items-center gap-2 flex-shrink-0">
                <SentimentIcon sentiment={entry.sentiment} />
                <span className="text-sm font-semibold capitalize text-muted-foreground">{entry.sentiment}</span>
            </div>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="line-clamp-4 text-foreground/80">
          {entry.content}
        </p>
      </CardContent>
      <CardFooter>
        <div className="flex flex-wrap gap-2">
            {entry.tags.map(tag => (
                <Badge key={tag} variant="secondary" className="font-normal">{tag}</Badge>
            ))}
        </div>
      </CardFooter>
    </Card>
  );
}
