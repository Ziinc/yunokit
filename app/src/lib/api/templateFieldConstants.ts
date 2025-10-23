/**
 * Common field patterns for template generation
 * Reduces duplication across different template types
 */

interface FieldBase {
  id: string;
  name: string;
  type: string;
  required?: boolean;
  defaultValue?: string | number | boolean | null;
  assetTypes?: string[];
  isMultiple?: boolean;
  description?: string;
  relationTarget?: string;
  options?: string[];
}

// Common asset types
export const IMAGE_ASSET_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

// Common boolean fields with default values
export const COMMON_BOOLEAN_FIELDS = {
  featured: (entity: string): FieldBase => ({
    id: 'featured',
    name: `Featured ${entity}`,
    type: 'boolean',
    defaultValue: false
  }),

  published: (): FieldBase => ({
    id: 'published',
    name: 'Published',
    type: 'boolean',
    defaultValue: false
  }),

  approved: (): FieldBase => ({
    id: 'approved',
    name: 'Approved',
    type: 'boolean',
    defaultValue: false
  }),

  inStock: (): FieldBase => ({
    id: 'inStock',
    name: 'In Stock',
    type: 'boolean',
    defaultValue: true
  }),

  active: (): FieldBase => ({
    id: 'active',
    name: 'Active',
    type: 'boolean',
    defaultValue: true
  })
} as const;

// Common metadata fields
export const COMMON_METADATA_FIELDS = {
  publishDate: (required = false): FieldBase => ({
    id: 'publishDate',
    name: 'Publish Date',
    type: 'datetime',
    defaultValue: new Date().toISOString(),
    required
  })
} as const;

// Common content fields
export const COMMON_CONTENT_FIELDS = {
  name: (required = true): FieldBase => ({
    id: 'name',
    name: 'Name',
    type: 'markdown',
    required
  }),

  title: (required = true): FieldBase => ({
    id: 'title',
    name: 'Title',
    type: 'markdown',
    required
  }),

  description: (required = false): FieldBase => ({
    id: 'description',
    name: 'Description',
    type: 'markdown',
    required
  }),

  content: (required = true): FieldBase => ({
    id: 'content',
    name: 'Content',
    type: 'markdown',
    required
  }),

  excerpt: (required = false): FieldBase => ({
    id: 'excerpt',
    name: 'Excerpt',
    type: 'markdown',
    required
  }),

  featuredImage: (): FieldBase => ({
    id: 'featuredImage',
    name: 'Featured Image',
    type: 'asset',
    assetTypes: IMAGE_ASSET_TYPES
  }),

  images: (): FieldBase => ({
    id: 'images',
    name: 'Images',
    type: 'asset',
    assetTypes: IMAGE_ASSET_TYPES,
    isMultiple: true
  }),

  avatar: (): FieldBase => ({
    id: 'avatar',
    name: 'Avatar',
    type: 'asset',
    assetTypes: IMAGE_ASSET_TYPES
  })
} as const;

// Helper function to create relation fields
export const createRelationField = (
  id: string,
  name: string,
  target: string,
  required = false,
  isMultiple = false
): FieldBase => ({
  id,
  name,
  type: 'relation',
  relationTarget: target,
  required,
  isMultiple
});

// Helper function to create enum fields
export const createEnumField = (
  id: string,
  name: string,
  options: string[],
  required = false
): FieldBase => ({
  id,
  name,
  type: 'enum',
  options,
  required
});
