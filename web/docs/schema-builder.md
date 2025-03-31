# Content Schema Builder

The Schema Builder allows you to define the structure of your content. There are two main types of schemas: Singles and Collections.

## Schema Types

### Singles
Single schemas represent standalone content that only has one instance. Examples include:
- Homepage
- About Page
- Privacy Policy
- Global Settings

Single schemas are ideal for unique content that doesn't need multiple entries.

### Collections
Collection schemas represent content types that can have multiple entries. Examples include:
- Blog Posts
- Products
- Team Members
- FAQ Items

Collections are perfect for content that follows the same structure but needs multiple entries.

## Schema Status

### Active vs Archived
- **Active**: Default state for schemas. Content can be created, edited, and published.
- **Archived**: 
  - No new content can be created
  - Existing content remains accessible but marked as archived
  - Hidden from content creation forms
  - Visible in the "Archived" tab or with reduced opacity in "All" view
  - Can be used to phase out deprecated content types

### Archiving Schemas
You can archive schemas in two ways:
1. **Bulk Archive**: Select multiple schemas using the checkboxes and click the "Archive" action in the selection bar
2. **Individual Archive**: Use the "Manage Schema" button on a specific schema

Archiving is reversible and is recommended over deletion when:
- Deprecating content types that still have existing content
- Temporarily disabling content creation for specific types
- Maintaining content history while preventing new entries

## Field Types

The following field types are available when building your schema:

### Text Fields
- `string`: Basic text input for titles, names, etc.
- `text`: Multi-line text area for longer content
- `markdown`: Rich text editor with markdown support
- `html`: HTML editor for custom markup

### Media Fields
- `image`: Image upload with preview
- `file`: File upload for documents, etc.
- `media`: General media upload (images, videos, files)

### Structured Fields
- `json`: Structured data in JSON format
- `block`: Content blocks for flexible layouts
- `array`: List of items (can contain other field types)
- `reference`: Reference to other content items

### Special Fields
- `boolean`: True/false toggle
- `number`: Numeric input
- `date`: Date picker
- `datetime`: Date and time picker
- `select`: Single selection from predefined options
- `multiselect`: Multiple selections from predefined options
- `color`: Color picker with hex/rgba support

## Best Practices

1. **Schema Planning**
   - Plan your content structure before creating schemas
   - Consider relationships between different content types
   - Think about future content needs

2. **Field Organization**
   - Group related fields together
   - Use clear, descriptive field names
   - Make required fields explicit

3. **Schema Management**
   - Archive instead of delete when phasing out content types
   - Document schema changes
   - Test schema changes with sample content

4. **Performance Considerations**
   - Limit the number of reference fields
   - Use appropriate field types for the data
   - Consider query patterns when structuring content 