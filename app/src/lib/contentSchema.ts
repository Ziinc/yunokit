export type ContentFieldType = 
  | 'markdown'
  | 'json'
  | 'block'
  | 'boolean'
  | 'enum'
  | 'multiselect'
  | 'relation'
  | 'datetime'  // New type
  | 'email'     // New type
  | 'password'  // New type
  | 'map'       // New type for geo location
  | 'uuid'      // New type
  | 'asset';    // New type for asset library integration

export interface ContentField {
  id: string;
  name: string;
  type: ContentFieldType;
  required?: boolean;
  description?: string;
  defaultValue?: any;
  options?: string[]; // For enum and multiselect fields
  relationTarget?: string; // For relation fields - the schema ID this field relates to
  isMultiple?: boolean; // For relation fields - if multiple related items can be selected
  generateOnCreate?: boolean; // For UUID fields - automatically generate on creation
  isSecret?: boolean; // For password fields - whether to mask in the UI
  mapConfig?: {
    defaultZoom?: number;
    defaultCenter?: [number, number]; // [latitude, longitude]
  }; // For map fields
  assetTypes?: string[]; // For asset fields - limit to specific file types
}

export interface ContentSchema {
  id: string;
  name: string;
  description?: string;
  fields: ContentField[];
  isCollection: boolean;
  isArchived?: boolean;
  createdAt?: string;
  updatedAt?: string;
  schemaType?: 'collection' | 'single';
}

// Add content item status type
export type ContentItemStatus = 'draft' | 'pending_review' | 'published';

// Content item interface
export interface ContentItem {
  id: string;
  schemaId: string;
  title: string; // Display title
  content?: Record<string, any>; // Backward compatibility field name
  data?: Record<string, any>; // New field name for schema-specific content
  status: ContentItemStatus;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  createdBy?: string;
  updatedBy?: string;
  publishedBy?: string;
  comments?: ContentItemComment[];
  // Review-related fields at the top level
  reviewStatus?: 'awaiting_review' | 'changes_requested' | 'approved';
  reviewRequestedAt?: string;
  reviewRequestedBy?: string;
  reviewedAt?: string;
  reviewedBy?: string;
  reviewComments?: string;
  // Additional fields for search functionality
  type?: string;
  lastUpdated?: string;
  tags?: string[];
  author?: {
    name: string;
    avatar: string;
  };
}

// Comment interface for review process
export interface ContentItemComment {
  id: string;
  contentItemId: string;
  userId: string;
  userName: string;
  text: string;
  createdAt: string;
  fieldId?: string; // Optional - if comment is about a specific field
  resolved?: boolean;
}

