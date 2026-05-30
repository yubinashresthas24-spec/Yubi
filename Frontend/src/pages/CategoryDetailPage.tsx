import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Plus, Loader2, Edit, Trash2, Package } from 'lucide-react';
import { Layout } from '../components/Layout';
import { Breadcrumb } from '../components/Breadcrumb';
import { StatusBadge } from '../components/StatusBadge';
import { Modal } from '../components/Modal';
import { FormInput, FormTextarea, FormSelect } from '../components/FormInput';
import { useToast } from '../components/Toast';
import { getInventory, getCategories, getItems, createItem, updateItem, deleteItem } from '../api';
import { Inventory, Category, Item } from '../types';

export function CategoryDetailPage() {
  const { invId, catId } = useParams<{ invId: string; catId: string }>();

  const [inventory, setInventory] = useState<Inventory | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [itemsList, setItemsList] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [deletingItem, setDeletingItem] = useState<Item | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [quantity, setQuantity] = useState(0);
  const [minStock, setMinStock] = useState(0);
  const [price, setPrice] = useState(0);
  const [cost, setCost] = useState(0);
  const [supplier, setSupplier] = useState('');
  const [unit, setUnit] = useState('pcs');
  const [status, setStatus] = useState<'in-stock' | 'low-stock' | 'out-of-stock'>('in-stock');
  const [image, setImage] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const { addToast } = useToast();

  const fetchData = () => {
    if (!invId || !catId) return;
    setLoading(true);
    setError(null);
    Promise.all([
      getInventory(invId),
      getCategories(invId),
      getItems({ cat_id: catId })
    ])
      .then(([invData, catsData, itemsData]) => {
        setInventory(invData);
        const currentCat = catsData.find((cat) => cat.id === catId) || null;
        setCategory(currentCat);
        setItemsList(itemsData);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Failed to load category details');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchData();
  }, [invId, catId]);

  useEffect(() => {
    if (editingItem) {
      setName(editingItem.name);
      setSku(editingItem.sku);
      setQuantity(editingItem.quantity);
      setMinStock(editingItem.min_stock);
      setPrice(editingItem.price);
      setCost(editingItem.cost);
      setSupplier(editingItem.supplier || '');
      setUnit(editingItem.unit || 'pcs');
      setStatus(editingItem.status);
      setImage(editingItem.image || '');
    } else {
      setName('');
      setSku('');
      setQuantity(0);
      setMinStock(0);
      setPrice(0);
      setCost(0);
      setSupplier('');
      setUnit('pcs');
      setStatus('in-stock');
      setImage('');
    }
    setFormErrors({});
    setActionError(null);
  }, [editingItem]);

  const handleOpenCreate = () => {
    setName('');
    setSku('');
    setQuantity(0);
    setMinStock(0);
    setPrice(0);
    setCost(0);
    setSupplier('');
    setUnit('pcs');
    setStatus('in-stock');
    setImage('');
    setFormErrors({});
    setActionError(null);
    setIsCreateOpen(true);
  };

  const validateItemForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!name.trim()) {
      errors.name = 'Item name is required';
    }

    if (!sku.trim()) {
      errors.sku = 'SKU is required';
    }

    if (quantity < 0) {
      errors.quantity = 'Quantity cannot be negative';
    }

    if (minStock < 0) {
      errors.minStock = 'Min stock cannot be negative';
    }

    if (price < 0) {
      errors.price = 'Price cannot be negative';
    }

    if (cost < 0) {
      errors.cost = 'Cost cannot be negative';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catId || !validateItemForm()) return;
    setActionLoading(true);
    setActionError(null);
    try {
      await createItem({
        name,
        sku,
        category_id: catId,
        quantity,
        min_stock: minStock,
        price,
        cost,
        supplier: supplier || undefined,
        unit,
        status,
        image: image || undefined,
      });
      setIsCreateOpen(false);
      addToast('Item created successfully', 'success');
      const itemsData = await getItems({ cat_id: catId });
      setItemsList(itemsData);
    } catch (err: any) {
      setActionError(err.message || 'Failed to create item');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catId || !editingItem || !validateItemForm()) return;
    setActionLoading(true);
    setActionError(null);
    try {
      await updateItem(editingItem.id, {
        name,
        sku,
        category_id: catId,
        quantity,
        min_stock: minStock,
        price,
        cost,
        supplier: supplier || undefined,
        unit,
        status,
        image: image || undefined,
      });
      setEditingItem(null);
      addToast('Item updated successfully', 'success');
      const itemsData = await getItems({ cat_id: catId });
      setItemsList(itemsData);
    } catch (err: any) {
      setActionError(err.message || 'Failed to update item');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteSubmit = async () => {
    if (!catId || !deletingItem) return;
    setActionLoading(true);
    setActionError(null);
    try {
      await deleteItem(deletingItem.id);
      setDeletingItem(null);
      addToast('Item deleted successfully', 'success');
      const itemsData = await getItems({ cat_id: catId });
      setItemsList(itemsData);
    } catch (err: any) {
      setActionError(err.message || 'Failed to delete item');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout currentPage="inventories" pageTitle="Loading...">
        <div className="flex flex-col items-center justify-center py-24">
          <Loader2 className="w-8 h-8 text-primary-500 animate-spin mb-2" />
          <p className="text-slate-400 text-sm">Loading items...</p>
        </div>
      </Layout>
    );
  }

  if (error || !inventory || !category) {
    return (
      <Layout currentPage="inventories" pageTitle="Category Error">
        <div className="bg-red-900/50 border border-red-800 rounded-xl p-6 text-center max-w-xl mx-auto my-12">
          <p className="text-red-400 font-medium mb-2">Error Loading Category</p>
          <p className="text-red-300 text-sm mb-4">{error || 'Category not found'}</p>
          <div className="flex gap-4 justify-center">
            <Link to={`/inventories/${invId}`} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium rounded-lg transition-colors">
              Back to Inventory
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
    <Layout currentPage="inventories" pageTitle={category.name}>
      <Breadcrumb
        items={[
          { label: 'Inventories', href: '/inventories' },
          { label: inventory.name, href: `/inventories/${invId}` },
          { label: category.name },
        ]}
      />

      <div className="mb-6">
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>New Item</span>
        </button>
      </div>

      {itemsList.length === 0 ? (
        <div className="text-center py-16 bg-slate-900 border border-slate-800 rounded-xl">
          <Package className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No items found</h3>
          <p className="text-slate-400 text-sm mb-4">
            Add items to this category to begin tracking stock levels.
          </p>
          <button
            onClick={handleOpenCreate}
            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create Item</span>
          </button>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-800/50">
                  <th className="text-left px-6 py-4 text-sm font-medium text-slate-300">Name</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-slate-300">SKU</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-slate-300">Quantity</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-slate-300">Min Stock</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-slate-300">Price</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-slate-300">Cost</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-slate-300">Supplier</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-slate-300">Unit</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-slate-300">Status</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-slate-300">Last Updated</th>
                  <th className="text-right px-6 py-4 text-sm font-medium text-slate-300">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {itemsList.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4 text-sm text-white">{item.name}</td>
                    <td className="px-6 py-4 text-sm text-slate-400 font-mono">{item.sku}</td>
                    <td className="px-6 py-4 text-sm text-white">{item.quantity}</td>
                    <td className="px-6 py-4 text-sm text-slate-400">{item.min_stock}</td>
                    <td className="px-6 py-4 text-sm text-emerald-400">
                      ${item.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 text-sm text-blue-400">
                      ${item.cost.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400">{item.supplier || '-'}</td>
                    <td className="px-6 py-4 text-sm text-slate-400">{item.unit}</td>
                    <td className="px-6 py-4">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {item.last_updated ? item.last_updated.split('T')[0] : '-'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setEditingItem(item)}
                          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingItem(item)}
                          className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-2xl w-full p-6 relative my-8">
            <h3 className="text-lg font-semibold text-white mb-4">New Item</h3>
            {actionError && (
              <p className="text-sm text-red-400 bg-red-900/30 border border-red-800 rounded-lg p-2.5 mb-4">{actionError}</p>
            )}
            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. USB-C Cable"
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">SKU</label>
                  <input
                    type="text"
                    required
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    placeholder="e.g. USB-CABLE-001"
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm font-mono"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Quantity</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Min Stock Level</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={minStock}
                    onChange={(e) => setMinStock(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Selling Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    min={0}
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Cost Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    min={0}
                    value={cost}
                    onChange={(e) => setCost(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Supplier (optional)</label>
                  <input
                    type="text"
                    value={supplier}
                    onChange={(e) => setSupplier(e.target.value)}
                    placeholder="e.g. Acme Corp"
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Unit</label>
                  <input
                    type="text"
                    required
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    placeholder="e.g. pcs, box, kg"
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm"
                  >
                    <option value="in-stock">In Stock</option>
                    <option value="low-stock">Low Stock</option>
                    <option value="out-of-stock">Out of Stock</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Image URL (optional)</label>
                  <input
                    type="text"
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm"
                  />
                </div>
              </div>
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
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-2xl w-full p-6 relative my-8">
            <h3 className="text-lg font-semibold text-white mb-4">Edit Item</h3>
            {actionError && (
              <p className="text-sm text-red-400 bg-red-900/30 border border-red-800 rounded-lg p-2.5 mb-4">{actionError}</p>
            )}
            <form onSubmit={handleUpdateSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">SKU</label>
                  <input
                    type="text"
                    required
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm font-mono"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Quantity</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Min Stock Level</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={minStock}
                    onChange={(e) => setMinStock(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Selling Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    min={0}
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Cost Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    min={0}
                    value={cost}
                    onChange={(e) => setCost(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Supplier (optional)</label>
                  <input
                    type="text"
                    value={supplier}
                    onChange={(e) => setSupplier(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Unit</label>
                  <input
                    type="text"
                    required
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm"
                  >
                    <option value="in-stock">In Stock</option>
                    <option value="low-stock">Low Stock</option>
                    <option value="out-of-stock">Out of Stock</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Image URL (optional)</label>
                  <input
                    type="text"
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
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
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 relative">
            <h3 className="text-lg font-semibold text-white mb-2">Delete Item</h3>
            <p className="text-slate-400 text-sm mb-4">
              Are you sure you want to delete <span className="font-semibold text-white">"{deletingItem.name}"</span>?
              This action cannot be undone.
            </p>
            {actionError && (
              <p className="text-sm text-red-400 bg-red-900/30 border border-red-800 rounded-lg p-2.5 mb-4">{actionError}</p>
            )}
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingItem(null)}
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
        </div>
      )}
    </Layout>
  );
}
