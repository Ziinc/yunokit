
import React from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
// DestructiveButton removed; use base Button with destructive variant
import { Image, FileUp, X, FileImage } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { hasItems } from "@/lib/guards";
import { Z_INDEX } from "@/lib/css-constants";

interface AssetFieldProps {
  id: string;
  name: string;
  value: string | string[] | undefined;
  onChange: (value: string | string[]) => void;
  description?: string;
  assetTypes?: string[];
  isMultiple?: boolean;
}

// Mock assets for demo purposes
const mockAssets = [
  { id: 'asset1', name: 'header-image.jpg', url: '/placeholder.svg', type: 'image/jpeg' },
  { id: 'asset2', name: 'logo.png', url: '/placeholder.svg', type: 'image/png' },
  { id: 'asset3', name: 'brochure.pdf', url: '/placeholder.svg', type: 'application/pdf' },
  { id: 'asset4', name: 'screenshot.png', url: '/placeholder.svg', type: 'image/png' },
  { id: 'asset5', name: 'product.webp', url: '/placeholder.svg', type: 'image/webp' },
];

export const AssetField: React.FC<AssetFieldProps> = ({
  id,
  name,
  value,
  onChange,
  description,
  assetTypes,
  isMultiple = false,
}) => {
  const [assetDialogOpen, setAssetDialogOpen] = React.useState(false);
  
  // Filter assets by type if needed
  const filteredAssets = assetTypes?.length 
    ? mockAssets.filter(asset => 
        assetTypes.some(type => 
          type.includes('*') 
            ? asset.type.startsWith(type.replace('*', ''))
            : asset.type === type
        )
      )
    : mockAssets;
  
  const selectedAssetIds = Array.isArray(value) ? value : value ? [value] : [];
  
  const selectedAssets = selectedAssetIds
    .map(assetId => mockAssets.find(asset => asset.id === assetId))
    .filter(Boolean) as typeof mockAssets;
  
  const handleAssetSelect = (assetId: string) => {
    if (isMultiple) {
      const currentValues = Array.isArray(value) ? value : value ? [value] : [];
      const newValues = currentValues.includes(assetId)
        ? currentValues.filter(id => id !== assetId)
        : [...currentValues, assetId];
      onChange(newValues);
    } else {
      onChange(assetId);
      setAssetDialogOpen(false);
    }
  };
  
  const handleRemoveAsset = (assetId: string) => {
    if (isMultiple) {
      const currentValues = Array.isArray(value) ? value : value ? [value] : [];
      onChange(currentValues.filter(id => id !== assetId));
    } else {
      onChange("");
    }
  };
  
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{name}</Label>
      
      <div className="space-y-2">
        {hasItems(selectedAssets) ? (
          <div className={isMultiple ? `grid grid-cols-2 gap-2` : ""}>
            {selectedAssets.map(asset => (
              <Card key={asset.id} className="p-2 relative group">
                <div className={`absolute top-2 right-2 ${Z_INDEX.dropdown}`}>
                  <Button
                    variant="destructive"
                    type="button"
                    size="icon"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleRemoveAsset(asset.id)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
                {asset.type.startsWith('image/') ? (
                  <div className="aspect-video relative bg-muted rounded-sm overflow-hidden">
                    <img 
                      src={asset.url} 
                      alt={asset.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="aspect-video flex items-center justify-center bg-muted rounded-sm">
                    <FileImage className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
                <p className="text-xs mt-1 truncate">{asset.name}</p>
              </Card>
            ))}
          </div>
        ) : (
          <div className="border border-dashed rounded-md p-4 text-center">
            <FileUp className="h-8 w-8 mx-auto text-muted-foreground" />
            <p className="text-sm text-muted-foreground mt-2">No assets selected</p>
          </div>
        )}
        
        <Dialog open={assetDialogOpen} onOpenChange={setAssetDialogOpen}>
          <DialogTrigger asChild>
            <Button type="button" variant="outline" className="w-full mt-2">
              <Image className="h-4 w-4 mr-2" />
              Select {isMultiple ? "Assets" : "Asset"}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Asset Library</DialogTitle>
            </DialogHeader>
            <div className={`grid grid-cols-3 gap-4 max-h-[60vh] overflow-y-auto py-4`}>
              {filteredAssets.map(asset => (
                <Card 
                  key={asset.id} 
                  className={`p-2 cursor-pointer hover:border-primary transition-colors ${
                    selectedAssetIds.includes(asset.id) ? "border-primary" : ""
                  }`}
                  onClick={() => handleAssetSelect(asset.id)}
                >
                  {asset.type.startsWith('image/') ? (
                    <div className="aspect-video relative bg-muted rounded-sm overflow-hidden">
                      <img 
                        src={asset.url} 
                        alt={asset.name}
                        className="w-full h-full object-cover"
                      />
                      {selectedAssetIds.includes(asset.id) && (
                        <div className={`absolute inset-0 bg-primary/20 flex items-center justify-center`}>
                          <div className="bg-primary text-primary-foreground rounded-full p-1">
                            <Image className="h-4 w-4" />
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className={`aspect-video flex items-center justify-center bg-muted rounded-sm`}>
                      <FileImage className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                  <p className="text-xs mt-1 truncate">{asset.name}</p>
                </Card>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </div>
      
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
    </div>
  );
};
