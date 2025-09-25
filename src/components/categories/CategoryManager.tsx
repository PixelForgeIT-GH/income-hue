import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Folder } from "lucide-react";
import { CategoryData } from "@/hooks/useCategories";
import { useToast } from "@/hooks/use-toast";

interface CategoryManagerProps {
  categories: CategoryData[];
  onAddCategory: (name: string) => void;
  onDeleteCategory: (id: string) => void;
}

export const CategoryManager = ({ 
  categories, 
  onAddCategory, 
  onDeleteCategory 
}: CategoryManagerProps) => {
  const [newCategoryName, setNewCategoryName] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const { toast } = useToast();

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newCategoryName.trim()) {
      toast({
        title: "Error",
        description: "Category name cannot be empty",
        variant: "destructive",
      });
      return;
    }

    const exists = categories.some(
      cat => cat.name.toLowerCase() === newCategoryName.toLowerCase()
    );
    
    if (exists) {
      toast({
        title: "Error",
        description: "Category already exists",
        variant: "destructive",
      });
      return;
    }

    onAddCategory(newCategoryName.trim());
    setNewCategoryName("");
    setShowAddForm(false);
  };

  return (
    <Card className="p-6 shadow-card border-border/50">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Folder size={20} />
          Categories
        </h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2"
        >
          <Plus size={16} />
          Add Category
        </Button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAddCategory} className="mb-4 p-4 bg-muted/30 rounded-lg">
          <div className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="categoryName">Category Name</Label>
              <Input
                id="categoryName"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="e.g., Food, Transportation"
                autoFocus
              />
            </div>
            <div className="flex items-end gap-2">
              <Button type="submit" size="sm">
                Add
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={() => {
                  setShowAddForm(false);
                  setNewCategoryName("");
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </form>
      )}

      <div className="space-y-2">
        {categories.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Folder size={48} className="mx-auto mb-2 opacity-50" />
            <p>No categories yet</p>
            <p className="text-sm">Create categories to organize your transactions</p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Badge
                key={category.id}
                variant="secondary"
                className="flex items-center gap-2 px-3 py-1"
              >
                {category.name}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDeleteCategory(category.id)}
                  className="h-4 w-4 p-0 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 size={12} />
                </Button>
              </Badge>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};