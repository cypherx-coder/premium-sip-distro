import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { SiteLayout } from "@/components/site/Layout";
import { useAuth } from "@/lib/auth";
import { fetchApi } from "@/lib/api";
import { formatNaira } from "@/lib/products";
import { Clock, CheckCircle, Truck, XCircle, Filter, Eye, X } from "lucide-react";

export const Route = createFileRoute("/admin/orders")({
  component: AdminOrders,
});

function AdminOrders() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'Admin')) {
      navigate({ to: '/' });
      return;
    }
    loadOrders();
  }, [user, authLoading]);

  const loadOrders = async () => {
    try {
      const data = await fetchApi('/orders/admin');
      setOrders(data);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await fetchApi(`/orders/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
      });
      toast.success(`Order marked as ${status}`);
      loadOrders();
      if (selectedOrder && selectedOrder._id === id) {
        setSelectedOrder({ ...selectedOrder, status });
      }
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  if (loading) return <SiteLayout><div className="py-24 text-center">Loading orders...</div></SiteLayout>;

  return (
    <SiteLayout>
      <div className="py-12 max-w-7xl mx-auto px-4">
        <h1 className="font-display text-3xl font-bold text-navy-deep mb-8">Order Management</h1>

        <div className="bg-card rounded-2xl border border-border/50 shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-secondary/50 text-navy-deep text-sm uppercase tracking-wider">
                  <th className="px-6 py-4 font-bold">Order #</th>
                  <th className="px-6 py-4 font-bold">Customer</th>
                  <th className="px-6 py-4 font-bold">Total</th>
                  <th className="px-6 py-4 font-bold">Status</th>
                  <th className="px-6 py-4 font-bold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {orders.map(order => (
                  <tr key={order._id} className="hover:bg-secondary/20 transition">
                    <td className="px-6 py-4">
                      <div className="font-bold text-navy-deep">{order.orderNumber}</div>
                      <div className="text-xs text-muted-foreground">{new Date(order.date).toLocaleString()}</div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="font-semibold">{order.customerName}</div>
                      <div className="text-xs text-muted-foreground">{order.phoneNumber}</div>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-emerald">{formatNaira(order.totalAmount)}</td>
                    <td className="px-6 py-4">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="px-6 py-4 flex items-center gap-3">
                      <button 
                        onClick={() => setSelectedOrder(order)}
                        className="p-2 text-navy-deep hover:bg-navy-deep/10 rounded-lg transition"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <select 
                        value={order.status} 
                        onChange={(e) => updateStatus(order._id, e.target.value)}
                        className="text-xs border rounded-lg px-2 py-1 outline-none focus:ring-1 focus:ring-emerald"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Paid">Paid</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {orders.length === 0 && <div className="p-12 text-center text-muted-foreground">No orders found.</div>}
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-deep/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-premium animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
              <div>
                <h2 className="text-xl font-bold text-navy-deep">Order Details</h2>
                <p className="text-sm text-muted-foreground">{selectedOrder.orderNumber}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-gray-100 rounded-full transition">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-8">
              {/* Customer Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-xs uppercase tracking-wider text-muted-foreground font-bold mb-2">Customer</h4>
                  <p className="font-bold text-navy-deep">{selectedOrder.customerName}</p>
                  <p className="text-sm">{selectedOrder.phoneNumber}</p>
                </div>
                <div>
                  <h4 className="text-xs uppercase tracking-wider text-muted-foreground font-bold mb-2">Order Date</h4>
                  <p className="text-sm">{new Date(selectedOrder.date).toLocaleString()}</p>
                  <StatusBadge status={selectedOrder.status} />
                </div>
                <div className="sm:col-span-2">
                  <h4 className="text-xs uppercase tracking-wider text-muted-foreground font-bold mb-2">Delivery Address</h4>
                  <p className="text-sm bg-gray-50 p-3 rounded-xl border border-gray-100">{selectedOrder.deliveryAddress}</p>
                </div>
                {selectedOrder.notes && (
                  <div className="sm:col-span-2">
                    <h4 className="text-xs uppercase tracking-wider text-muted-foreground font-bold mb-2">Notes</h4>
                    <p className="text-sm italic text-gray-600">{selectedOrder.notes}</p>
                  </div>
                )}
              </div>

              {/* Products Table */}
              <div>
                <h4 className="text-xs uppercase tracking-wider text-muted-foreground font-bold mb-3">Items Ordered</h4>
                <div className="border rounded-2xl overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50 text-[10px] uppercase font-bold text-gray-500">
                      <tr>
                        <th className="px-4 py-2">Product</th>
                        <th className="px-4 py-2">Quantity</th>
                        <th className="px-4 py-2 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y text-sm">
                      {selectedOrder.items.map((item: any, i: number) => (
                        <tr key={i}>
                          <td className="px-4 py-3">
                            <div className="font-bold">{item.productId?.name || 'Unknown Product'}</div>
                            <div className="text-xs text-muted-foreground">{item.unitType} @ {formatNaira(item.unitPrice)}</div>
                          </td>
                          <td className="px-4 py-3 font-semibold">{item.quantity}</td>
                          <td className="px-4 py-3 text-right font-bold text-emerald">{formatNaira(item.totalPrice)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50 font-bold">
                      <tr>
                        <td colSpan={2} className="px-4 py-3 text-right text-navy-deep">Grand Total</td>
                        <td className="px-4 py-3 text-right text-emerald text-lg">{formatNaira(selectedOrder.totalAmount)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex flex-wrap gap-3 pt-4 border-t">
                <button 
                  onClick={() => updateStatus(selectedOrder._id, 'Confirmed')}
                  className="px-4 py-2 rounded-xl bg-blue-50 text-blue-700 text-xs font-bold hover:bg-blue-100 transition"
                >
                  Confirm Order
                </button>
                <button 
                  onClick={() => updateStatus(selectedOrder._id, 'Paid')}
                  className="px-4 py-2 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-bold hover:bg-emerald-100 transition"
                >
                  Mark as Paid
                </button>
                <button 
                  onClick={() => updateStatus(selectedOrder._id, 'Delivered')}
                  className="px-4 py-2 rounded-xl bg-purple-50 text-purple-700 text-xs font-bold hover:bg-purple-100 transition"
                >
                  Mark as Delivered
                </button>
                <button 
                  onClick={() => updateStatus(selectedOrder._id, 'Cancelled')}
                  className="px-4 py-2 rounded-xl bg-red-50 text-red-700 text-xs font-bold hover:bg-red-100 transition"
                >
                  Cancel Order
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </SiteLayout>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: any = {
    'Pending': 'bg-yellow-100 text-yellow-700',
    'Confirmed': 'bg-blue-100 text-blue-700',
    'Paid': 'bg-emerald-100 text-emerald-700',
    'Delivered': 'bg-purple-100 text-purple-700',
    'Cancelled': 'bg-red-100 text-red-700',
  };

  return (
    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${styles[status] || 'bg-gray-100'}`}>
      {status}
    </span>
  );
}
