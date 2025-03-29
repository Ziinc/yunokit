import React, { useState, useMemo } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Image, Upload, FileImage, PlusCircle, Search, Trash2, Edit, Plus, X, Info } from "lucide-react";
import { PaginationControls } from "@/components/Content/ContentList/PaginationControls";
import { DocsButton } from "@/components/ui/DocsButton";

// Mock data for assets - this would come from Supabase in a real app
const mockAssets = [
  { id: 1, name: "Product Image", type: "image", url: "https://source.unsplash.com/random/800x600?product", caption: "Main product image", createdAt: "2023-09-12" },
  { id: 2, name: "Team Photo", type: "image", url: "https://source.unsplash.com/random/800x600?team", caption: "Group photo from company retreat", createdAt: "2023-09-10" },
  { id: 3, name: "Logo", type: "image", url: "https://source.unsplash.com/random/800x600?logo", caption: "Company logo", createdAt: "2023-09-05" },
  { id: 4, name: "Banner", type: "image", url: "https://source.unsplash.com/random/1200x400?banner", caption: "Landing page banner", createdAt: "2023-08-22" },
  { id: 5, name: "Testimonial Background", type: "image", url: "https://source.unsplash.com/random/800x600?testimonial", caption: "Background for testimonials section", createdAt: "2023-08-15" },
  { id: 6, name: "Feature Icon", type: "image", url: "https://source.unsplash.com/random/800x600?icon", caption: "Icon for product features", createdAt: "2023-08-10" }
];

const AssetCard = ({ asset, onEdit, onDelete, onSelect }) => {
  return (
    <Card className="overflow-hidden">
      <div className="aspect-video relative group overflow-hidden">
        <img 
          src={asset.url} 
          alt={asset.name} 
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
        <h3 className="font-medium text-sm truncate">{asset.name}</h3>
        <p className="text-xs text-muted-foreground truncate">{asset.caption}</p>
      </CardContent>
      <CardFooter className="p-3 pt-0 flex justify-between">
        <span className="text-xs text-muted-foreground">{asset.createdAt}</span>
        <div className="flex gap-1">
          <FileImage className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">{asset.type}</span>
        </div>
      </CardFooter>
    </Card>
  );
};

