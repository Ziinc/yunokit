import React, { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Image, Upload, FileImage, PlusCircle, Search, Trash2, Edit, Plus, X, Info, Loader2 } from "lucide-react";
import { PaginationControls } from "@/components/Content/ContentList/PaginationControls";
import { DocsButton } from "@/components/ui/DocsButton";
import { AssetsApi } from "@/lib/api";

const AssetCard = ({ asset, onEdit, onDelete, onSelect }) => {
  return (
    <Card className="overflow-hidden">
      <div className="aspect-video relative group overflow-hidden">
        <img 
          src={asset.url} 
          alt={asset.alt || asset.fileName} 
          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <Button size="sm" variant="outline" className="h-8 w-8 p-0 rounded-full" onClick={() => onEdit(asset)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="outline" className="h-8 w-8 p-0 rounded-full" onClick={() => onSelect(asset)}>
            <Plus className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="destructive" className="h-8 w-8 p-0 rounded-full" onClick={() => onDelete(asset)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <CardContent className="p-3">
        <h3 className="font-medium text-sm truncate">{asset.fileName}</h3>
        <p className="text-xs text-muted-foreground truncate">{asset.description}</p>
      </CardContent>
      <CardFooter className="p-3 pt-0 flex justify-between">
        <span className="text-xs text-muted-foreground">{new Date(asset.createdAt).toLocaleDateString()}</span>
        <div className="flex gap-1">
          <FileImage className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">{asset.mimeType.split('/')[0]}</span>
        </div>
      </CardFooter>
    </Card>
  );
};

const AssetsLibraryPage: React.FC = () => {
  const { toast } = useToast();
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [currentAsset, setCurrentAsset] = useState(null);
  const [assetType, setAssetType] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [assetFormData, setAssetFormData] = useState({
    fileName: "",
    description: "",
    file: null,
    alt: "",
    tags: []
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12); // Default to 12 for grid view

  // Load assets on component mount
  useEffect(() => {
    const loadAssets = async () => {
      try {
        setLoading(true);
        const fetchedAssets = await AssetsApi.getAssets();
        setAssets(fetchedAssets);
      } catch (error) {
        console.error("Error loading assets:", error);
        toast({
          title: "Error",
          description: "Failed to load assets. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    loadAssets();
  }, [toast]);

  // Filter assets based on search query and asset type
  const filteredAssets = useMemo(() => {
    let filtered = assets;
    
    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(asset => 
        asset.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (asset.description && asset.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (asset.tags && asset.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())))
      );
    }
    
    // Filter by asset type
    if (assetType !== "all") {
      filtered = filtered.filter(asset => 
        asset.mimeType.toLowerCase().startsWith(assetType.toLowerCase())
      );
    }
    
    // Sort assets
    return filtered.sort((a, b) => {
      switch(sortBy) {
        case "recent":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "oldest":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case "name":
          return a.fileName.localeCompare(b.fileName);
        case "name-desc":
          return b.fileName.localeCompare(a.fileName);
        default:
          return 0;
      }
    });
  }, [assets, searchQuery, assetType, sortBy]);
  
  // Get paginated assets
  const paginatedAssets = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredAssets.slice(startIndex, endIndex);
  }, [filteredAssets, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredAssets.length / itemsPerPage);

  const handleUpload = async () => {
    try {
      if (!assetFormData.file) {
        toast({
          title: "Missing file",
          description: "Please select a file to upload.",
          variant: "destructive"
        });
        return;
      }

      // Upload file using AssetsApi
      const newAsset = await AssetsApi.uploadAsset(assetFormData.file);
      
      // Update the asset with additional metadata
      const updatedAsset = {
        ...newAsset,
        fileName: assetFormData.fileName || newAsset.fileName,
        description: assetFormData.description,
        alt: assetFormData.alt,
        tags: assetFormData.tags
      };
      
      // Save the updated asset
      await AssetsApi.saveAsset(updatedAsset);
      
      setAssets([updatedAsset, ...assets]);
      setUploadDialogOpen(false);
      setAssetFormData({
        fileName: "",
        description: "",
        file: null,
        alt: "",
        tags: []
      });
      
      toast({
        title: "Asset uploaded",
        description: "Your asset has been uploaded successfully.",
      });
    } catch (error) {
      console.error("Error uploading asset:", error);
      toast({
        title: "Upload failed",
        description: "There was an error uploading your asset. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (asset) => {
    setCurrentAsset(asset);
    setAssetFormData({
      fileName: asset.fileName,
      description: asset.description || "",
      alt: asset.alt || "",
      tags: asset.tags || [],
      file: null
    });
    setEditDialogOpen(true);
  };

  const saveEdit = async () => {
    try {
      const updatedAsset = {
        ...currentAsset,
        fileName: assetFormData.fileName,
        description: assetFormData.description,
        alt: assetFormData.alt,
        tags: assetFormData.tags
      };
      
      await AssetsApi.saveAsset(updatedAsset);
      
      const updatedAssets = assets.map(asset => 
        asset.id === currentAsset.id ? updatedAsset : asset
      );
      
      setAssets(updatedAssets);
      setEditDialogOpen(false);
      
      toast({
        title: "Asset updated",
        description: "The asset information has been updated.",
      });
    } catch (error) {
      console.error("Error updating asset:", error);
      toast({
        title: "Update failed",
        description: "There was an error updating the asset. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (asset) => {
    try {
      await AssetsApi.deleteAsset(asset.id);
      
      const updatedAssets = assets.filter(a => a.id !== asset.id);
      setAssets(updatedAssets);
      
      toast({
        title: "Asset deleted",
        description: "The asset has been removed from your library.",
      });
    } catch (error) {
      console.error("Error deleting asset:", error);
      toast({
        title: "Delete failed",
        description: "There was an error deleting the asset. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleSelect = (asset) => {
    // This would be used when selecting an asset from within the content editor
    toast({
      title: "Asset selected",
      description: `"${asset.fileName}" has been selected.`,
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAssetFormData({
        ...assetFormData,
        file,
        fileName: file.name.split('.')[0] // Set name to filename by default
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Assets Library</h1>
          <DocsButton href="https://yunokit.com/docs/assets" />
        </div>
        <Button className="gap-2" onClick={() => setUploadDialogOpen(true)}>
          <Upload size={16} />
          Upload New Asset
        </Button>
      </div>

      <div className="flex items-center space-x-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search assets..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={assetType} onValueChange={setAssetType}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All File Types</SelectItem>
              <SelectItem value="image">Images</SelectItem>
              <SelectItem value="application">Documents</SelectItem>
              <SelectItem value="video">Videos</SelectItem>
              <SelectItem value="audio">Audio</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Most Recent</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="name">Name (A-Z)</SelectItem>
              <SelectItem value="name-desc">Name (Z-A)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Tabs defaultValue="grid" className="w-full">
          <div className="flex justify-between items-center">
            <TabsList>
              <TabsTrigger value="grid" className="flex gap-2 items-center">
                <Image size={16} />
                Grid View
              </TabsTrigger>
              <TabsTrigger value="list" className="flex gap-2 items-center">
                <FileImage size={16} />
                List View
              </TabsTrigger>
            </TabsList>
            <p className="text-sm text-muted-foreground">
              {filteredAssets.length} assets
            </p>
          </div>
          
          <TabsContent value="grid" className="mt-6">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : filteredAssets.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {paginatedAssets.map(asset => (
                    <AssetCard 
                      key={asset.id} 
                      asset={asset} 
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onSelect={handleSelect}
                    />
                  ))}
                </div>
                
                {totalPages > 1 && (
                  <div className="mt-6 flex justify-center">
                    <PaginationControls
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={setCurrentPage}
                      itemsPerPage={itemsPerPage}
                      onItemsPerPageChange={setItemsPerPage}
                      pageSizeOptions={[12, 24, 48, 96]}
                    />
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-4">
                  <Info className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium">No assets found</h3>
                <p className="text-muted-foreground mt-2 mb-4 max-w-md mx-auto">
                  {searchQuery ? 
                    `No assets match your search "${searchQuery}". Try a different search term or clear the filter.` : 
                    "Start building your asset library by uploading images, documents, and other files."
                  }
                </p>
                <Button onClick={() => setUploadDialogOpen(true)}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Upload an asset
                </Button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="list" className="mt-6">
            <div className="border rounded-md overflow-hidden">
              <div className="grid grid-cols-5 gap-4 p-4 bg-muted font-medium">
                <div className="col-span-2">Name</div>
                <div>Type</div>
                <div>Date</div>
                <div>Actions</div>
              </div>
              {paginatedAssets.map(asset => (
                <div key={asset.id} className="grid grid-cols-5 gap-4 p-4 border-t items-center">
                  <div className="col-span-2 flex items-center gap-3">
                    <div className="h-10 w-10 rounded bg-muted overflow-hidden flex-shrink-0">
                      <img src={asset.url} alt={asset.fileName} className="h-full w-full object-cover" />
                    </div>
                    <div>
                      <div className="font-medium">{asset.fileName}</div>
                      <div className="text-sm text-muted-foreground truncate max-w-xs">{asset.description}</div>
                    </div>
                  </div>
                  <div>{asset.mimeType.split('/')[0]}</div>
                  <div>{new Date(asset.createdAt).toLocaleDateString()}</div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(asset)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleSelect(asset)}>
                      <Plus className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleDelete(asset)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              
              {totalPages > 1 && (
                <div className="p-4 border-t">
                  <PaginationControls
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    itemsPerPage={itemsPerPage}
                    onItemsPerPageChange={setItemsPerPage}
                    pageSizeOptions={[12, 24, 48, 96]}
                  />
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Upload Dialog */}
        <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Upload new asset</DialogTitle>
              <DialogDescription>
                Upload a file to your asset library. Supported formats include images, documents, videos, and audio files.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-12 transition-colors hover:border-primary/50">
                {assetFormData.file ? (
                  <div className="text-center">
                    <p className="text-sm font-medium mb-1">{assetFormData.file.name}</p>
                    <p className="text-xs text-muted-foreground mb-3">
                      {(assetFormData.file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    <Button variant="outline" size="sm" onClick={() => setAssetFormData({ ...assetFormData, file: null })}>
                      <X className="mr-2 h-4 w-4" />
                      Remove
                    </Button>
                  </div>
                ) : (
                  <>
                    <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground mb-1">Drag and drop or click to upload</p>
                    <p className="text-xs text-muted-foreground mb-4">Max file size: 10MB</p>
                    <Button variant="outline" size="sm" asChild>
                      <Label htmlFor="file-upload" className="cursor-pointer">
                        <Upload className="mr-2 h-4 w-4" />
                        Select file
                      </Label>
                    </Button>
                  </>
                )}
                <Input 
                  id="file-upload" 
                  type="file" 
                  className="sr-only" 
                  onChange={handleFileChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="name">File name</Label>
                <Input
                  id="name"
                  value={assetFormData.fileName}
                  onChange={(e) => setAssetFormData({ ...assetFormData, fileName: e.target.value })}
                  placeholder="Enter a descriptive name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={assetFormData.description}
                  onChange={(e) => setAssetFormData({ ...assetFormData, description: e.target.value })}
                  placeholder="Add a description (optional)"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="alt">Alt text (for images)</Label>
                <Input
                  id="alt"
                  value={assetFormData.alt}
                  onChange={(e) => setAssetFormData({ ...assetFormData, alt: e.target.value })}
                  placeholder="Describe the image for accessibility"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setUploadDialogOpen(false)}>Cancel</Button>
              <Button type="submit" onClick={handleUpload}>Upload</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Edit Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Edit asset</DialogTitle>
              <DialogDescription>
                Update the details for this asset.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="edit-name">File name</Label>
                <Input
                  id="edit-name"
                  value={assetFormData.fileName}
                  onChange={(e) => setAssetFormData({ ...assetFormData, fileName: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={assetFormData.description}
                  onChange={(e) => setAssetFormData({ ...assetFormData, description: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-alt">Alt text (for images)</Label>
                <Input
                  id="edit-alt"
                  value={assetFormData.alt}
                  onChange={(e) => setAssetFormData({ ...assetFormData, alt: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Cancel</Button>
              <Button type="submit" onClick={saveEdit}>Save changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
    </div>
  );
};

export default AssetsLibraryPage;
