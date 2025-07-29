import {
  generateEcommerceTemplate,
  generateBloggingTemplate,
  generateTutorialsTemplate
} from "./TemplateGenerators";
import { createSchema, SchemaFieldType } from "./SchemaApi";
import { createContentItem } from "./ContentApi";

export type TemplateType = 'ecommerce' | 'blogging' | 'tutorials';

/**
 * TemplateService - Handles the creation and application of templates
 */
export class TemplateService {
  /**
   * Apply a template to the workspace
   * @param templateType The type of template to apply
   * @returns Promise that resolves when the template is applied
   */
  static async applyTemplate(
    templateType: TemplateType,
    workspaceId: number
  ): Promise<void> {
    let template;

    switch (templateType) {
      case 'ecommerce':
        template = generateEcommerceTemplate();
        break;
      case 'blogging':
        template = generateBloggingTemplate();
        break;
      case 'tutorials':
        template = generateTutorialsTemplate();
        break;
      default:
        throw new Error(`Unknown template type: ${templateType}`);
    }

    const schemaMap = new Map<string, number>();

    for (const schema of template.schemas) {
      const fields = schema.fields.map(field => ({
        id: field.id,
        label: field.name,
        description: field.description ?? null,
        type: field.type as SchemaFieldType,
        required: field.required ?? false,
        default_value: (field as any).defaultValue ?? null,
        options: field.options ?? [],
        relation_schema_id: (field as any).relationSchemaId ?? null,
      }));
      const response = await createSchema(
        {
          name: schema.name,
          description: schema.description,
          fields,
          strict: schema.strict ?? true,
          type: schema.schemaType,
        },
        workspaceId
      );
      if (response.error) {
        throw new Error(response.error.message);
      }
      schemaMap.set(schema.id, response.data!.id);
    }

    for (const item of template.contentItems) {
      const response = await createContentItem(
        {
          uid: item.id,
          title: item.title,
          schema_id: schemaMap.get(item.schemaId),
          data: item.content as unknown as object,
          created_at: item.createdAt,
          updated_at: item.updatedAt,
          published_at: item.publishedAt,
        },
        workspaceId
      );
      if (response.error) {
        throw new Error(response.error.message);
      }
    }
  }
  
  /**
   * Get information about a specific template
   * @param templateType The type of template
   * @returns Template metadata
   */
  static getTemplateInfo(templateType: TemplateType) {
    switch (templateType) {
      case 'ecommerce':
        return {
          title: "E-commerce Template",
          description:
            "Creates product, category, customer, order and cart schemas with sample entries.",
          features: [
            "Product catalog with variants",
            "Product categories and tags",
            "Customer profiles",
            "Order management",
            "Shopping cart"
          ]
        };
      case 'blogging':
        return {
          title: "Blogging Template",
          description:
            "Adds post, author, category and comment schemas populated with sample data.",
          features: [
            "Blog posts with rich text editing",
            "Author profiles",
            "Categories and tags",
            "Comments system",
            "Featured posts"
          ]
        };
      case 'tutorials':
        return {
          title: "Tutorials Platform Template",
          description:
            "Seeds course, module, lesson and instructor schemas along with a demo course.",
          features: [
            "Course structure with modules",
            "Video and text lessons",
            "Quizzes and assessments",
            "Student progress tracking",
            "Certificate generation"
          ]
        };
      default:
        throw new Error(`Unknown template type: ${templateType}`);
    }
  }
} 