import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { SiteLayout } from "@/components/site/Layout";
import { useAuth } from "@/lib/auth";
import { fetchApi } from "@/lib/api";
import { formatNaira } from "@/lib/products";
import {
  Package, Plus, Minus, Search, Filter, AlertTriangle, XCircle,
  RefreshCw, Clock
} from "lucide-react";

export const Route = createFileRoute("/admin/inventory")({
  component: AdminInventory,
});

function AdminInventory() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any>({ lowStock: [], outOfStock: [] });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showRestock, setShowRestock] = useState<any>(null);
  const [showRemove, setShowRemove] = useState<any>(null);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "Admin")) {
      navigate({ to: "/" });
      return;
    }
    loadData();
  }, [user, authLoading]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [prodData, logData, alertData] = await Promise.all([
        fetchApi("/products/admin"),
        fetchApi("/inventory/logs"),
        fetchApi("/inventory/alerts"),
      ]);
      setProducts(prodData);
      setLogs(logData);
      setAlerts(alertData);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = useMemo(() => {
    return products.filter((p) =>
      search === "" ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.brand || "").toLowerCase().includes(search.toLowerCase())
    );
  }, [products, search]);

  const filteredLogs = useMemo(() => {
    let res = [...logs];
    if (startDate) res = res.filter(l => new Date(l.createdAt) >= new Date(startDate));
    if (endDate) res = res.filter(l => new Date(l.createdAt) <= new Date(endDate + "T23:59:59"));
    return res;
  }, [logs, startDate, endDate]);

  const handleRestock = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const formData = new FormData(e.currentTarget);
      const quantityVal = formData.get("quantity");
      
      if (!quantityVal) {
        toast.error("Quantity is required!");
        return;
      }
      
      const numQuantity = Number(quantityVal);
      if (isNaN(numQuantity) || numQuantity <= 0) {
        toast.error("Quantity must be a positive number!");
        return;
      }

      const data = {
        productId: showRestock._id,
        quantity: numQuantity,
        unitType: formData.get("unitType"),
      };
      await fetchApi("/inventory/add", {
        method: "POST",
        body: JSON.stringify(data),
      });
      toast.success("Stock added successfully!");
      setShowRestock(null);
      loadData();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleRemove = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const formData = new FormData(e.currentTarget);
      const quantityVal = formData.get("quantity");
      
      if (!quantityVal) {
        toast.error("Quantity is required!");
        return;
      }
      
      const numQuantity = Number(quantityVal);
      if (isNaN(numQuantity) || numQuantity <= 0) {
        toast.error("Quantity must be a positive number!");
        return;
      }

      const data = {
        productId: showRemove._id,
        quantity: numQuantity,
        unitType: formData.get("unitType"),
      };
      await fetchApi("/inventory/remove", {
        method: "POST",
        body: JSON.stringify(data),
      });
      toast.success("Stock removed successfully!");
      setShowRemove(null);
      loadData();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  if (loading)
    return (
      <SiteLayout>
        <div className="py-24 text-center">Loading inventory...</div>
      </SiteLayout>
    );

  return (
    <SiteLayout>
      <div className="py-12 max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-navy-deep">Inventory Management</h1>
          <button
            onClick={loadData}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border hover:bg-gray-100"
          >
            <RefreshCw className="h-4 w-4" /> Refresh
          </button>
        </div>

        {/* Alerts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-2xl">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="h-8 w-8 text-yellow-600" />
              <div>
                <h3 className="text-xl font-bold text-yellow-800">Low Stock Alerts</h3>
                <p className="text-sm text-yellow-700">{alerts.lowStock.length} products need restock</p>
              </div>
            </div>
            <ul className="space-y-2">
              {alerts.lowStock.slice(0, 5).map((p: any) => (
                <li key={p._id} className="flex justify-between items-center bg-white p-3 rounded-lg">
                  <div>
                    <div className="font-semibold">{p.name}</div>
                    <div className="text-xs text-gray-500">{p.stock} units left</div>
                  </div>
                  <button
                    onClick={() => setShowRestock(p)}
                    className="px-3 py-1 text-xs bg-yellow-600 text-white rounded-full hover:bg-yellow-700"
                  >
                    Restock
                  </button>
                </li>
              ))}
              {alerts.lowStock.length === 0 && (
                <li className="text-center text-yellow-600 italic">No low stock alerts</li>
              )}
            </ul>
          </div>

          <div className="bg-red-50 border border-red-200 p-6 rounded-2xl">
            <div className="flex items-center gap-3 mb-4">
              <XCircle className="h-8 w-8 text-red-600" />
              <div>
                <h3 className="text-xl font-bold text-red-800">Out of Stock</h3>
                <p className="text-sm text-red-700">{alerts.outOfStock.length} products unavailable</p>
              </div>
            </div>
            <ul className="space-y-2">
              {alerts.outOfStock.slice(0, 5).map((p: any) => (
                <li key={p._id} className="flex justify-between items-center bg-white p-3 rounded-lg">
                  <div>
                    <div className="font-semibold">{p.name}</div>
                    <div className="text-xs text-gray-500">0 units left</div>
                  </div>
                  <button
                    onClick={() => setShowRestock(p)}
                    className="px-3 py-1 text-xs bg-red-600 text-white rounded-full hover:bg-red-700"
                  >
                    Restock
                  </button>
                </li>
              ))}
              {alerts.outOfStock.length === 0 && (
                <li className="text-center text-red-600 italic">No out of stock products</li>
              )}
            </ul>
          </div>
        </div>

        {/* Current Stock Table */}
        <div className="bg-white rounded-2xl shadow-card border border-gray-200 p-6 mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h2 className="text-xl font-bold text-navy-deep">Current Stock</h2>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg"
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase">Product</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase">Stock (Units)</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase">Cost Price</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase">Status</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredProducts.map((p) => (
                  <tr key={p._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900">{p.name}</div>
                      <div className="text-xs text-gray-500">{p.brand}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-bold ${
                          p.stock === 0
                            ? "bg-red-100 text-red-700"
                            : p.stock <= p.lowStockThreshold
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-emerald-100 text-emerald-700"
                        }`}
                      >
                        {p.stock} units
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">{formatNaira(p.costPrice)}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-bold ${
                          p.isActive ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {p.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setShowRestock(p)}
                          className="px-3 py-1 text-xs bg-emerald-600 text-white rounded-full hover:bg-emerald-700"
                        >
                          <Plus className="h-3 w-3 inline mr-1" /> Add
                        </button>
                        <button
                          onClick={() => setShowRemove(p)}
                          className="px-3 py-1 text-xs bg-red-600 text-white rounded-full hover:bg-red-700"
                        >
                          <Minus className="h-3 w-3 inline mr-1" /> Remove
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Inventory Movement History */}
        <div className="bg-white rounded-2xl shadow-card border border-gray-200 p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h2 className="text-xl font-bold text-navy-deep">Inventory Movement History</h2>
            <div className="flex flex-wrap gap-2">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-3 py-2 border rounded-lg"
              />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-3 py-2 border rounded-lg"
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase">Date</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase">Action</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase">Product</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase">Quantity Changed</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredLogs.map((log) => (
                  <tr key={log._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-bold ${
                          log.type === "STOCK_ADDED"
                            ? "bg-emerald-100 text-emerald-700"
                            : log.type === "STOCK_REMOVED"
                            ? "bg-red-100 text-red-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {log.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {log.productId?.name || "N/A"}
                    </td>
                    <td className="px-6 py-4 text-sm font-bold">
                      {log.quantityChanged > 0 ? "+" : ""}
                      {log.quantityChanged} units
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{log.action}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Restock Modal */}
      {showRestock && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-xl font-bold">Restock {showRestock.name}</h3>
              <button
                onClick={() => setShowRestock(null)}
                className="text-gray-500 hover:text-gray-800"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleRestock} className="p-6 space-y-4">
              <div>
                <label className="block font-semibold mb-1">Unit Type</label>
                <select name="unitType" defaultValue="Crate" className="w-full border rounded-lg px-3 py-2">
                  {showRestock.purchaseTypes?.map((pt: any) => (
                    <option key={pt.type} value={pt.type}>
                      {pt.type} ({pt.units} units)
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-semibold mb-1">Quantity</label>
                <input
                  name="quantity"
                  type="number"
                  min={1}
                  defaultValue={1}
                  className="w-full border rounded-lg px-3 py-2"
                  required
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowRestock(null)}
                  className="px-4 py-2 border rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-emerald-600 text-white rounded-lg font-semibold"
                >
                  Confirm Restock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Remove Stock Modal */}
      {showRemove && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-xl font-bold">Remove Stock ({showRemove.name})</h3>
              <button
                onClick={() => setShowRemove(null)}
                className="text-gray-500 hover:text-gray-800"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleRemove} className="p-6 space-y-4">
              <div>
                <label className="block font-semibold mb-1">Unit Type</label>
                <select name="unitType" defaultValue="Crate" className="w-full border rounded-lg px-3 py-2">
                  {showRemove.purchaseTypes?.map((pt: any) => (
                    <option key={pt.type} value={pt.type}>
                      {pt.type} ({pt.units} units)
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-semibold mb-1">Quantity</label>
                <input
                  name="quantity"
                  type="number"
                  min={1}
                  max={showRemove.stock}
                  defaultValue={1}
                  className="w-full border rounded-lg px-3 py-2"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Max available: {showRemove.stock} units
                </p>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowRemove(null)}
                  className="px-4 py-2 border rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-red-600 text-white rounded-lg font-semibold"
                >
                  Confirm Remove
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </SiteLayout>
  );
}
