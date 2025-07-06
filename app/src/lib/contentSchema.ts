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
  isCollection?: boolean;
  schemaType?: 'collection' | 'single';
  type: 'collection' | 'single';
  fields: any[];
  createdAt?: string;
  updatedAt?: string;
  isArchived?: boolean;
}

// Add content item status type
export type ContentItemStatus = 'draft' | 'pending_review' | 'published';

// Content item interface
export interface ContentItem {
  id: string;
  title: string;
  schemaId: string;
  status: 'published' | 'draft' | 'pending_review';
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  createdBy?: string;
  updatedBy?: string;
  icon?: string;
  data: Record<string, any>;
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
    type: 'collection',
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
    type: 'collection',
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
    type: 'collection',
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
    type: 'single',
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
