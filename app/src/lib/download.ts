import { ContentItem } from './api/SchemaApi';
import { toISODateString } from '@/utils/date';

type ExportFormat = 'csv' | 'json' | 'jsonl';

const flattenObject = (
  obj: Record<string, unknown>,
  prefix = ''
): Record<string, string> => {
  const flattened: Record<string, string> = {};

  for (const key in obj) {
    if (obj[key] === null || obj[key] === undefined) continue;
    
    const newKey = prefix ? `${prefix}.${key}` : key;
    
    if (typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
      Object.assign(flattened, flattenObject(obj[key], newKey));
    } else {
      flattened[newKey] = Array.isArray(obj[key]) ? JSON.stringify(obj[key]) : String(obj[key]);
    }
  }

  return flattened;
};

const convertToCSV = (items: ContentItem[]): string => {
  // Flatten all items to get all possible columns
  const flattenedItems = items.map(item => flattenObject(item));
  const allColumns = new Set<string>();
  flattenedItems.forEach(item => {
    Object.keys(item).forEach(key => allColumns.add(key));
  });
  
  // Convert to array and sort for consistent column order
  const headers = Array.from(allColumns).sort();
  
  // Create rows with all columns
  const rows = flattenedItems.map(item =>
    headers.map(header => {
      const value = item[header] || '';
      return value.includes(',') ? `"${value.replace(/"/g, '""')}"` : value;
    }).join(',')
  );
  
  return [headers.join(','), ...rows].join('\n');
};

const downloadBlob = (blob: Blob, filename: string) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

export const downloadContent = async (items: ContentItem[], format: ExportFormat): Promise<void> => {
  const timestamp = toISODateString();
  
  let content: string;
  let mimeType: string;
  let extension: string;
  
  switch (format) {
    case 'csv':
      content = convertToCSV(items);
      mimeType = 'text/csv';
      extension = 'csv';
      break;
      
    case 'jsonl':
      content = items.map(item => JSON.stringify(item)).join('\n');
      mimeType = 'application/x-jsonlines';
      extension = 'jsonl';
      break;
      
    case 'json':
      content = JSON.stringify(items, null, 2);
      mimeType = 'application/json';
      extension = 'json';
      break;
      
    default:
      throw new Error(`Unsupported format: ${format}`);
  }
  
  const blob = new Blob([content], { type: mimeType });
  downloadBlob(blob, `content-export-${timestamp}.${extension}`);
}; 
