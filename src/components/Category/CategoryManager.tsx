import { useState } from 'react';
import type { Category } from '@/types';
import { Modal, Button, Input } from '@/components/common';
import { useCategories } from '@/hooks';

interface CategoryManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CategoryManager({ isOpen, onClose }: CategoryManagerProps) {
  const { sortedCategories, createCategory, renameCategory, deleteCategory } = useCategories();

  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategory, setEditingCategory] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);

  const handleCreateCategory = async () => {
    if (newCategoryName.trim()) {
      await createCategory(newCategoryName.trim());
      setNewCategoryName('');
    }
  };

  const handleStartEdit = (category: Category) => {
    setEditingCategory({ id: category.id, name: category.name });
  };

  const handleSaveEdit = async () => {
    if (editingCategory && editingCategory.name.trim()) {
      await renameCategory(editingCategory.id, editingCategory.name.trim());
      setEditingCategory(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingCategory(null);
  };

  const handleConfirmDelete = async () => {
    if (deletingCategory) {
      await deleteCategory(deletingCategory.id);
      setDeletingCategory(null);
    }
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="Manage Categories">
        <div className="space-y-6">
          {/* Create new category */}
          <div>
            <h4 className="text-sm font-medium text-foreground mb-2">Add New Category</h4>
            <div className="flex gap-2">
              <Input
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Category name"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreateCategory();
                }}
              />
              <Button onClick={handleCreateCategory} disabled={!newCategoryName.trim()}>
                Add
              </Button>
            </div>
          </div>

          {/* Category list */}
          <div>
            <h4 className="text-sm font-medium text-foreground mb-2">
              Categories ({sortedCategories.length})
            </h4>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {sortedCategories.map((category) => (
                <div
                  key={category.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-muted"
                >
                  {editingCategory?.id === category.id ? (
                    <div className="flex-1 flex gap-2">
                      <Input
                        value={editingCategory.name}
                        onChange={(e) =>
                          setEditingCategory({
                            ...editingCategory,
                            name: e.target.value,
                          })
                        }
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveEdit();
                          if (e.key === 'Escape') handleCancelEdit();
                        }}
                        autoFocus
                      />
                      <Button size="sm" onClick={handleSaveEdit}>
                        Save
                      </Button>
                      <Button size="sm" variant="ghost" onClick={handleCancelEdit}>
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <>
                      <span className="text-sm text-foreground">
                        {category.name}
                        {category.isDefault && (
                          <span className="ml-2 text-xs text-muted-foreground">(default)</span>
                        )}
                      </span>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleStartEdit(category)}
                          className="p-1 text-muted-foreground hover:text-foreground transition-smooth"
                          title="Rename"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                        </button>
                        {!category.isDefault && (
                          <button
                            onClick={() => setDeletingCategory(category)}
                            className="p-1 text-muted-foreground hover:text-red-500 transition-smooth"
                            title="Delete"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </Modal>

      {/* Delete confirmation modal */}
      <Modal
        isOpen={!!deletingCategory}
        onClose={() => setDeletingCategory(null)}
        title="Delete Category"
      >
        <div className="space-y-4">
          <p className="text-foreground">
            Are you sure you want to delete "{deletingCategory?.name}"?
          </p>
          <p className="text-sm text-muted-foreground">
            All tabs in this category will be moved to Uncategorized.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setDeletingCategory(null)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleConfirmDelete}>
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
