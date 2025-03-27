
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { mockContentItems, exampleSchemas, ContentItem } from "@/lib/contentSchema";
import { FilterForm, FilterValues } from "@/components/Content/ContentList/FilterForm";
import { ContentListHeader } from "@/components/Content/ContentList/ContentListHeader";
import { ContentTable } from "@/components/Content/ContentList/ContentTable";
import { ContentPagination } from "@/components/Content/ContentList/ContentPagination";
import { getUniqueAuthors, paginateItems } from "@/components/Content/ContentList/utils";

const ContentEditorPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [items, setItems] = useState<ContentItem[]>(mockContentItems);
  const itemsPerPage = 10;
  
  const totalItems = items.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const uniqueAuthors = getUniqueAuthors(mockContentItems);
  const displayedItems = paginateItems(items, currentPage, itemsPerPage);
  
  const onSubmitFilters = (values: FilterValues) => {
    let filteredItems = [...mockContentItems];
    
    if (values.schemaId) {
      filteredItems = filteredItems.filter(item => item.schemaId === values.schemaId);
    }
    
    if (values.status) {
      filteredItems = filteredItems.filter(item => item.status === values.status);
    }
    
    if (values.author) {
      filteredItems = filteredItems.filter(item => 
        item.createdBy?.includes(values.author!) || 
        item.updatedBy?.includes(values.author!)
      );
    }
    
    if (values.search) {
      const searchTerm = values.search.toLowerCase();
      filteredItems = filteredItems.filter(item => 
        item.title.toLowerCase().includes(searchTerm)
      );
    }
    
    setItems(filteredItems);
    setCurrentPage(1);
  };
  
  const resetFilters = () => {
    setItems(mockContentItems);
    setCurrentPage(1);
  };
  
  const handleRowClick = (item: ContentItem) => {
    navigate(`/content/${item.schemaId}/${item.id}`);
  };
  
  const handleCreateNew = (schemaId: string) => {
    navigate(`/content/${schemaId}/new`);
  };
  
  return (
    <div className="space-y-6">
      <ContentListHeader 
        handleCreateNew={handleCreateNew}
        schemas={exampleSchemas} 
      />
      
      <div className="rounded-md border">
        <div className="p-4 bg-muted/50">
          <FilterForm
            onSubmitFilters={onSubmitFilters}
            resetFilters={resetFilters}
            schemas={exampleSchemas}
            uniqueAuthors={uniqueAuthors}
          />
        </div>
        
        <ContentTable 
          items={displayedItems}
          schemas={exampleSchemas}
          onRowClick={handleRowClick}
        />
        
        <ContentPagination
          currentPage={currentPage}
          totalPages={totalPages}
          setCurrentPage={setCurrentPage}
        />
      </div>
    </div>
  );
};

export default ContentEditorPage;
