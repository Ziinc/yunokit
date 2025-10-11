// Date utilities for consistent formatting

// Returns YYYY-MM-DD from a Date or ISO string. Defaults to today.
export const toISODateString = (input?: Date | string | number): string => {
  const d = input === undefined ? new Date() : (typeof input === 'string' || typeof input === 'number') ? new Date(input) : input;
  if (isNaN(d.getTime())) return '';
  return d.toISOString().split('T')[0];
};

// Returns a full ISO timestamp consistently
export const nowISO = (): string => new Date().toISOString();

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

