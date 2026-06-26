import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { SiteLayout } from "@/components/site/Layout";
import { useAuth } from "@/lib/auth";
import { fetchApi } from "@/lib/api";
import { formatNaira } from "@/lib/products";
import {
  Users,
  Package,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  Trophy,
  History,
  Settings,
  UsersRound,
  ClipboardList,
} from "lucide-react";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboardIndex,
});

function AdminDashboardIndex() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [summary, setSummary] = useState<any>({
    totalRevenue: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalProducts: 0,
    pending: 0,
    paid: 0,
    delivered: 0,
    totalProfit: 0,
    todayRevenue: 0,
    monthlyRevenue: 0
  });
  const [alerts, setAlerts] = useState<any>({ lowStock: [], outOfStock: [] });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [performance, setPerformance] = useState<any>({ bestSellers: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "Admin")) {
      toast.error("Access denied");
      navigate({ to: "/" });
      return;
    }

    if (user?.role === "Admin") {
      Promise.all([
        fetchApi("/reports/summary"),
        fetchApi("/inventory/alerts"),
        fetchApi("/orders/admin"),
        fetchApi("/reports/performance"),
      ])
        .then(([summaryData, alertsData, ordersData, perfData]) => {
          setSummary(summaryData || summary);
          setAlerts(alertsData);
          setRecentOrders(ordersData.slice(0, 5));
          setPerformance(perfData || { bestSellers: [] });
          setLoading(false);
        })
        .catch((err) => {
          toast.error("Failed to load dashboard");
          setError(err.message);
          setLoading(false);
        });
    }
  }, [user, authLoading, navigate]);

  if (loading)
    return (
      <SiteLayout>
        <div className="py-24 text-center">Loading dashboard...</div>
      </SiteLayout>
    );

  if (error)
    return (
      <SiteLayout>
        <div className="py-24 text-center max-w-md mx-auto px-4">
          <div className="text-red-600 mb-4">
            <AlertCircle className="h-12 w-12 mx-auto" />
          </div>
          <h2 className="text-2xl font-bold text-navy-deep mb-2">Failed to load dashboard</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-emerald-600 text-white rounded-lg font-semibold"
          >
            Try again
          </button>
        </div>
      </SiteLayout>
    );

  return (
    <SiteLayout>
      <div className="py-12 max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-navy-deep mb-8">Admin Dashboard</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Revenue"
            value={formatNaira(summary.totalRevenue || 0)}
            icon={<DollarSign />}
            color="emerald"
          />
          <StatCard
            title="Total Profit"
            value={formatNaira(summary.totalProfit || 0)}
            icon={<TrendingUp />}
            color="blue"
          />
          <StatCard
            title="Today's Revenue"
            value={formatNaira(summary.todayRevenue || 0)}
            icon={<DollarSign />}
            color="purple"
          />
          <StatCard
            title="Monthly Revenue"
            value={formatNaira(summary.monthlyRevenue || 0)}
            icon={<Package />}
            color="gold"
          />
        </div>

        {/* Order Status Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <StatusCard
            title="Pending Orders"
            value={summary.pending || 0}
            icon={<Clock />}
            color="yellow"
          />
          <StatusCard
            title="Paid Orders"
            value={summary.paid || 0}
            icon={<CheckCircle />}
            color="blue"
          />
          <StatusCard
            title="Delivered Orders"
            value={summary.delivered || 0}
            icon={<TrendingUp />}
            color="emerald"
          />
        </div>

        {/* Main Grid: Alerts, Recent Orders, Best Sellers */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Low Stock & Out of Stock */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-card">
            <h3 className="text-lg font-bold text-navy-deep mb-4 flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-600" /> Stock Alerts
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-semibold text-yellow-800">Low Stock</div>
                  <div className="text-2xl font-bold text-yellow-700">
                    {alerts.lowStock.length}
                  </div>
                </div>
                {alerts.lowStock.slice(0, 3).map((p: any) => (
                  <div key={p._id} className="flex justify-between text-sm py-1">
                    <span className="text-yellow-900 truncate">{p.name}</span>
                    <span className="font-semibold">{p.stock} units</span>
                  </div>
                ))}
                {alerts.lowStock.length === 0 && (
                  <div className="text-xs text-yellow-600 italic">No low stock</div>
                )}
              </div>
              <div className="bg-red-50 p-4 rounded-xl border border-red-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-semibold text-red-800">Out of Stock</div>
                  <div className="text-2xl font-bold text-red-700">
                    {alerts.outOfStock.length}
                  </div>
                </div>
                {alerts.outOfStock.slice(0, 3).map((p: any) => (
                  <div key={p._id} className="flex justify-between text-sm py-1">
                    <span className="text-red-900 truncate">{p.name}</span>
                    <span className="font-semibold">0 units</span>
                  </div>
                ))}
                {alerts.outOfStock.length === 0 && (
                  <div className="text-xs text-red-600 italic">All in stock</div>
                )}
              </div>
            </div>
            <Link
              to="/admin/inventory"
              className="w-full py-2 border border-gray-200 rounded-lg text-sm font-semibold hover:bg-gray-50 inline-block text-center"
            >
              Manage Inventory
            </Link>
          </div>

          {/* Recent Orders */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-card">
            <h3 className="text-lg font-bold text-navy-deep mb-4 flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-blue-600" /> Recent Orders
            </h3>
            <div className="space-y-3 mb-4">
              {recentOrders.map((o: any) => (
                <div
                  key={o._id}
                  className="flex justify-between items-center p-3 bg-gray-50 rounded-xl"
                >
                  <div>
                    <div className="font-semibold text-sm">{o.customerName}</div>
                    <div className="text-xs text-gray-500">
                      {o.orderNumber} - {new Date(o.date).toLocaleString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-sm text-emerald-600">
                      {formatNaira(o.totalAmount)}
                    </div>
                    <div className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full inline-block ${
                      o.status === 'Paid' ? 'bg-emerald-100 text-emerald-700' :
                      o.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                      o.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {o.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Link
              to="/admin/orders"
              className="w-full py-2 border border-gray-200 rounded-lg text-sm font-semibold hover:bg-gray-50 inline-block text-center"
            >
              View All Orders
            </Link>
          </div>

          {/* Best Sellers */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-card">
            <h3 className="text-lg font-bold text-navy-deep mb-4 flex items-center gap-2">
              <Trophy className="h-5 w-5 text-gold" /> Top Performing Products
            </h3>
            <div className="space-y-4 mb-4">
              {performance?.bestSellers.slice(0, 4).map((s: any) => (
                <div key={s.product._id} className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-gray-100 rounded-lg flex-shrink-0 flex items-center justify-center text-xl">
                    {s.product.image ? (
                      <img
                        src={s.product.image}
                        alt=""
                        className="h-full w-full object-contain p-1"
                      />
                    ) : (
                      "📦"
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-navy-deep truncate">
                      {s.product.name}
                    </div>
                    <div className="text-[10px] text-gray-500">
                      {s.unitsSold} units sold
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold text-emerald-600">
                      {formatNaira(s.revenue)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Link
              to="/admin/reports"
              className="w-full py-2 border border-gray-200 rounded-lg text-sm font-semibold hover:bg-gray-50 inline-block text-center"
            >
              Full Sales Reports
            </Link>
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <QuickLink
            to="/admin/products"
            icon={<Package className="h-6 w-6 text-emerald-600" />}
            title="Products"
            description="Add, edit, restock products"
          />
          <QuickLink
            to="/admin/inventory"
            icon={<AlertCircle className="h-6 w-6 text-yellow-600" />}
            title="Inventory"
            description="Manage stock levels & alerts"
          />
          <QuickLink
            to="/admin/customers"
            icon={<UsersRound className="h-6 w-6 text-blue-600" />}
            title="Customers"
            description="View customer profiles"
          />
          <QuickLink
            to="/admin/profile"
            icon={<Settings className="h-6 w-6 text-purple-600" />}
            title="Settings"
            description="Update profile & business info"
          />
        </div>
      </div>
    </SiteLayout>
  );
}

function StatCard({ title, value, icon, color }: any) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-card">
      <div
        className={`w-12 h-12 rounded-xl bg-${color}-50 flex items-center justify-center text-${color}-600 mb-4`}
      >
        {icon}
      </div>
      <div className="text-sm text-gray-500 font-semibold">{title}</div>
      <div className="text-2xl font-bold text-navy-deep mt-1">{value}</div>
    </div>
  );
}

function StatusCard({ title, value, icon, color }: any) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-card flex items-center gap-4">
      <div
        className={`w-10 h-10 rounded-full bg-${color}-50 flex items-center justify-center text-${color}-600`}
      >
        {icon}
      </div>
      <div>
        <div className="text-2xl font-bold text-navy-deep">{value}</div>
        <div className="text-xs text-gray-500 uppercase tracking-wider font-bold">{title}</div>
      </div>
    </div>
  );
}

function QuickLink({ to, icon, title, description }: any) {
  return (
    <Link
      to={to}
      className="p-5 bg-white border border-gray-200 rounded-2xl hover:shadow-card transition text-left block"
    >
      <div className="mb-3">{icon}</div>
      <h4 className="font-bold text-navy-deep mb-1">{title}</h4>
      <p className="text-sm text-gray-500">{description}</p>
    </Link>
  );
}
