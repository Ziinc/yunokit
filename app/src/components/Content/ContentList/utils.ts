
import { ContentItem } from "@/lib/contentSchema";

export const getUniqueAuthors = (items: ContentItem[]): string[] => {
  return Array.from(
    new Set(
      items
        .map(item => item.createdBy)
        .filter(Boolean) as string[]
    )
  );
};

export const paginateItems = (
  items: ContentItem[],
  currentPage: number,
  itemsPerPage: number
): ContentItem[] => {
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  return items.slice(startIndex, endIndex);
};