// Example schemas
export const exampleSchemas: ContentSchema[] = [
  {
    id: 'blog-post',
    name: 'Blog Post',
    description: 'A single blog post with markdown content',
    isCollection: true,
    schemaType: 'collection',
    fields: [
      {
        id: 'title',
        name: 'Title',
        type: 'markdown',
        required: true,
      },
      {
        id: 'content',
        name: 'Content',
        type: 'markdown',
        required: true,
      },
      {
        id: 'featured',
        name: 'Featured',
        type: 'boolean',
        defaultValue: false,
      },
      {
        id: 'category',
        name: 'Category',
        type: 'enum',
        options: ['Technology', 'Design', 'Marketing', 'Business'],
      },
      {
        id: 'tags',
        name: 'Tags',
        type: 'multiselect',
        options: ['React', 'JavaScript', 'CSS', 'TypeScript', 'UI/UX', 'Performance', 'Accessibility'],
      },
      {
        id: 'related_posts',
        name: 'Related Posts',
        type: 'relation',
        relationTarget: 'blog-post',
        isMultiple: true,
      },
      {
        id: 'publishDate',
        name: 'Publish Date',
        type: 'datetime',
        defaultValue: new Date().toISOString(),
      },
      {
        id: 'author_email',
        name: 'Author Email',
        type: 'email',
      },
      {
        id: 'featuredImage',
        name: 'Featured Image',
        type: 'asset',
        assetTypes: ['image/jpeg', 'image/png', 'image/webp'],
      }
    ]
  },
  {
    id: 'product-catalog',
    name: 'Product Catalog',
    description: 'A collection of products with JSON data',
    isCollection: true,
    schemaType: 'collection',
    fields: [
      {
        id: 'name',
        name: 'Product Name',
        type: 'markdown',
        required: true,
      },
      {
        id: 'details',
        name: 'Product Details',
        type: 'json',
        required: true,
      },
      {
        id: 'inStock',
        name: 'In Stock',
        type: 'boolean',
        defaultValue: true,
      },
      {
        id: 'productType',
        name: 'Product Type',
        type: 'enum',
        options: ['Physical', 'Digital', 'Subscription'],
      },
      {
        id: 'features',
        name: 'Features',
        type: 'multiselect',
        options: ['Premium', 'Discounted', 'Limited Edition', 'Bestseller', 'New Arrival'],
      },
      {
        id: 'productId',
        name: 'Product ID',
        type: 'uuid',
        generateOnCreate: true,
      },
      {
        id: 'storeLocation',
        name: 'Store Location',
        type: 'map',
        mapConfig: {
          defaultZoom: 13,
          defaultCenter: [40.7128, -74.0060], // New York
        }
      }
    ]
  },
  {
    id: 'page-builder',
    name: 'Page Builder',
    description: 'A flexible page builder with block content',
    isCollection: false,
    schemaType: 'single',
    fields: [
      {
        id: 'title',
        name: 'Page Title',
        type: 'markdown',
        required: true,
      },
      {
        id: 'content',
        name: 'Page Content',
        type: 'block',
        required: true,
      },
      {
        id: 'published',
        name: 'Published',
        type: 'boolean',
        defaultValue: false,
      },
      {
        id: 'layout',
        name: 'Layout',
        type: 'enum',
        options: ['Full Width', 'Sidebar Left', 'Sidebar Right', 'Two Column'],
      },
      {
        id: 'components',
        name: 'Components',
        type: 'multiselect',
        options: ['Header', 'Footer', 'Hero', 'Gallery', 'Contact Form', 'Testimonials'],
      },
      {
        id: 'background',
        name: 'Background Image',
        type: 'asset',
        assetTypes: ['image/*'],
      },
      {
        id: 'lastModified',
        name: 'Last Modified',
        type: 'datetime',
      }
    ]
  }
];

// Mock content items
export const mockContentItems: ContentItem[] = [
  {
    id: '1',
    schemaId: 'blog-post',
    title: 'Getting Started with React',
    content: {
      title: 'Getting Started with React',
      content: '# Introduction to React\n\nReact is a JavaScript library for building user interfaces...',
      featured: true,
      category: 'Technology',
      tags: ['React', 'JavaScript'],
    },
    status: 'published',
    createdAt: '2023-10-15T08:00:00Z',
    updatedAt: '2023-10-15T10:30:00Z',
    publishedAt: '2023-10-16T09:00:00Z',
    createdBy: 'alex@example.com',
    updatedBy: 'alex@example.com',
    publishedBy: 'sarah@example.com',
  },
  {
    id: '2',
    schemaId: 'blog-post',
    title: 'Advanced TypeScript Tips',
    content: {
      title: 'Advanced TypeScript Tips',
      content: '# TypeScript Pro Tips\n\nHere are some advanced techniques...',
      featured: false,
      category: 'Technology',
      tags: ['TypeScript', 'JavaScript'],
    },
    status: 'draft',
    createdAt: '2023-10-17T14:20:00Z',
    updatedAt: '2023-10-17T16:45:00Z',
    createdBy: 'alex@example.com',
    updatedBy: 'alex@example.com',
  },
  {
    id: '3',
    schemaId: 'blog-post',
    title: 'UI Design Principles',
    content: {
      title: 'UI Design Principles',
      content: '# Fundamental UI Design Principles\n\nConsistency, feedback, and simplicity...',
      featured: true,
      category: 'Design',
      tags: ['UI/UX', 'Design'],
    },
    status: 'pending_review',
    createdAt: '2023-10-18T09:15:00Z',
    updatedAt: '2023-10-18T11:30:00Z',
    createdBy: 'sarah@example.com',
    updatedBy: 'sarah@example.com',
    comments: [
      {
        id: 'c1',
        contentItemId: '3',
        userId: 'user123',
        userName: 'Alex',
        text: 'The design principles section needs more examples.',
        createdAt: '2023-10-18T12:00:00Z',
        fieldId: 'content',
        resolved: false
      }
    ]
  }
];
