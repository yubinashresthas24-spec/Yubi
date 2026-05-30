import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Package, Plus, Loader2, Edit, Trash2 } from 'lucide-react';
import { Layout } from '../components/Layout';
import { Breadcrumb } from '../components/Breadcrumb';
import { Modal } from '../components/Modal';
import { FormInput, FormTextarea } from '../components/FormInput';
import { useToast } from '../components/Toast';
import { getInventory, getCategories, createCategory, updateCategory, deleteCategory } from '../api';
import { Inventory, Category } from '../types';

export function InventoryDetailPage() {
  const { invId } = useParams<{ invId: string }>();

  const [inventory, setInventory] = useState<Inventory | null>(null);
  const [categoriesList, setCategoriesList] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const { addToast } = useToast();

  const fetchData = () => {
    if (!invId) return;
    setLoading(true);
    setError(null);
    Promise.all([getInventory(invId), getCategories(invId)])
      .then(([invData, catsData]) => {
        setInventory(invData);
        setCategoriesList(catsData);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Failed to load inventory details');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchData();
  }, [invId]);

  useEffect(() => {
    if (editingCategory) {
      setName(editingCategory.name);
      setDescription(editingCategory.description || '');
    } else {
      setName('');
      setDescription('');
    }
    setFormErrors({});
    setActionError(null);
  }, [editingCategory, isCreateOpen]);

  const validateCategoryForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!name.trim()) {
      errors.name = 'Category name is required';
    } else if (name.length < 3) {
      errors.name = 'Category name must be at least 3 characters';
    }

    if (description.length > 500) {
      errors.description = 'Description must not exceed 500 characters';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const openCreateModal = () => {
    setName('');
    setDescription('');
    setFormErrors({});
    setActionError(null);
    setIsCreateOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invId || !validateCategoryForm()) return;

    setActionLoading(true);
    setActionError(null);

    try {
      await createCategory(invId, name, description);
      addToast('Category created successfully', 'success');
      setIsCreateOpen(false);
      fetchData();
    } catch (err: any) {
      setActionError(err.message || 'Failed to create category');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invId || !editingCategory || !validateCategoryForm()) return;

    setActionLoading(true);
    setActionError(null);

    try {
      await updateCategory(invId, editingCategory.id, name, description);
      addToast('Category updated successfully', 'success');
      setEditingCategory(null);
      fetchData();
    } catch (err: any) {
      setActionError(err.message || 'Failed to update category');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteSubmit = async () => {
    if (!invId || !deletingCategory) return;

    setActionLoading(true);
    setActionError(null);

    try {
      await deleteCategory(invId, deletingCategory.id);
      addToast('Category deleted successfully', 'success');
      setDeletingCategory(null);
      fetchData();
    } catch (err: any) {
      setActionError(err.message || 'Failed to delete category');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout currentPage="inventories" pageTitle="Loading...">
        <div className="flex flex-col items-center justify-center py-24">
          <Loader2 className="w-8 h-8 text-primary-500 animate-spin mb-2" />
          <p className="text-slate-400 text-sm">Loading inventory categories...</p>
        </div>
      </Layout>
    );
  }

  if (error || !inventory) {
    return (
      <Layout currentPage="inventories" pageTitle="Inventory Error">
        <div className="bg-red-900/50 border border-red-800 rounded-xl p-6 text-center max-w-xl mx-auto my-12">
          <p className="text-red-400 font-medium mb-2">Error Loading Inventory</p>
          <p className="text-red-300 text-sm mb-4">{error || 'Inventory not found'}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/inventories"
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium rounded-lg transition-colors"
            >
              Back to Inventories
            </Link>
            <button
              onClick={fetchData}
              className="px-4 py-2 bg-red-800 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout currentPage="inventories" pageTitle={inventory.name}>
      <Breadcrumb
        items={[
          { label: 'Inventories', href: '/inventories' },
          { label: inventory.name },
        ]}
      />

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-slate-400">Manage categories inside this inventory.</p>
          <p className="text-xs text-slate-500 mt-1">Create, rename, or remove categories while keeping your item structure organized.</p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>New Category</span>
        </button>
      </div>

      {categoriesList.length === 0 ? (
        <div className="text-center py-16 bg-slate-900 border border-slate-800 rounded-xl">
          <Package className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No categories yet</h3>
          <p className="text-slate-400 text-sm mb-4">
            Add your first category to organize inventory items and track counts.
          </p>
          <button
            onClick={openCreateModal}
            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create One</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categoriesList.map((category) => (
            <Link
              key={category.id}
              to={`/inventories/${invId}/${category.id}`}
              className="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:shadow-lg hover:shadow-slate-900/50 transition-shadow duration-200 group relative flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 rounded-lg bg-cyan-900/50">
                    <Package className="w-6 h-6 text-cyan-400" />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setEditingCategory(category);
                      }}
                      className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                      title="Edit category"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setDeletingCategory(category);
                      }}
                      className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
                      title="Delete category"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-primary-400 transition-colors">
                  {category.name}
                </h3>
                <p className="text-slate-400 text-sm mb-4 line-clamp-2">
                  {category.description || 'No description provided.'}
                </p>
              </div>

              <div className="flex flex-col gap-2 text-sm text-slate-400">
                <span>{category.item_count} items</span>
                <span>{category.total_quantity} total units</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="New Category"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <FormInput
            label="Name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Storage Shelves"
            error={formErrors.name}
          />
          <FormTextarea
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional category description"
            rows={3}
            helperText={`${description.length}/500 characters`}
            error={formErrors.description}
          />
          {actionError && (
            <p className="text-sm text-red-400 bg-red-900/30 border border-red-800 rounded-lg p-3">
              {actionError}
            </p>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsCreateOpen(false)}
              disabled={actionLoading}
              className="px-4 py-2 text-slate-400 hover:text-white text-sm font-medium transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1.5"
            >
              {actionLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>Create</span>
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={!!editingCategory}
        onClose={() => setEditingCategory(null)}
        title="Edit Category"
      >
        <form onSubmit={handleUpdateSubmit} className="space-y-4">
          <FormInput
            label="Name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Category name"
            error={formErrors.name}
          />
          <FormTextarea
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional category description"
            rows={3}
            helperText={`${description.length}/500 characters`}
            error={formErrors.description}
          />
          {actionError && (
            <p className="text-sm text-red-400 bg-red-900/30 border border-red-800 rounded-lg p-3">
              {actionError}
            </p>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setEditingCategory(null)}
              disabled={actionLoading}
              className="px-4 py-2 text-slate-400 hover:text-white text-sm font-medium transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1.5"
            >
              {actionLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </Modal>

      {deletingCategory && (
        <Modal
          isOpen={!!deletingCategory}
          onClose={() => setDeletingCategory(null)}
          title="Delete Category"
          maxWidth="md"
        >
          <p className="text-slate-400 text-sm mb-4">
            Are you sure you want to delete <span className="font-semibold text-white">"{deletingCategory.name}"</span>?
            This will permanently delete the category and any associated items.
          </p>
          {actionError && (
            <p className="text-sm text-red-400 bg-red-900/30 border border-red-800 rounded-lg p-3 mb-4">
              {actionError}
            </p>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setDeletingCategory(null)}
              disabled={actionLoading}
              className="px-4 py-2 text-slate-400 hover:text-white text-sm font-medium transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteSubmit}
              disabled={actionLoading}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1.5"
            >
              {actionLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>Delete</span>
            </button>
          </div>
        </Modal>
      )}
    </Layout>
  );
}
