import { ContentApi } from "./ContentApi";
import { 
  generateEcommerceTemplate, 
  generateBloggingTemplate, 
  generateTutorialsTemplate 
} from "./TemplateGenerators";

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
  static async applyTemplate(templateType: TemplateType): Promise<void> {
    // Get the template data based on the type
    let templateData;
    
    switch (templateType) {
      case 'ecommerce':
        templateData = generateEcommerceTemplate();
        break;
      case 'blogging':
        templateData = generateBloggingTemplate();
        break;
      case 'tutorials':
        templateData = generateTutorialsTemplate();
        break;
      default:
        throw new Error(`Unknown template type: ${templateType}`);
    }
    
    // Get current schemas and content to merge with new ones
    const currentSchemas = await ContentApi.getSchemas();
    const currentContent = await ContentApi.getContentItems();
    
    // Create unique IDs map to avoid conflicts
    const uniqueSchemaIds = new Set(currentSchemas.map(schema => schema.id));
    templateData.schemas.forEach(schema => {
      if (uniqueSchemaIds.has(schema.id)) {
        // Add a random suffix to avoid collisions
        schema.id = `${schema.id}-${Math.random().toString(36).substring(2, 7)}`;
      }
      uniqueSchemaIds.add(schema.id);
    });
    
    // Save all schemas and content items
    await ContentApi.saveSchemas([...currentSchemas, ...templateData.schemas]);
    await ContentApi.saveContentItems([...currentContent, ...templateData.contentItems]);
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
          description: "Create a complete e-commerce content structure with products, categories, orders, and customers.",
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
          description: "Set up a complete blog with posts, categories, authors, and comments.",
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
          description: "Create educational content with courses, lessons, quizzes, and student tracking.",
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