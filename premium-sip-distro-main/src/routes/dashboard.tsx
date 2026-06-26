import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { SiteLayout } from "@/components/site/Layout";
import { useAuth } from "@/lib/auth";
import { fetchApi } from "@/lib/api";
import { formatNaira } from "@/lib/products";
import { Package, Clock, CheckCircle, Truck, XCircle } from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  component: CustomerDashboard,
});

function CustomerDashboard() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate({ to: '/login' });
      return;
    }

    if (user) {
      fetchApi('/orders/my')
        .then(data => {
          setOrders(data);
          setLoading(false);
        })
        .catch(err => {
          toast.error("Failed to load orders");
          setLoading(false);
        });
    }
  }, [user, authLoading, navigate]);

  if (loading) return <SiteLayout><div className="py-24 text-center">Loading dashboard...</div></SiteLayout>;

  return (
    <SiteLayout>
      <div className="py-12 max-w-5xl mx-auto px-4">
        <div className="mb-10">
          <h1 className="font-display text-3xl font-bold text-navy-deep">Welcome back, {user?.name}</h1>
          <p className="text-muted-foreground mt-2">Manage your orders and profile information.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_300px] gap-8">
          <div>
            <h2 className="font-display text-xl font-bold mb-6 flex items-center gap-2">
              <Package className="h-5 w-5" /> Order History
            </h2>
            
            {orders.length === 0 ? (
              <div className="bg-card p-12 rounded-2xl border border-border/50 text-center">
                <p className="text-muted-foreground">You haven't placed any orders yet.</p>
                <button onClick={() => navigate({ to: '/products' })} className="mt-4 text-emerald font-semibold">Browse Products</button>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map(order => (
                  <div key={order._id} className="bg-card p-6 rounded-2xl border border-border/50 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="text-sm font-bold text-navy-deep">{order.orderNumber}</div>
                        <div className="text-sm text-muted-foreground">{new Date(order.date).toLocaleDateString()}</div>
                      </div>
                      <StatusBadge status={order.status} />
                    </div>
                    <div className="space-y-2">
                      {order.items.map((item: any, idx: number) => (
                        <div key={idx} className="text-sm flex justify-between">
                          <span>{item.quantity} × {item.unitType} of {item.productId?.name || 'Product'}</span>
                          <span className="font-semibold">{formatNaira(item.totalPrice)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 pt-4 border-t border-border flex justify-between items-baseline">
                      <span className="font-bold">Total Amount</span>
                      <span className="text-lg font-bold text-emerald">{formatNaira(order.totalAmount)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <aside>
            <div className="bg-card p-6 rounded-2xl border border-border/50 shadow-card">
              <h3 className="font-bold mb-4">Profile Info</h3>
              <div className="space-y-4 text-sm">
                <div>
                  <div className="text-muted-foreground">Name</div>
                  <div className="font-semibold">{user?.name}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Email</div>
                  <div className="font-semibold">{user?.email}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Role</div>
                  <div className="font-semibold uppercase tracking-wider text-[10px] bg-secondary px-2 py-0.5 rounded-full inline-block">{user?.role}</div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
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
  
  const icons: any = {
    'Pending': <Clock className="h-3 w-3" />,
    'Confirmed': <CheckCircle className="h-3 w-3" />,
    'Paid': <CheckCircle className="h-3 w-3" />,
    'Delivered': <Truck className="h-3 w-3" />,
    'Cancelled': <XCircle className="h-3 w-3" />,
  };

  return (
    <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${styles[status] || 'bg-gray-100'}`}>
      {icons[status]} {status}
    </span>
  );
}
