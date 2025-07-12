export const exampleSchemas = [
  {
    id: 1,
    name: "Blog Post",
    description: "Blog post content type",
    isCollection: true,
    isArchived: false,
    fields: [
      { name: "title", type: "text", required: true },
      { name: "content", type: "richtext", required: true },
      { name: "author", type: "text", required: false },
    ],
  },
  {
    id: 2,
    name: "Page",
    description: "Static page content type",
    isCollection: false,
    isArchived: false,
    fields: [
      { name: "title", type: "text", required: true },
      { name: "content", type: "richtext", required: true },
    ],
  },
  {
    id: 3,
    name: "Product",
    description: "Product content type",
    isCollection: true,
    isArchived: true,
    fields: [
      { name: "name", type: "text", required: true },
      { name: "price", type: "number", required: true },
      { name: "description", type: "text", required: false },
    ],
  },
];

export const mockContentItems = [
  {
    id: 1,
    title: "Welcome to our blog",
    type: "Blog Post",
    status: "published",
    updatedAt: "2024-01-01T00:00:00Z",
    author: {
      id: 1,
      name: "John Doe",
      email: "john@example.com",
    },
  },
  {
    id: 2,
    title: "About Us",
    type: "Page",
    status: "draft",
    updatedAt: "2024-01-02T00:00:00Z",
    author: {
      id: 2,
      name: "Jane Smith",
      email: "jane@example.com",
    },
  },
]; 