import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Package, Calendar, Loader2, Edit, Trash2, AlertCircle } from 'lucide-react';
import { Layout } from '../components/Layout';
import { Modal } from '../components/Modal';
import { FormInput, FormTextarea } from '../components/FormInput';
import { useToast } from '../components/Toast';
import { getInventories, createInventory, updateInventory, deleteInventory } from '../api';
import { Inventory } from '../types';

export function InventoriesPage() {
  const [inventoriesList, setInventoriesList] = useState<Inventory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingInventory, setEditingInventory] = useState<Inventory | null>(null);
  const [deletingInventory, setDeletingInventory] = useState<Inventory | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const { addToast } = useToast();

  const fetchData = () => {
    setLoading(true);
    setError(null);
    getInventories()
      .then((data) => {
        setInventoriesList(data);
        setLoading(false);
      })
      .catch((err) => {
        const message = err.message || 'Failed to load inventories';
        setError(message);
        addToast(message, 'error');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (editingInventory) {
      setName(editingInventory.name);
      setDescription(editingInventory.description || '');
    } else {
      setName('');
      setDescription('');
    }
    setFormErrors({});
  }, [editingInventory]);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!name.trim()) {
      errors.name = 'Name is required';
    } else if (name.length < 3) {
      errors.name = 'Name must be at least 3 characters';
    } else if (name.length > 100) {
      errors.name = 'Name must not exceed 100 characters';
    }

    if (description && description.length > 500) {
      errors.description = 'Description must not exceed 500 characters';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleOpenCreate = () => {
    setName('');
    setDescription('');
    setFormErrors({});
    setIsCreateOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setActionLoading(true);
    try {
      await createInventory(name, description || undefined);
      setIsCreateOpen(false);
      addToast('Inventory created successfully', 'success');
      fetchData();
    } catch (err: any) {
      const message = err.message || 'Failed to create inventory';
      addToast(message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingInventory || !validateForm()) return;

    setActionLoading(true);
    try {
      await updateInventory(editingInventory.id, name, description || undefined);
      setEditingInventory(null);
      addToast('Inventory updated successfully', 'success');
      fetchData();
    } catch (err: any) {
      const message = err.message || 'Failed to update inventory';
      addToast(message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteSubmit = async () => {
    if (!deletingInventory) return;

    setActionLoading(true);
    try {
      await deleteInventory(deletingInventory.id);
      setDeletingInventory(null);
      addToast('Inventory deleted successfully', 'success');
      fetchData();
    } catch (err: any) {
      const message = err.message || 'Failed to delete inventory';
      addToast(message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <Layout currentPage="inventories" pageTitle="Inventories">
      <div className="mb-6 flex justify-between items-center">
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>New Inventory</span>
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24">
          <Loader2 className="w-8 h-8 text-primary-500 animate-spin mb-2" />
          <p className="text-slate-400 text-sm">Loading inventories...</p>
        </div>
      ) : error ? (
        <div className="bg-red-900/50 border border-red-800 rounded-xl p-6 text-center max-w-xl mx-auto my-12">
          <div className="flex items-center justify-center gap-2 mb-3">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <p className="text-red-400 font-medium">Error Loading Inventories</p>
          </div>
          <p className="text-red-300 text-sm mb-4">{error}</p>
          <button
            onClick={fetchData}
            className="px-4 py-2 bg-red-800 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      ) : inventoriesList.length === 0 ? (
        <div className="text-center py-16 bg-slate-900 border border-slate-800 rounded-xl">
          <Package className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No inventories found</h3>
          <p className="text-slate-400 text-sm mb-4">
            Get started by creating your first inventory.
          </p>
          <button
            onClick={handleOpenCreate}
            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create Inventory</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {inventoriesList.map((inventory) => (
            <Link
              key={inventory.id}
              to={`/inventories/${inventory.id}`}
              className="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:shadow-lg hover:shadow-slate-900/50 transition-shadow duration-200 group relative flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 rounded-lg bg-primary-900/50">
                    <Package className="w-6 h-6 text-primary-400" />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setEditingInventory(inventory);
                      }}
                      className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                      title="Edit inventory"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setDeletingInventory(inventory);
                      }}
                      className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
                      title="Delete inventory"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-primary-400 transition-colors">
                  {inventory.name}
                </h3>

                <p className="text-slate-400 text-sm mb-4 line-clamp-2">
                  {inventory.description || 'No description provided.'}
                </p>
              </div>

              <div>
                <div className="flex items-center gap-4 text-sm text-slate-500">
                  <span>{inventory.category_count} categories</span>
                  <span>{inventory.item_count} items</span>
                </div>

                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-800 text-slate-500">
                  <Calendar className="w-4 h-4" />
                  <span className="text-xs">
                    Created {inventory.created_at ? inventory.created_at.split('T')[0] : 'N/A'}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Create Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="New Inventory"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <FormInput
            label="Name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Electronics Warehouse"
            error={formErrors.name}
          />
          <FormTextarea
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Main storage facility..."
            rows={3}
            error={formErrors.description}
            helperText={`${description.length}/500 characters`}
          />
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

      {/* Edit Modal */}
      <Modal
        isOpen={!!editingInventory}
        onClose={() => setEditingInventory(null)}
        title="Edit Inventory"
      >
        <form onSubmit={handleUpdateSubmit} className="space-y-4">
          <FormInput
            label="Name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={formErrors.name}
          />
          <FormTextarea
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            error={formErrors.description}
            helperText={`${description.length}/500 characters`}
          />
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setEditingInventory(null)}
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

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deletingInventory}
        onClose={() => setDeletingInventory(null)}
        title="Delete Inventory"
      >
        <div className="space-y-4">
          <p className="text-slate-400 text-sm">
            Are you sure you want to delete{' '}
            <span className="font-semibold text-white">
              "{deletingInventory?.name}"
            </span>
            ? This will permanently delete this inventory and all its categories and items.
            This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setDeletingInventory(null)}
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
        </div>
      </Modal>
    </Layout>
  );
}
