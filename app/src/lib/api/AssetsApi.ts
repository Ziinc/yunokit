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

// Storage key
const ASSETS_STORAGE_KEY = 'supacontent-assets';

/**
 * AssetsApi - Provides methods for managing assets
 * Currently uses localStorage for persistence and DataURLs for files
 */
export class AssetsApi {
  // Initialize storage with example assets if empty
  static async initializeStorage(): Promise<void> {
    const storedAssets = localStorage.getItem(ASSETS_STORAGE_KEY);
    if (!storedAssets) {
      await this.saveAssets(mockAssets);
      console.log("Initialized assets storage with mock assets");
    }
  }

  // Asset Operations
  static async getAssets(): Promise<Asset[]> {
    const storedAssets = localStorage.getItem(ASSETS_STORAGE_KEY);
    if (!storedAssets) return [];
    return JSON.parse(storedAssets);
  }

  static async getAssetById(id: string): Promise<Asset | null> {
    const assets = await this.getAssets();
    return assets.find(asset => asset.id === id) || null;
  }

  static async saveAsset(asset: Asset): Promise<Asset> {
    const assets = await this.getAssets();
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
    
    localStorage.setItem(ASSETS_STORAGE_KEY, JSON.stringify(assets));
    return asset;
  }

  static async saveAssets(assets: Asset[]): Promise<Asset[]> {
    localStorage.setItem(ASSETS_STORAGE_KEY, JSON.stringify(assets));
    return assets;
  }

  static async deleteAsset(id: string): Promise<void> {
    const assets = await this.getAssets();
    const filteredAssets = assets.filter(asset => asset.id !== id);
    localStorage.setItem(ASSETS_STORAGE_KEY, JSON.stringify(filteredAssets));
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
    const assets = await this.getAssets();
    return assets.filter(asset => asset.mimeType.startsWith('image/'));
  }

  static async getDocumentAssets(): Promise<Asset[]> {
    const assets = await this.getAssets();
    return assets.filter(asset => 
      asset.mimeType === 'application/pdf' || 
      asset.mimeType.includes('word') ||
      asset.mimeType.includes('excel') ||
      asset.mimeType.includes('powerpoint')
    );
  }

  // Search assets
  static async searchAssets(query: string): Promise<Asset[]> {
    const assets = await this.getAssets();
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