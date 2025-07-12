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
    
    switch (templateType) {
      case 'ecommerce':
        generateEcommerceTemplate();
        break;
      case 'blogging':
        generateBloggingTemplate();
        break;
      case 'tutorials':
        generateTutorialsTemplate();
        break;
      default:
        throw new Error(`Unknown template type: ${templateType}`);
    }
    
    // TODO: Implement template application using proper API calls
    // when template functionality is needed
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