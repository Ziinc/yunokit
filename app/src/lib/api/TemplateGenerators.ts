import { ContentItem } from "./SchemaApi";
import {
  COMMON_BOOLEAN_FIELDS,
  COMMON_CONTENT_FIELDS,
  COMMON_METADATA_FIELDS,
  COMMON_ENUM_OPTIONS,
  IMAGE_ASSET_TYPES,
  createRelationField,
  createMultiselectField
} from "./templateFieldConstants";
import { generateUUID } from "../utils";

/**
 * Generates a short ID with an optional prefix
 */
function generateShortId(prefix?: string): string {
  const shortId = crypto.randomUUID().slice(0, 8)
  return prefix ? `${prefix}-${shortId}` : shortId
}
import { nowISO } from "@/utils/date";

// Local type for template generation - different from database ContentSchemaRow
interface ContentSchema {
  id: string;
  name: string;
  description: string;
  isCollection?: boolean;
  schemaType?: string;
  fields: Array<{
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
  }>;
}

/**
 * Generate schemas and content items for the ecommerce template
 */
export const generateEcommerceTemplate = (): { schemas: ContentSchema[], contentItems: ContentItem[] } => {
  // Create schemas
  const productSchema: ContentSchema = {
    id: generateShortId('product'),
    name: 'Product',
    description: 'Product catalog with variants, pricing, and inventory',
    isCollection: true,
    schemaType: 'collection',
    fields: [
      { ...COMMON_CONTENT_FIELDS.name(), name: 'Product Name' },
      { ...COMMON_CONTENT_FIELDS.description(), required: true },
      { id: 'price', name: 'Price', type: 'markdown', required: true },
      COMMON_CONTENT_FIELDS.images(),
      COMMON_BOOLEAN_FIELDS.inStock(),
      { id: 'sku', name: 'SKU', type: 'markdown' },
      { id: 'weight', name: 'Weight (kg)', type: 'markdown' },
      { id: 'dimensions', name: 'Dimensions', type: 'json' },
      { id: 'variants', name: 'Variants', type: 'json', description: 'Color, size, etc.' },
      COMMON_BOOLEAN_FIELDS.featured('Product'),
      createRelationField('categoryId', 'Category', 'category')
    ]
  };

  const categorySchema: ContentSchema = {
    id: generateShortId('category'),
    name: 'Category',
    description: 'Product categories and subcategories',
    isCollection: true,
    schemaType: 'collection',
    fields: [
      { ...COMMON_CONTENT_FIELDS.name(), name: 'Category Name' },
      COMMON_CONTENT_FIELDS.description(),
      { id: 'image', name: 'Image', type: 'asset', assetTypes: IMAGE_ASSET_TYPES },
      createRelationField('parentCategory', 'Parent Category', 'category'),
      COMMON_BOOLEAN_FIELDS.featured('Category')
    ]
  };

  const customerSchema: ContentSchema = {
    id: generateShortId('customer'),
    name: 'Customer',
    description: 'Customer profiles and accounts',
    isCollection: true,
    schemaType: 'collection',
    fields: [
      { id: 'firstName', name: 'First Name', type: 'markdown', required: true },
      { id: 'lastName', name: 'Last Name', type: 'markdown', required: true },
      { id: 'email', name: 'Email', type: 'email', required: true },
      { id: 'phone', name: 'Phone', type: 'markdown' },
      { id: 'address', name: 'Address', type: 'json' },
      { id: 'orders', name: 'Orders', type: 'relation', relationTarget: 'order', isMultiple: true },
      { id: 'customerSince', name: 'Customer Since', type: 'datetime', defaultValue: nowISO() }
    ]
  };

  const orderSchema: ContentSchema = {
    id: generateShortId('order'),
    name: 'Order',
    description: 'Customer orders and order history',
    isCollection: true,
    schemaType: 'collection',
    fields: [
      { id: 'orderNumber', name: 'Order Number', type: 'markdown', required: true },
      { id: 'customer', name: 'Customer', type: 'relation', relationTarget: 'customer', required: true },
      { id: 'products', name: 'Products', type: 'relation', relationTarget: 'product', isMultiple: true, required: true },
      { id: 'orderDate', name: 'Order Date', type: 'datetime', defaultValue: nowISO() },
      { id: 'status', name: 'Status', type: 'enum', options: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'] },
      { id: 'totalAmount', name: 'Total Amount', type: 'markdown', required: true },
      { id: 'paymentMethod', name: 'Payment Method', type: 'enum', options: ['Credit Card', 'PayPal', 'Bank Transfer', 'Cash on Delivery'] },
      { id: 'shippingAddress', name: 'Shipping Address', type: 'json' }
    ]
  };

  const cartSchema: ContentSchema = {
    id: generateShortId('cart'),
    name: 'Shopping Cart',
    description: 'Customer shopping cart',
    isCollection: true,
    schemaType: 'collection',
    fields: [
      { id: 'customer', name: 'Customer', type: 'relation', relationTarget: 'customer' },
      { id: 'items', name: 'Cart Items', type: 'json', required: true },
      { id: 'createdAt', name: 'Created At', type: 'datetime', defaultValue: nowISO() },
      { id: 'updatedAt', name: 'Updated At', type: 'datetime', defaultValue: nowISO() },
      { id: 'totalItems', name: 'Total Items', type: 'markdown' },
      { id: 'totalAmount', name: 'Total Amount', type: 'markdown' }
    ]
  };

  // Create sample content items
  const categories: ContentItem[] = [
    {
      id: generateUUID(),
      schemaId: categorySchema.id,
      title: 'Electronics',
      status: 'published',
      createdAt: nowISO(),
      updatedAt: nowISO(),
      publishedAt: nowISO(),
      data: {
        name: 'Electronics',
        description: 'Electronic devices and accessories',
        featured: true
      },
      createdBy: 'admin@example.com',
      updatedBy: 'admin@example.com'
    },
    {
      id: generateUUID(),
      schemaId: categorySchema.id,
      title: 'Clothing',
      status: 'published',
      createdAt: nowISO(),
      updatedAt: nowISO(),
      publishedAt: nowISO(),
      data: {
        name: 'Clothing',
        description: 'Apparel and fashion items',
        featured: true
      },
      createdBy: 'admin@example.com',
      updatedBy: 'admin@example.com',
    }
  ];

  const products: ContentItem[] = [
    {
      id: generateUUID(),
      schemaId: productSchema.id,
      title: 'Wireless Headphones',
      status: 'published',
      createdAt: nowISO(),
      updatedAt: nowISO(),
      publishedAt: nowISO(),
      data: {
        name: 'Wireless Headphones',
        description: 'High-quality wireless headphones with noise cancellation',
        price: '99.99',
        inStock: true,
        sku: 'WH-001',
        featured: true,
        categoryId: categories[0].id
      },
      createdBy: 'admin@example.com',
      updatedBy: 'admin@example.com',
    },
    {
      id: generateUUID(),
      schemaId: productSchema.id,
      title: 'Cotton T-Shirt',
      status: 'published',
      createdAt: nowISO(),
      updatedAt: nowISO(),
      publishedAt: nowISO(),
      data: {
        name: 'Cotton T-Shirt',
        description: 'Comfortable 100% cotton t-shirt',
        price: '24.99',
        inStock: true,
        sku: 'TS-001',
        variants: JSON.stringify({ sizes: ['S', 'M', 'L', 'XL'], colors: ['Black', 'White', 'Gray'] }),
        categoryId: categories[1].id
      },
      createdBy: 'admin@example.com',
      updatedBy: 'admin@example.com',
    }
  ];

  const customers: ContentItem[] = [
    {
      id: generateUUID(),
      schemaId: customerSchema.id,
      title: 'John Doe',
      status: 'published',
      createdAt: nowISO(),
      updatedAt: nowISO(),
      publishedAt: nowISO(),
      data: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '555-123-4567',
        address: JSON.stringify({
          street: '123 Main St',
          city: 'Anytown',
          state: 'CA',
          zip: '12345'
        }),
        customerSince: nowISO()
      },
      createdBy: 'admin@example.com',
      updatedBy: 'admin@example.com',
    }
  ];

  return {
    schemas: [productSchema, categorySchema, customerSchema, orderSchema, cartSchema],
    contentItems: [...categories, ...products, ...customers]
  };
};

