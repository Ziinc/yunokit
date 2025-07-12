import { ContentItem } from "@/lib/contentSchema";

export const getUniqueAuthors = (items: any[]): string[] => {
  // Handle case where items might not be an array
  if (!Array.isArray(items)) {
    return [];
  }

  return Array.from(
    new Set(
      items
        .map(item => item.createdBy || item.created_by || item.user_id || 'Unknown')
        .filter(Boolean) as string[]
    )
  );
};

export const paginateItems = (
  items: ContentItem[],
  currentPage: number,
  itemsPerPage: number
): ContentItem[] => {
  // Handle case where items might not be an array
  if (!Array.isArray(items)) {
    return [];
  }
  
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  return items.slice(startIndex, endIndex);
};
