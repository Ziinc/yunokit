/**
 * Formats a date string to a human-readable format
 * Returns '-' for invalid, null, or undefined dates
 */
export const formatDate = (dateString: string | undefined | null): string => {
  if (!dateString) return '-';
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '-';
  
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};
