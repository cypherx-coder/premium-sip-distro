import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { SiteLayout } from "@/components/site/Layout";
import { useAuth } from "@/lib/auth";
import { fetchApi } from "@/lib/api";
import { Search, User, ShoppingBag, DollarSign, Calendar } from "lucide-react";

export const Route = createFileRoute("/admin/customers")({
  component: AdminCustomers,
});

function AdminCustomers() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [customerOrders, setCustomerOrders] = useState<any[]>([]);
  const [profileLoading, setProfileLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "Admin")) {
      navigate({ to: "/" });
      return;
    }
    loadCustomers();
  }, [user, authLoading]);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const data = await fetchApi("/reports/customers");
      setCustomers(data);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadCustomerProfile = async (customerId: string) => {
    try {
      setProfileLoading(true);
      const data = await fetchApi(`/reports/customers/${customerId}`);
      setSelectedCustomer(data.customer);
      setCustomerOrders(data.orders);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setProfileLoading(false);
    }
  };

  const filteredCustomers = useMemo(() => {
    return customers.filter((c) =>
      search === "" ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase())
    );
  }, [customers, search]);

  if (loading)
    return (
      <SiteLayout>
        <div className="py-24 text-center">Loading customers...</div>
      </SiteLayout>
    );

  return (
    <SiteLayout>
      <div className="py-12 max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-navy-deep mb-8">Customer Management</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Customer List */}
          <div className="lg:col-span-1">
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search customers..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl"
              />
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 shadow-card overflow-hidden">
              <div className="p-4 border-b bg-gray-50 font-semibold">
                All Customers ({customers.length})
              </div>
              <div className="max-h-[600px] overflow-y-auto">
                {filteredCustomers.map((c) => (
                  <div
                    key={c._id}
                    onClick={() => loadCustomerProfile(c._id)}
                    className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition ${
                      selectedCustomer?._id === c._id ? "bg-emerald-50 border-l-4 border-l-emerald-600" : ""
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-1">
                      <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                        {c.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-900 truncate">{c.name}</div>
                        <div className="text-xs text-gray-500 truncate">{c.email}</div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center text-xs text-gray-600">
                      <span className="flex items-center gap-1">
                        <ShoppingBag className="h-3 w-3" /> {c.totalOrders} orders
                      </span>
                      <span className="font-semibold text-emerald-600">
                        ₦{c.totalSpent?.toLocaleString() || "0"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Customer Profile Drawer/Panel */}
          <div className="lg:col-span-2">
            {selectedCustomer ? (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-card overflow-hidden">
                {/* Profile Header */}
                <div className="p-6 border-b flex justify-between items-start">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-2xl font-bold">
                      {selectedCustomer.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{selectedCustomer.name}</h2>
                      <p className="text-gray-500">{selectedCustomer.email}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        Joined {new Date(selectedCustomer.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedCustomer(null)}
                    className="text-gray-500 hover:text-gray-800"
                  >
                    ✕
                  </button>
                </div>

                {/* Stats */}
                <div className="p-6 grid grid-cols-3 gap-4 border-b">
                  <div className="text-center">
                    <div className="text-xl font-bold text-navy-deep">{customerOrders.length}</div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide">Total Orders</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-emerald-600">
                      ₦{customerOrders.reduce((acc: number, o: any) => acc + o.totalAmount, 0).toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide">Total Spent</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-blue-600">
                      {customerOrders.length
                        ? new Date(customerOrders[0].date).toLocaleDateString()
                        : "N/A"}
                    </div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide">Last Order</div>
                  </div>
                </div>

                {/* Purchase History */}
                <div className="p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Purchase History</h3>
                  <div className="space-y-3">
                    {profileLoading ? (
                      <div className="text-center py-10">Loading orders...</div>
                    ) : customerOrders.length === 0 ? (
                      <div className="text-center py-10 text-gray-500">No orders yet</div>
                    ) : (
                      customerOrders.map((o: any) => (
                        <div
                          key={o._id}
                          className="p-4 bg-gray-50 rounded-xl border border-gray-100"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <div className="font-semibold text-gray-900">
                                Order #{o._id.slice(-8).toUpperCase()}
                              </div>
                              <div className="text-xs text-gray-500">
                                {new Date(o.date).toLocaleString()}
                              </div>
                            </div>
                            <div>
                              <div className="text-sm font-bold text-emerald-600">
                                ₦{o.totalAmount.toLocaleString()}
                              </div>
                              <span
                                className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase mt-1 ${
                                  o.status === "Delivered"
                                    ? "bg-emerald-100 text-emerald-700"
                                    : o.status === "Paid"
                                    ? "bg-blue-100 text-blue-700"
                                    : o.status === "Pending"
                                    ? "bg-yellow-100 text-yellow-700"
                                    : "bg-red-100 text-red-700"
                                }`}
                              >
                                {o.status}
                              </span>
                            </div>
                          </div>
                          <div className="text-xs text-gray-500">
                            {o.items.length} items • Delivered to: {o.deliveryAddress}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-card flex items-center justify-center h-[400px] text-gray-500">
                Select a customer to view their profile and purchase history
              </div>
            )}
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