/**
 * Generate schemas and content items for the blogging template
 */
export const generateBloggingTemplate = (): { schemas: ContentSchema[], contentItems: ContentItem[] } => {
  // Create schemas
  const postSchema: ContentSchema = {
    id: generateShortId('post'),
    name: 'Blog Post',
    description: 'Blog posts with rich content',
    isCollection: true,
    schemaType: 'collection',
    fields: [
      COMMON_CONTENT_FIELDS.title(),
      COMMON_CONTENT_FIELDS.content(),
      COMMON_CONTENT_FIELDS.excerpt(),
      COMMON_CONTENT_FIELDS.featuredImage(),
      COMMON_METADATA_FIELDS.publishDate(),
      createRelationField('author', 'Author', 'author', true),
      createRelationField('category', 'Category', 'blogCategory'),
      createMultiselectField('tags', 'Tags', [...COMMON_ENUM_OPTIONS.categories.blog]),
      COMMON_BOOLEAN_FIELDS.featured('Post'),
      createRelationField('relatedPosts', 'Related Posts', 'post', false, true)
    ]
  };

  const authorSchema: ContentSchema = {
    id: generateShortId('author'),
    name: 'Author',
    description: 'Blog authors and contributors',
    isCollection: true,
    schemaType: 'collection',
    fields: [
      { id: 'name', name: 'Name', type: 'markdown', required: true },
      { id: 'bio', name: 'Biography', type: 'markdown' },
      { id: 'avatar', name: 'Avatar', type: 'asset', assetTypes: ['image/jpeg', 'image/png', 'image/webp'] },
      { id: 'email', name: 'Email', type: 'email' },
      { id: 'social', name: 'Social Media', type: 'json', description: 'Twitter, LinkedIn, etc.' },
      { id: 'role', name: 'Role', type: 'enum', options: ['Author', 'Editor', 'Contributor', 'Admin'] }
    ]
  };

  const categorySchema: ContentSchema = {
    id: generateShortId('blogCategory'),
    name: 'Blog Category',
    description: 'Blog post categories',
    isCollection: true,
    schemaType: 'collection',
    fields: [
      { id: 'name', name: 'Category Name', type: 'markdown', required: true },
      { id: 'description', name: 'Description', type: 'markdown' },
      { id: 'slug', name: 'Slug', type: 'markdown', required: true },
      { id: 'parent', name: 'Parent Category', type: 'relation', relationTarget: 'blogCategory' },
      { id: 'featuredImage', name: 'Featured Image', type: 'asset', assetTypes: ['image/jpeg', 'image/png', 'image/webp'] }
    ]
  };

  const commentSchema: ContentSchema = {
    id: generateShortId('comment'),
    name: 'Comment',
    description: 'Blog post comments',
    isCollection: true,
    schemaType: 'collection',
    fields: [
      { id: 'post', name: 'Post', type: 'relation', relationTarget: 'post', required: true },
      { id: 'name', name: 'Commenter Name', type: 'markdown', required: true },
      { id: 'email', name: 'Commenter Email', type: 'email', required: true },
      { id: 'content', name: 'Comment', type: 'markdown', required: true },
      { id: 'createdAt', name: 'Created At', type: 'datetime', defaultValue: nowISO() },
      { id: 'approved', name: 'Approved', type: 'boolean', defaultValue: false },
      { id: 'parentComment', name: 'Parent Comment', type: 'relation', relationTarget: 'comment' }
    ]
  };

  // Create sample content items
  const authors: ContentItem[] = [
    {
      id: generateUUID(),
      schemaId: authorSchema.id,
      title: 'Jane Smith',
      status: 'published',
      createdAt: nowISO(),
      updatedAt: nowISO(),
      publishedAt: nowISO(),
      data: {
        name: 'Jane Smith',
        bio: 'Jane is a tech writer with over 10 years of experience in the industry.',
        email: 'jane.smith@example.com',
        role: 'Author'
      },
      createdBy: 'admin@example.com',
      updatedBy: 'admin@example.com',
    }
  ];

  const categories: ContentItem[] = [
    {
      id: generateUUID(),
      schemaId: categorySchema.id,
      title: 'Technology',
      status: 'published',
      createdAt: nowISO(),
      updatedAt: nowISO(),
      publishedAt: nowISO(),
      data: {
        name: 'Technology',
        description: 'Latest tech news and reviews',
        slug: 'technology'
      },
      createdBy: 'admin@example.com',
      updatedBy: 'admin@example.com',
    },
    {
      id: generateUUID(),
      schemaId: categorySchema.id,
      title: 'Design',
      status: 'published',
      createdAt: nowISO(),
      updatedAt: nowISO(),
      publishedAt: nowISO(),
      data: {
        name: 'Design',
        description: 'UI/UX and graphic design',
        slug: 'design'
      },
      createdBy: 'admin@example.com',
      updatedBy: 'admin@example.com',
    }
  ];

  const posts: ContentItem[] = [
    {
      id: generateUUID(),
      schemaId: postSchema.id,
      title: 'Getting Started with React',
      status: 'published',
      createdAt: nowISO(),
      updatedAt: nowISO(),
      publishedAt: nowISO(),
      data: {
        title: 'Getting Started with React',
        content: '# Introduction to React\n\nReact is a JavaScript library for building user interfaces...',
        excerpt: 'Learn the basics of React and how to build your first component.',
        publishDate: nowISO(),
        author: authors[0].id,
        category: categories[0].id,
        tags: ['Technology', 'React'],
        featured: true
      },
      createdBy: 'jane.smith@example.com',
      updatedBy: 'jane.smith@example.com',
    },
    {
      id: generateUUID(),
      schemaId: postSchema.id,
      title: 'UI Design Principles',
      status: 'draft',
      createdAt: nowISO(),
      updatedAt: nowISO(),
      data: {
        title: 'UI Design Principles',
        content: '# Fundamental UI Design Principles\n\nConsistency, feedback, and simplicity...',
        excerpt: 'Learn the key principles of effective UI design.',
        publishDate: nowISO(),
        author: authors[0].id,
        category: categories[1].id,
        tags: ['Design', 'UI/UX']
      },
      createdBy: 'jane.smith@example.com',
      updatedBy: 'jane.smith@example.com'
    }
  ];

  return {
    schemas: [postSchema, authorSchema, categorySchema, commentSchema],
    contentItems: [...authors, ...categories, ...posts]
  };
};