const AssetsLibraryPage: React.FC = () => {
  const { toast } = useToast();
  const [assets, setAssets] = useState(mockAssets);
  const [searchQuery, setSearchQuery] = useState("");
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [currentAsset, setCurrentAsset] = useState(null);
  const [assetFormData, setAssetFormData] = useState({
    name: "",
    caption: "",
    file: null,
    folder: "general"
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12); // Default to 12 for grid view

  const filteredAssets = assets.filter(asset => 
    asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    asset.caption.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Get paginated assets
  const paginatedAssets = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredAssets.slice(startIndex, endIndex);
  }, [filteredAssets, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredAssets.length / itemsPerPage);

  const handleUpload = () => {
    // This would upload to Supabase in a real app
    const newAsset = {
      id: assets.length + 1,
      name: assetFormData.name,
      type: "image",
      url: URL.createObjectURL(assetFormData.file),
      caption: assetFormData.caption,
      createdAt: new Date().toISOString().split('T')[0]
    };
    
    setAssets([newAsset, ...assets]);
    setUploadDialogOpen(false);
    setAssetFormData({
      name: "",
      caption: "",
      file: null,
      folder: "general"
    });
    
    toast({
      title: "Asset uploaded",
      description: "Your asset has been uploaded successfully.",
    });
  };

  const handleEdit = (asset) => {
    setCurrentAsset(asset);
    setAssetFormData({
      name: asset.name,
      caption: asset.caption,
      file: null,
      folder: "general"
    });
    setEditDialogOpen(true);
  };

  const saveEdit = () => {
    const updatedAssets = assets.map(asset => 
      asset.id === currentAsset.id 
        ? { ...asset, name: assetFormData.name, caption: assetFormData.caption }
        : asset
    );
    
    setAssets(updatedAssets);
    setEditDialogOpen(false);
    
    toast({
      title: "Asset updated",
      description: "The asset information has been updated.",
    });
  };

  const handleDelete = (asset) => {
    const updatedAssets = assets.filter(a => a.id !== asset.id);
    setAssets(updatedAssets);
    
    toast({
      title: "Asset deleted",
      description: "The asset has been removed from your library.",
    });
  };

  const handleSelect = (asset) => {
    // This would be used when selecting an asset from within the content editor
    toast({
      title: "Asset selected",
      description: `"${asset.name}" has been selected.`,
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAssetFormData({
        ...assetFormData,
        file,
        name: file.name.split('.')[0] // Set name to filename by default
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Assets Library</h1>
          <DocsButton href="https://docs.supacontent.tznc.net/assets" />
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
          <Select defaultValue="all">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="image">Images</SelectItem>
              <SelectItem value="document">Documents</SelectItem>
              <SelectItem value="video">Videos</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="recent">
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
            {filteredAssets.length > 0 ? (
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
                
                {filteredAssets.length > 0 && (
                  <div className="p-4 border-t">
                    <PaginationControls
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={setCurrentPage}
                      itemsPerPage={itemsPerPage}
                      onItemsPerPageChange={(value) => {
                        setItemsPerPage(value);
                        setCurrentPage(1); // Reset to first page when changing items per page
                      }}
                      pageSizeOptions={[10, 20, 30, 50]}
                    />
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12 border-2 border-dashed rounded-lg">
                <FileImage className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                <h3 className="mt-4 text-lg font-medium">No assets found</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Upload your first asset or try a different search.
                </p>
                <Button 
                  variant="outline" 
                  className="mt-4" 
                  onClick={() => setUploadDialogOpen(true)}
                >
                  Upload Asset
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
                      <img src={asset.url} alt={asset.name} className="h-full w-full object-cover" />
                    </div>
                    <div>
                      <div className="font-medium">{asset.name}</div>
                      <div className="text-sm text-muted-foreground truncate max-w-xs">{asset.caption}</div>
                    </div>
                  </div>
                  <div>Image</div>
                  <div>{asset.createdAt}</div>
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
              
              {filteredAssets.length > 0 && (
                <div className="p-4 border-t">
                  <PaginationControls
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    itemsPerPage={itemsPerPage}
                    onItemsPerPageChange={(value) => {
                      setItemsPerPage(value);
                      setCurrentPage(1); // Reset to first page when changing items per page
                    }}
                    pageSizeOptions={[10, 20, 30, 50]}
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
              <DialogTitle>Upload Asset</DialogTitle>
              <DialogDescription>
                Upload a new asset to your library.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-muted/50 transition-colors">
                <input
                  id="file-upload"
                  type="file"
                  className="hidden"
                  accept="image/*,.pdf,.doc,.docx"
                  onChange={handleFileChange}
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  {assetFormData.file ? (
                    <div className="space-y-2">
                      <div className="h-32 w-32 mx-auto rounded bg-muted overflow-hidden">
                        <img 
                          src={URL.createObjectURL(assetFormData.file)} 
                          alt="Preview" 
                          className="h-full w-full object-cover" 
                        />
                      </div>
                      <div className="flex items-center justify-center gap-2">
                        <FileImage className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{assetFormData.file.name}</span>
                      </div>
                      <Button size="sm" variant="outline" className="mt-2" onClick={(e) => {
                        e.preventDefault();
                        setAssetFormData({ ...assetFormData, file: null });
                      }}>
                        Change File
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="mx-auto h-12 w-12 text-muted-foreground">
                        <PlusCircle className="h-12 w-12" />
                      </div>
                      <div className="text-sm font-medium">Click to upload</div>
                      <p className="text-xs text-muted-foreground">
                        Supports images, PDFs, and Word documents
                      </p>
                    </div>
                  )}
                </label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Asset Name</Label>
                <Input
                  id="name"
                  value={assetFormData.name}
                  onChange={(e) => setAssetFormData({ ...assetFormData, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="caption">Caption</Label>
                <Textarea
                  id="caption"
                  value={assetFormData.caption}
                  onChange={(e) => setAssetFormData({ ...assetFormData, caption: e.target.value })}
                  placeholder="Add a descriptive caption..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="folder">Folder</Label>
                <Select 
                  value={assetFormData.folder}
                  onValueChange={(value) => setAssetFormData({ ...assetFormData, folder: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a folder" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="products">Products</SelectItem>
                    <SelectItem value="blog">Blog</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setUploadDialogOpen(false)}>Cancel</Button>
              <Button 
                onClick={handleUpload} 
                disabled={!assetFormData.file || !assetFormData.name}
              >
                Upload
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Asset</DialogTitle>
              <DialogDescription>
                Update information for this asset.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              {currentAsset && (
                <div className="h-40 w-40 mx-auto rounded overflow-hidden">
                  <img 
                    src={currentAsset.url} 
                    alt={currentAsset.name} 
                    className="h-full w-full object-cover" 
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="edit-name">Asset Name</Label>
                <Input
                  id="edit-name"
                  value={assetFormData.name}
                  onChange={(e) => setAssetFormData({ ...assetFormData, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-caption">Caption</Label>
                <Textarea
                  id="edit-caption"
                  value={assetFormData.caption}
                  onChange={(e) => setAssetFormData({ ...assetFormData, caption: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-folder">Folder</Label>
                <Select 
                  value={assetFormData.folder}
                  onValueChange={(value) => setAssetFormData({ ...assetFormData, folder: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a folder" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="products">Products</SelectItem>
                    <SelectItem value="blog">Blog</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Cancel</Button>
              <Button onClick={saveEdit}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
  );
};

export default AssetsLibraryPage;
