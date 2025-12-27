"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

type TagFilterProps = {
  tags: string[];
};

export function TagFilter({ tags }: TagFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentTag = searchParams.get("tag");

  const onSelectTag = (tag: string) => {
    if (tag === "all") {
      router.push("/sanctuary");
    } else {
      router.push(`/sanctuary?tag=${tag}`);
    }
  };

  if (tags.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      <Select value={currentTag ?? 'all'} onValueChange={onSelectTag}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Filter by tag..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Tags</SelectItem>
          {tags.map((tag) => (
            <SelectItem key={tag} value={tag} className="capitalize">
              {tag}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {currentTag && (
        <Button variant="ghost" size="icon" onClick={() => onSelectTag('all')}>
          <X className="h-4 w-4" />
          <span className="sr-only">Clear filter</span>
        </Button>
      )}
    </div>
  );
}