/**
 * Generate schemas and content items for the tutorials template
 */
export const generateTutorialsTemplate = (): { schemas: ContentSchema[], contentItems: ContentItem[] } => {
  // Create schemas
  const courseSchema: ContentSchema = {
    id: generateShortId('course'),
    name: 'Course',
    description: 'Educational courses with modules and lessons',
    isCollection: true,
    schemaType: 'collection',
    fields: [
      { id: 'title', name: 'Title', type: 'markdown', required: true },
      { id: 'description', name: 'Description', type: 'markdown', required: true },
      { id: 'featuredImage', name: 'Featured Image', type: 'asset', assetTypes: ['image/jpeg', 'image/png', 'image/webp'] },
      { id: 'instructor', name: 'Instructor', type: 'relation', relationTarget: 'instructor', required: true },
      { id: 'category', name: 'Category', type: 'enum', options: ['Programming', 'Design', 'Business', 'Marketing', 'Data Science'] },
      { id: 'difficulty', name: 'Difficulty Level', type: 'enum', options: ['Beginner', 'Intermediate', 'Advanced'] },
      { id: 'duration', name: 'Duration (hours)', type: 'markdown' },
      { id: 'price', name: 'Price', type: 'markdown' },
      { id: 'published', name: 'Published', type: 'boolean', defaultValue: false },
      { id: 'requirements', name: 'Requirements', type: 'markdown' },
      { id: 'featured', name: 'Featured Course', type: 'boolean', defaultValue: false }
    ]
  };

  const lessonSchema: ContentSchema = {
    id: generateShortId('lesson'),
    name: 'Lesson',
    description: 'Individual lessons within courses',
    isCollection: true,
    schemaType: 'collection',
    fields: [
      { id: 'title', name: 'Title', type: 'markdown', required: true },
      { id: 'content', name: 'Content', type: 'markdown', required: true },
      { id: 'course', name: 'Course', type: 'relation', relationTarget: 'course', required: true },
      { id: 'module', name: 'Module', type: 'relation', relationTarget: 'module', required: true },
      { id: 'videoUrl', name: 'Video URL', type: 'markdown' },
      { id: 'duration', name: 'Duration (minutes)', type: 'markdown' },
      { id: 'order', name: 'Order', type: 'markdown', required: true },
      { id: 'attachments', name: 'Attachments', type: 'asset', isMultiple: true }
    ]
  };

  const moduleSchema: ContentSchema = {
    id: generateShortId('module'),
    name: 'Module',
    description: 'Course modules containing lessons',
    isCollection: true,
    schemaType: 'collection',
    fields: [
      { id: 'title', name: 'Title', type: 'markdown', required: true },
      { id: 'description', name: 'Description', type: 'markdown' },
      { id: 'course', name: 'Course', type: 'relation', relationTarget: 'course', required: true },
      { id: 'order', name: 'Order', type: 'markdown', required: true }
    ]
  };

  const instructorSchema: ContentSchema = {
    id: generateShortId('instructor'),
    name: 'Instructor',
    description: 'Course instructors and educators',
    isCollection: true,
    schemaType: 'collection',
    fields: [
      { id: 'name', name: 'Name', type: 'markdown', required: true },
      { id: 'bio', name: 'Biography', type: 'markdown', required: true },
      { id: 'avatar', name: 'Avatar', type: 'asset', assetTypes: ['image/jpeg', 'image/png', 'image/webp'] },
      { id: 'email', name: 'Email', type: 'email', required: true },
      { id: 'expertise', name: 'Areas of Expertise', type: 'multiselect', options: ['Web Development', 'Mobile Development', 'UI/UX Design', 'Machine Learning', 'Data Science'] },
      { id: 'social', name: 'Social Media', type: 'json' }
    ]
  };

  const quizSchema: ContentSchema = {
    id: generateShortId('quiz'),
    name: 'Quiz',
    description: 'Assessments for lessons',
    isCollection: true,
    schemaType: 'collection',
    fields: [
      { id: 'title', name: 'Title', type: 'markdown', required: true },
      { id: 'description', name: 'Description', type: 'markdown' },
      { id: 'lesson', name: 'Lesson', type: 'relation', relationTarget: 'lesson', required: true },
      { id: 'questions', name: 'Questions', type: 'json', required: true },
      { id: 'passingScore', name: 'Passing Score (%)', type: 'markdown', required: true },
      { id: 'timeLimit', name: 'Time Limit (minutes)', type: 'markdown' }
    ]
  };

  // Create sample content items
  const instructors: ContentItem[] = [
    {
      id: generateUUID(),
      schemaId: instructorSchema.id,
      title: 'David Johnson',
      status: 'published',
      createdAt: nowISO(),
      updatedAt: nowISO(),
      publishedAt: nowISO(),
      data: {
        name: 'David Johnson',
        bio: 'Full-stack developer and educator with 15 years of experience.',
        email: 'david.johnson@example.com',
        expertise: ['Web Development', 'Mobile Development']
      },
      createdBy: 'admin@example.com',
      updatedBy: 'admin@example.com',
    }
  ];

  const courses: ContentItem[] = [
    {
      id: generateUUID(),
      schemaId: courseSchema.id,
      title: 'JavaScript Fundamentals',
      status: 'published',
      createdAt: nowISO(),
      updatedAt: nowISO(),
      publishedAt: nowISO(),
      data: {
        title: 'JavaScript Fundamentals',
        description: 'Learn the core concepts of JavaScript programming from the ground up.',
        instructor: instructors[0].id,
        category: 'Programming',
        difficulty: 'Beginner',
        duration: '10',
        price: '49.99',
        published: true,
        featured: true
      },
      createdBy: 'david.johnson@example.com',
      updatedBy: 'david.johnson@example.com',
    }
  ];

  const modules: ContentItem[] = [
    {
      id: generateUUID(),
      schemaId: moduleSchema.id,
      title: 'Getting Started with JavaScript',
      status: 'published',
      createdAt: nowISO(),
      updatedAt: nowISO(),
      publishedAt: nowISO(),
      data: {
        title: 'Getting Started with JavaScript',
        description: 'Introduction to JavaScript and setup',
        course: courses[0].id,
        order: '1'
      },
      createdBy: 'david.johnson@example.com',
      updatedBy: 'david.johnson@example.com',
    }
  ];

  const lessons: ContentItem[] = [
    {
      id: generateUUID(),
      schemaId: lessonSchema.id,
      title: 'Introduction to JavaScript',
      status: 'published',
      createdAt: nowISO(),
      updatedAt: nowISO(),
      publishedAt: nowISO(),
      data: {
        title: 'Introduction to JavaScript',
        content: '# Welcome to JavaScript\n\nIn this lesson, you will learn the basics of JavaScript...',
        course: courses[0].id,
        module: modules[0].id,
        duration: '15',
        order: '1'
      },
      createdBy: 'david.johnson@example.com',
      updatedBy: 'david.johnson@example.com',
    }
  ];

  return {
    schemas: [courseSchema, lessonSchema, moduleSchema, instructorSchema, quizSchema],
    contentItems: [...instructors, ...courses, ...modules, ...lessons]
  };
}; 
