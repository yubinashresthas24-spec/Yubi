import { useState, useEffect } from 'react';
import { Search, PackageX, Loader2 } from 'lucide-react';
import { Layout } from '../components/Layout';
import { StatusBadge } from '../components/StatusBadge';
import { getItems } from '../api';
import { Item } from '../types';

export function ItemsPage() {
  const [itemsList, setItemsList] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchAllItems = () => {
    setLoading(true);
    setError(null);
    getItems()
      .then((data) => {
        setItemsList(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Failed to load items');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchAllItems();
  }, []);

  const filteredItems = itemsList.filter(
    (item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Layout currentPage="items" pageTitle="All Items">
      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search items by name or SKU..."
            className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-800 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
          />
        </div>
      </div>

      {/* Table, Loader, Error or Empty State */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24">
          <Loader2 className="w-8 h-8 text-primary-500 animate-spin mb-2" />
          <p className="text-slate-400 text-sm">Loading all items...</p>
        </div>
      ) : error ? (
        <div className="bg-red-900/50 border border-red-800 rounded-xl p-6 text-center max-w-xl mx-auto my-12">
          <p className="text-red-400 font-medium mb-2">Error Loading Items</p>
          <p className="text-red-300 text-sm mb-4">{error}</p>
          <button
            onClick={fetchAllItems}
            className="px-4 py-2 bg-red-800 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-slate-900 border border-slate-800 rounded-xl">
          <PackageX className="w-16 h-16 text-slate-600 mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No items found</h3>
          <p className="text-slate-400 text-sm">
            {searchQuery ? 'No items match your search criteria. Try a different search term.' : 'You have no items across any category.'}
          </p>
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
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredItems.map((item) => (
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Layout>
  );
}
