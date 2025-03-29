import { ContentItem, ContentItemStatus, ContentSchema, exampleSchemas } from "./contentSchema";

// Mock content items to be used across search and editor pages
export const mockContentItems: ContentItem[] = [
  {
    id: "1",
    schemaId: "blog-post",
    title: "Getting Started with React",
    // Content field for backward compatibility
    content: {
      title: "Getting Started with React",
      content: "# Introduction to React\n\nReact is a JavaScript library for building user interfaces...",
      featured: true,
      category: "Technology",
      tags: ["React", "JavaScript"]
    },
    // Data field for new code
    data: {
      title: "Getting Started with React",
      content: "# Introduction to React\n\nReact is a JavaScript library for building user interfaces...",
      featured: true,
      category: "Technology",
      tags: ["React", "JavaScript"]
    },
    status: "published" as ContentItemStatus,
    createdAt: "2023-09-14T10:30:00Z",
    updatedAt: "2023-09-15T10:30:00Z",
    publishedAt: "2023-09-15T10:30:00Z",
    createdBy: "John Smith",
    updatedBy: "John Smith",
    publishedBy: "John Smith",
    reviewStatus: "approved",
    reviewRequestedAt: "2023-09-14T15:30:00Z",
    reviewRequestedBy: "John Smith",
    reviewedAt: "2023-09-15T09:20:00Z",
    reviewedBy: "Jane Doe",
    reviewComments: "Content looks good, approved for publishing.",
    // Additional fields for search page
    type: "article",
    lastUpdated: "2023-09-15T10:30:00Z",
    tags: ["tutorial", "beginners", "cms"],
    author: {
      name: "John Smith",
      avatar: "/placeholder.svg"
    }
  },
  {
    id: "2",
    schemaId: "blog-post",
    title: "Advanced TypeScript Tips",
    content: {
      title: "Advanced TypeScript Tips",
      content: "# TypeScript Pro Tips\n\nHere are some advanced techniques...",
      featured: false,
      category: "Technology",
      tags: ["TypeScript", "JavaScript"]
    },
    data: {
      title: "Advanced TypeScript Tips",
      content: "# TypeScript Pro Tips\n\nHere are some advanced techniques...",
      featured: false,
      category: "Technology",
      tags: ["TypeScript", "JavaScript"]
    },
    status: "published" as ContentItemStatus,
    createdAt: "2023-09-08T14:15:00Z",
    updatedAt: "2023-09-10T14:15:00Z",
    publishedAt: "2023-09-10T14:15:00Z",
    createdBy: "Jane Doe",
    updatedBy: "Jane Doe",
    publishedBy: "Jane Doe",
    reviewStatus: "approved",
    reviewRequestedAt: "2023-09-09T11:45:00Z",
    reviewRequestedBy: "Jane Doe",
    reviewedAt: "2023-09-10T10:30:00Z",
    reviewedBy: "Mike Wilson",
    reviewComments: "Excellent content. Approved with no changes needed.",
    // Additional fields for search page
    type: "article",
    lastUpdated: "2023-09-10T14:15:00Z",
    tags: ["content-modeling", "advanced", "cms"],
    author: {
      name: "Jane Doe",
      avatar: "/placeholder.svg"
    }
  },
  {
    id: "3",
    schemaId: "product-catalog",
    title: "Summer Collection 2023",
    content: {
      name: "Summer Collection 2023",
      details: {
        description: "A collection of summer fashion items...",
        price: 99.99,
        inventory: 50
      },
      inStock: true,
      productType: "Physical",
      features: ["Premium", "Limited Edition"]
    },
    data: {
      name: "Summer Collection 2023",
      details: {
        description: "A collection of summer fashion items...",
        price: 99.99,
        inventory: 50
      },
      inStock: true,
      productType: "Physical",
      features: ["Premium", "Limited Edition"]
    },
    status: "published" as ContentItemStatus,
    createdAt: "2023-08-18T09:45:00Z",
    updatedAt: "2023-08-20T09:45:00Z",
    publishedAt: "2023-08-20T09:45:00Z",
    createdBy: "Mike Wilson",
    updatedBy: "Mike Wilson",
    publishedBy: "Mike Wilson",
    reviewStatus: "approved",
    reviewRequestedAt: "2023-08-19T14:30:00Z",
    reviewRequestedBy: "Mike Wilson",
    reviewedAt: "2023-08-20T08:15:00Z",
    reviewedBy: "Marketing Team",
    reviewComments: "Collection details look good. Pricing approved.",
    // Additional fields for search page
    type: "collection",
    lastUpdated: "2023-08-20T09:45:00Z",
    tags: ["summer", "collection", "fashion"],
    author: {
      name: "Mike Wilson",
      avatar: "/placeholder.svg"
    }
  },
  {
    id: "4",
    schemaId: "page-builder",
    title: "Privacy Policy Page",
    content: {
      title: "Privacy Policy",
      content: "<div>Our privacy policy details...</div>",
      published: true,
      layout: "Full Width",
      components: ["Header", "Footer"]
    },
    data: {
      title: "Privacy Policy",
      content: "<div>Our privacy policy details...</div>",
      published: true,
      layout: "Full Width",
      components: ["Header", "Footer"]
    },
    status: "published" as ContentItemStatus,
    createdAt: "2023-07-01T11:30:00Z",
    updatedAt: "2023-07-05T11:30:00Z",
    publishedAt: "2023-07-05T11:30:00Z",
    createdBy: "Legal Team",
    updatedBy: "Legal Team",
    publishedBy: "Legal Team",
    reviewStatus: "approved",
    reviewRequestedAt: "2023-07-03T09:00:00Z",
    reviewRequestedBy: "Legal Team",
    reviewedAt: "2023-07-04T16:45:00Z",
    reviewedBy: "Compliance Officer",
    reviewComments: "Policy complies with all regulations. Approved for publishing.",
    // Additional fields for search page
    type: "page",
    lastUpdated: "2023-07-05T11:30:00Z",
    tags: ["legal", "policy"],
    author: {
      name: "Legal Team",
      avatar: "/placeholder.svg"
    }
  },
  {
    id: "5",
    schemaId: "blog-post",
    title: "New Product Launch Plan",
    content: {
      title: "New Product Launch Plan",
      content: "# Strategy for launching our new product...\n\nThis document outlines our plans for the upcoming launch.",
      featured: true,
      category: "Marketing",
      tags: ["Launch", "Marketing", "Planning"]
    },
    data: {
      title: "New Product Launch Plan",
      content: "# Strategy for launching our new product...\n\nThis document outlines our plans for the upcoming launch.",
      featured: true,
      category: "Marketing",
      tags: ["Launch", "Marketing", "Planning"]
    },
    status: "draft" as ContentItemStatus,
    createdAt: "2023-09-17T16:20:00Z",
    updatedAt: "2023-09-18T16:20:00Z",
    reviewStatus: "awaiting_review",
    reviewRequestedAt: "2023-09-18T16:25:00Z",
    reviewRequestedBy: "Marketing Team",
    // Additional fields for search page
    type: "document",
    lastUpdated: "2023-09-18T16:20:00Z",
    tags: ["product-launch", "marketing", "planning"],
    author: {
      name: "Marketing Team",
      avatar: "/placeholder.svg"
    }
  },
  {
    id: "6",
    schemaId: "blog-post",
    title: "UI Design Principles",
    content: {
      title: "UI Design Principles",
      content: "# Fundamental UI Design Principles\n\nDesign systems create consistency across products and can speed up development time...",
      featured: true,
      category: "Design",
      tags: ["UI/UX", "Design"]
    },
    data: {
      title: "UI Design Principles",
      content: "# Fundamental UI Design Principles\n\nDesign systems create consistency across products and can speed up development time...",
      featured: true,
      category: "Design",
      tags: ["UI/UX", "Design"]
    },
    status: "pending_review" as ContentItemStatus,
    createdAt: "2023-10-18T09:15:00Z",
    updatedAt: "2023-10-18T11:30:00Z",
    createdBy: "Sarah Johnson",
    updatedBy: "Sarah Johnson",
    reviewStatus: "awaiting_review",
    reviewRequestedAt: "2023-10-18T11:35:00Z",
    reviewRequestedBy: "Sarah Johnson",
    // Additional fields for search page
    type: "article",
    lastUpdated: "2023-10-18T11:30:00Z",
    tags: ["ui-design", "principles", "best-practices"],
    author: {
      name: "Sarah Johnson",
      avatar: "/placeholder.svg"
    },
    comments: [
      {
        id: "c1",
        contentItemId: "6",
        userId: "user123",
        userName: "Design Lead",
        text: "Please add more examples in the consistency section.",
        createdAt: "2023-10-18T12:45:00Z",
        fieldId: "content",
        resolved: false
      }
    ]
  },
  {
    id: "7",
    schemaId: "product-catalog",
    title: "Winter Collection Preview",
    content: {
      name: "Winter Collection Preview",
      details: {
        description: "A preview of our upcoming winter fashion collection...",
        price: 149.99,
        inventory: 25
      },
      inStock: false,
      productType: "Physical",
      features: ["Premium", "Preview", "Limited Edition"]
    },
    data: {
      name: "Winter Collection Preview",
      details: {
        description: "A preview of our upcoming winter fashion collection...",
        price: 149.99,
        inventory: 25
      },
      inStock: false,
      productType: "Physical",
      features: ["Premium", "Preview", "Limited Edition"]
    },
    status: "pending_review" as ContentItemStatus,
    createdAt: "2023-10-15T14:20:00Z",
    updatedAt: "2023-10-16T10:15:00Z",
    createdBy: "Product Team",
    updatedBy: "Product Team",
    reviewStatus: "awaiting_review",
    reviewRequestedAt: "2023-10-16T10:20:00Z",
    reviewRequestedBy: "Product Team",
    // Additional fields for search page
    type: "collection",
    lastUpdated: "2023-10-16T10:15:00Z",
    tags: ["winter", "collection", "preview", "fashion"],
    author: {
      name: "Product Team",
      avatar: "/placeholder.svg"
    }
  },
  {
    id: "8",
    schemaId: "page-builder",
    title: "Updated Terms of Service",
    content: {
      title: "Terms of Service",
      content: "<div>Our updated terms of service details...</div>",
      published: false,
      layout: "Full Width",
      components: ["Header", "Footer", "Legal Notices"]
    },
    data: {
      title: "Terms of Service",
      content: "<div>Our updated terms of service details...</div>",
      published: false,
      layout: "Full Width",
      components: ["Header", "Footer", "Legal Notices"]
    },
    status: "pending_review" as ContentItemStatus,
    createdAt: "2023-10-12T09:00:00Z",
    updatedAt: "2023-10-14T16:45:00Z",
    createdBy: "Legal Team",
    updatedBy: "Legal Team",
    reviewStatus: "awaiting_review",
    reviewRequestedAt: "2023-10-14T16:50:00Z",
    reviewRequestedBy: "Legal Team",
    // Additional fields for search page
    type: "page",
    lastUpdated: "2023-10-14T16:45:00Z",
    tags: ["legal", "terms", "updated"],
    author: {
      name: "Legal Team",
      avatar: "/placeholder.svg"
    }
  }
];

// Re-export exampleSchemas for use throughout the app
export { exampleSchemas as contentSchemas }; 