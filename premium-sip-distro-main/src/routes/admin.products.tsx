import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { SiteLayout } from "@/components/site/Layout";
import { useAuth } from "@/lib/auth";
import { fetchApi } from "@/lib/api";
import { Plus, Edit, Trash2, Eye, EyeOff, Search, Filter, RefreshCw, Package } from "lucide-react";
import { formatNaira, CATEGORIES } from "@/lib/products";

export const Route = createFileRoute("/admin/products")({
  component: AdminProducts,
});

function AdminProducts() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [stockFilter, setStockFilter] = useState("All");
  const [formData, setFormData] = useState<any>({
    name: "",
    brand: "",
    category: "",
    description: "",
    image: "",
    packageType: "",
    quantity: 0,
    sku: "",
    costPrice: 0,
    lowStockThreshold: 10,
    purchaseTypes: [{ type: "Single", units: 1, sellingPrice: 0 }],
  });

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "Admin")) {
      navigate({ to: "/" });
      return;
    }
    loadProducts();
  }, [user, authLoading, navigate]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await fetchApi("/products/admin");
      setProducts(data);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        search === "" ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.brand || "").toLowerCase().includes(search.toLowerCase());
      const matchesCategory =
        categoryFilter === "All" || p.category === categoryFilter;
      const matchesStock =
        stockFilter === "All" ||
        (stockFilter === "In Stock" && p.stock > 0) ||
        (stockFilter === "Low Stock" && p.stock > 0 && p.stock <= p.lowStockThreshold) ||
        (stockFilter === "Out of Stock" && p.stock === 0);
      return matchesSearch && matchesCategory && matchesStock;
    });
  }, [products, search, categoryFilter, stockFilter]);

  const handleToggleActive = async (id: string) => {
    try {
      await fetchApi(`/products/${id}/toggle`, { method: "PATCH" });
      toast.success("Product status updated");
      loadProducts();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      await fetchApi(`/products/${id}`, { method: "DELETE" });
      toast.success("Product deleted");
      loadProducts();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleOpenModal = (product?: any) => {
    if (product) {
      setEditingProduct(product);
      setFormData({ ...product });
    } else {
      setEditingProduct(null);
      setFormData({
        name: "",
        brand: "",
        category: "",
        description: "",
        image: "",
        packageType: "",
        quantity: 0,
        sku: "",
        costPrice: 0,
        lowStockThreshold: 10,
        purchaseTypes: [{ type: "Single", units: 1, sellingPrice: 0 }],
      });
    }
    setShowModal(true);
  };

  // Sync price with first purchase type
  useEffect(() => {
    if (formData.purchaseTypes && formData.purchaseTypes.length > 0) {
      setFormData({ ...formData, price: formData.purchaseTypes[0].sellingPrice });
    }
  }, [formData.purchaseTypes]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await fetchApi(`/products/${editingProduct._id}`, {
          method: "PUT",
          body: JSON.stringify(formData),
        });
        toast.success("Product updated");
      } else {
        await fetchApi("/products", {
          method: "POST",
          body: JSON.stringify(formData),
        });
        toast.success("Product created");
      }
      setShowModal(false);
      loadProducts();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <SiteLayout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <h1 className="text-3xl font-bold text-navy-deep">Product Management</h1>
          <div className="flex gap-3">
            <button onClick={() => handleOpenModal()} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700">
              <Plus className="h-4 w-4" />
              Add Product
            </button>
            <button onClick={loadProducts} className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200">
              <RefreshCw className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg"
            />
          </div>
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg">
            <option value="All">All Categories</option>
            {CATEGORIES.map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
          </select>
          <select value={stockFilter} onChange={(e) => setStockFilter(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg">
            <option value="All">All Stock</option>
            <option value="In Stock">In Stock</option>
            <option value="Low Stock">Low Stock</option>
            <option value="Out of Stock">Out of Stock</option>
          </select>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Product</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Stock (Units)</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Cost Price</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Selling Price</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredProducts.map((p) => (
                  <tr key={p._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {p.image && <img src={p.image} alt={p.name} className="w-10 h-10 object-cover rounded" />}
                        <div>
                          <div className="font-semibold text-gray-900">{p.name}</div>
                          <div className="text-sm text-gray-500">{p.brand} • {p.packageType}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{p.category}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        (p.stock) === 0 ? "bg-red-100 text-red-700" : (p.stock) <= (p.lowStockThreshold) ? "bg-yellow-100 text-yellow-700" : "bg-emerald-100 text-emerald-700"
                      }`}>{(p.stock)} units</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{formatNaira(p.costPrice)}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-navy-deep">
                      {p.purchaseTypes && p.purchaseTypes.length > 0 
                        ? formatNaira(p.purchaseTypes[0].sellingPrice) 
                        : "-"}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${p.isActive ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-600"}`}>
                        {p.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleOpenModal(p)} className="p-2 hover:bg-gray-100 rounded" title="Edit">
                          <Edit className="h-4 w-4 text-blue-600" />
                        </button>
                        <button onClick={() => handleToggleActive(p._id)} className="p-2 hover:bg-gray-100 rounded" title={p.isActive ? "Deactivate" : "Activate"}>
                          {p.isActive ? <EyeOff className="h-4 w-4 text-gray-600" /> : <Eye className="h-4 w-4 text-emerald-600" />}
                        </button>
                        <button onClick={() => handleDelete(p._id)} className="p-2 hover:bg-red-50 rounded" title="Delete">
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                </tbody>
              </table>
              {filteredProducts.length === 0 && (
                <div className="text-center py-16 text-gray-500">No products found</div>
              )}
            </div>
          </div>
        )}
      </div>
      {/* Product Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
              <h3 className="text-xl font-bold">{editingProduct ? "Edit Product" : "Add New Product"}</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-800 p-1"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1">Product Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Brand</label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="">Select Category</option>
                    {CATEGORIES.map((c) => (
                      <option key={c.name} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Package Type</label>
                  <input
                    type="text"
                    value={formData.packageType}
                    onChange={(e) => setFormData({ ...formData, packageType: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Quantity (Stock)</label>
                  <input
                    type="number"
                    min={0}
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Low Stock Threshold</label>
                  <input
                    type="number"
                    min={0}
                    value={formData.lowStockThreshold}
                    onChange={(e) => setFormData({ ...formData, lowStockThreshold: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Cost Price (₦)</label>
                  <input
                    type="number"
                    min={0}
                    value={formData.costPrice}
                    onChange={(e) => setFormData({ ...formData, costPrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">SKU</label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Image URL</label>
                <input
                  type="text"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-2">Purchase Types</h4>
                {formData.purchaseTypes.map((pt: any, index: number) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
                    <div>
                      <label className="block text-xs font-semibold mb-1">Type</label>
                      <select
                        value={pt.type}
                        onChange={(e) => {
                          const newTypes = [...formData.purchaseTypes];
                          newTypes[index].type = e.target.value;
                          setFormData({ ...formData, purchaseTypes: newTypes });
                        }}
                        className="w-full px-3 py-2 border rounded-lg text-sm"
                      >
                        <option value="Single">Single</option>
                        <option value="Pack">Pack</option>
                        <option value="Crate">Crate</option>
                        <option value="Carton">Carton</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1">Units</label>
                      <input
                        type="number"
                        min={1}
                        value={pt.units}
                        onChange={(e) => {
                          const newTypes = [...formData.purchaseTypes];
                          newTypes[index].units = Number(e.target.value);
                          setFormData({ ...formData, purchaseTypes: newTypes });
                        }}
                        className="w-full px-3 py-2 border rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1">Selling Price (₦)</label>
                      <input
                        type="number"
                        min={0}
                        value={pt.sellingPrice}
                        onChange={(e) => {
                          const newTypes = [...formData.purchaseTypes];
                          newTypes[index].sellingPrice = Number(e.target.value);
                          setFormData({ ...formData, purchaseTypes: newTypes });
                        }}
                        className="w-full px-3 py-2 border rounded-lg text-sm"
                      />
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, purchaseTypes: [...formData.purchaseTypes, { type: "Single", units: 1, sellingPrice: 0 }] })}
                  className="mt-2 text-sm text-emerald-600 font-semibold hover:text-emerald-700"
                >
                  + Add Purchase Type
                </button>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700"
                >
                  {editingProduct ? "Update Product" : "Create Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </SiteLayout>
  );
}
