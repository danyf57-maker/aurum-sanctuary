
import { JournalEntry } from "@/lib/types";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Smile, Meh, Frown, Sparkles } from 'lucide-react';

type JournalCardProps = {
  entry: JournalEntry;
  style?: React.CSSProperties;
  className?: string;
};

function SentimentIcon({ sentiment }: { sentiment: string }) {
  switch (sentiment?.toLowerCase()) {
    case 'positive':
      return <Smile className="h-5 w-5 text-green-600 dark:text-green-500" />;
    case 'negative':
      return <Frown className="h-5 w-5 text-red-600 dark:text-red-500" />;
    default:
      return <Meh className="h-5 w-5 text-yellow-600 dark:text-yellow-500" />;
  }
}

export function JournalCard({ entry, style, className }: JournalCardProps) {
  const formattedDate = new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'long',
  }).format(new Date(entry.createdAt));

  const translatedSentiment = (sentiment: string) => {
    switch(sentiment?.toLowerCase()) {
      case 'positive': return 'Positif';
      case 'negative': return 'Négatif';
      case 'neutral': return 'Neutre';
      default: return sentiment;
    }
  }

  return (
    <Card className={`flex flex-col justify-between transition-all hover:shadow-md ${className}`} style={style}>
      <div>
        <CardHeader>
          <div className="flex justify-between items-start gap-4">
              <CardTitle className="text-base font-medium font-body text-muted-foreground">{formattedDate}</CardTitle>
              <div className="flex items-center gap-2 flex-shrink-0">
                  <SentimentIcon sentiment={entry.sentiment} />
                  <span className="text-sm font-semibold capitalize text-muted-foreground">{translatedSentiment(entry.sentiment)}</span>
              </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="line-clamp-4 text-foreground/80">
            {entry.content}
          </p>
          {entry.insight && (
             <div className="flex items-start gap-3 mt-4 pt-4 border-t border-dashed">
                <Sparkles className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <p className="font-body text-sm text-amber-700 italic">{entry.insight}</p>
              </div>
          )}
        </CardContent>
      </div>
      <CardFooter>
        <div className="flex flex-wrap gap-2">
            {entry.tags.map(tag => (
                <Badge key={tag} variant="secondary" className="font-normal capitalize">{tag}</Badge>
            ))}
        </div>
      </CardFooter>
    </Card>
  );
}
