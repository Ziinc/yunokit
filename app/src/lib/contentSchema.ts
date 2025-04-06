import React from 'react';

export type ContentFieldType = 
  | 'text'
  | 'number'
  | 'date'
  | 'boolean'
  | 'enum'
  | 'relation'
  | 'image'
  | 'markdown'
  | 'json';

export interface ContentField {
  id: string;
  name: string;
  type: ContentFieldType;
  required?: boolean;
  description?: string;
  defaultValue?: any;
  options?: string[]; // For enum fields
  relationSchemaId?: string; // For relation fields
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
  icon?: React.ReactNode;
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
    id: 'blog',
    name: 'Blog Post',
    description: 'A blog post with markdown content',
    isCollection: true,
    schemaType: 'collection',
    fields: [
      {
        id: 'title',
        name: 'Title',
        type: 'text',
        required: true,
      },
      {
        id: 'content',
        name: 'Content',
        type: 'markdown',
        required: true,
      },
      {
        id: 'published',
        name: 'Published',
        type: 'boolean',
        defaultValue: false,
      },
      {
        id: 'category',
        name: 'Category',
        type: 'enum',
        options: ['Technology', 'Design', 'Business'],
      },
      {
        id: 'thumbnail',
        name: 'Thumbnail',
        type: 'image',
      }
    ]
  },
  {
    id: 'author',
    name: 'Author',
    description: 'Author profile information',
    isCollection: true,
    schemaType: 'collection',
    fields: [
      {
        id: 'name',
        name: 'Name',
        type: 'text',
        required: true,
      },
      {
        id: 'bio',
        name: 'Biography',
        type: 'markdown',
      },
      {
        id: 'avatar',
        name: 'Avatar',
        type: 'image',
      },
      {
        id: 'social',
        name: 'Social Links',
        type: 'json',
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
        type: 'text',
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
        type: 'text',
        required: true,
      },
      {
        id: 'content',
        name: 'Page Content',
        type: 'markdown',
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
        id: 'thumbnail',
        name: 'Thumbnail',
        type: 'image',
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
