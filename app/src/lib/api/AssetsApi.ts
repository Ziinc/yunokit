export interface Asset {
  id: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  url: string;
  thumbnailUrl?: string;
  createdAt: string;
  updatedAt: string;
  description?: string;
  tags?: string[];
  alt?: string;
}

// In-memory storage
let assets: Asset[] = [];

/**
 * AssetsApi - Provides methods for managing assets
 */
export class AssetsApi {
  // Initialize storage - no longer uses mocks
  static async initializeStorage(): Promise<void> {
    // Storage is now initialized empty
  }

  // Asset Operations
  static async getAssets(): Promise<Asset[]> {
    return assets;
  }

  static async getAssetById(id: string): Promise<Asset | null> {
    return assets.find(asset => asset.id === id) || null;
  }

  static async saveAsset(asset: Asset): Promise<Asset> {
    const existingIndex = assets.findIndex(a => a.id === asset.id);
    
    if (existingIndex >= 0) {
      assets[existingIndex] = {
        ...asset,
        updatedAt: new Date().toISOString()
      };
    } else {
      assets.push({
        ...asset,
        id: asset.id || crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
    
    return asset;
  }

  static async saveAssets(newAssets: Asset[]): Promise<Asset[]> {
    assets = newAssets;
    return assets;
  }

  static async deleteAsset(id: string): Promise<void> {
    assets = assets.filter(asset => asset.id !== id);
  }

  static async uploadAsset(file: File): Promise<Asset> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = async (event) => {
        if (!event.target || !event.target.result) {
          reject(new Error('Failed to read file'));
          return;
        }
        
        // Generate a thumbnail for images
        let thumbnailUrl: string | undefined;
        if (file.type.startsWith('image/')) {
          // In a real implementation, you'd generate a proper thumbnail
          // Here we just use the same DataURL to simulate it
          thumbnailUrl = event.target.result as string;
        }
        
        const asset: Asset = {
          id: crypto.randomUUID(),
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type,
          url: event.target.result as string,
          thumbnailUrl,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        // Save the asset
        const savedAsset = await this.saveAsset(asset);
        resolve(savedAsset);
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      
      // Read the file as a Data URL (base64 encoded)
      reader.readAsDataURL(file);
    });
  }

  // Filter assets by type
  static async getImageAssets(): Promise<Asset[]> {
    return assets.filter(asset => asset.mimeType.startsWith('image/'));
  }

  static async getDocumentAssets(): Promise<Asset[]> {
    return assets.filter(asset => 
      asset.mimeType === 'application/pdf' || 
      asset.mimeType.includes('word') ||
      asset.mimeType.includes('excel') ||
      asset.mimeType.includes('powerpoint')
    );
  }

  // Search assets
  static async searchAssets(query: string): Promise<Asset[]> {
    const searchTerm = query.toLowerCase();
    
    return assets.filter(asset => 
      asset.fileName.toLowerCase().includes(searchTerm) ||
      (asset.description && asset.description.toLowerCase().includes(searchTerm)) ||
      (asset.tags && asset.tags.some(tag => tag.toLowerCase().includes(searchTerm)))
    );
  }
} 