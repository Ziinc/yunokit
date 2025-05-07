interface Asset {
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

// Sample mock assets
const mockAssets: Asset[] = [
  {
    id: crypto.randomUUID(),
    fileName: 'product-image-1.jpg',
    fileSize: 1024 * 1024 * 2.5, // 2.5MB
    mimeType: 'image/jpeg',
    url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e',
    thumbnailUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    description: 'Wireless headphones product image',
    tags: ['product', 'headphones', 'electronics'],
    alt: 'Red wireless headphones on a yellow background'
  },
  {
    id: crypto.randomUUID(),
    fileName: 'blog-cover-1.jpg',
    fileSize: 1024 * 1024 * 1.8, // 1.8MB
    mimeType: 'image/jpeg',
    url: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643',
    thumbnailUrl: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=200',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    description: 'Person typing on laptop',
    tags: ['blog', 'work', 'laptop'],
    alt: 'Person typing on laptop with coffee'
  },
  {
    id: crypto.randomUUID(),
    fileName: 'tutorial-cover.jpg',
    fileSize: 1024 * 1024 * 1.2, // 1.2MB
    mimeType: 'image/jpeg',
    url: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173',
    thumbnailUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=200',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    description: 'Person writing in notebook',
    tags: ['tutorial', 'education', 'notebook'],
    alt: 'Person writing in notebook with coffee'
  },
  {
    id: crypto.randomUUID(),
    fileName: 'sample-document.pdf',
    fileSize: 1024 * 1024 * 0.5, // 0.5MB
    mimeType: 'application/pdf',
    url: 'https://example.com/sample-document.pdf',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    description: 'Sample PDF document',
    tags: ['document', 'pdf']
  }
];

// In-memory storage
let assets: Asset[] = [...mockAssets];

/**
 * AssetsApi - Provides methods for managing assets
 */
export class AssetsApi {
  // Initialize storage with example assets if empty
  static async initializeStorage(): Promise<void> {
    if (assets.length === 0) {
      assets = [...mockAssets];
      console.log("Initialized assets storage with mock assets");
    }
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

// Export the Asset interface
export type { Asset }; 