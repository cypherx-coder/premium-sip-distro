import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { SiteLayout } from "@/components/site/Layout";
import { useAuth } from "@/lib/auth";
import { fetchApi } from "@/lib/api";
import { formatNaira } from "@/lib/products";
import {
  BarChart3,
  TrendingUp,
  Calendar,
  Trophy,
  AlertTriangle,
  DollarSign,
} from "lucide-react";

export const Route = createFileRoute("/admin/reports")({
  component: AdminReports,
});

function AdminReports() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [reportData, setReportData] = useState<any>(null);
  const [performance, setPerformance] = useState<any>(null);
  const [range, setRange] = useState("monthly");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "Admin")) {
      navigate({ to: "/" });
      return;
    }
    loadReports();
  }, [user, authLoading]);

  const loadReports = async () => {
    try {
      setLoading(true);
      let url = "/reports/sales";
      const params: string[] = [];
      if (startDate) params.push(`startDate=${encodeURIComponent(startDate)}`);
      if (endDate) params.push(`endDate=${encodeURIComponent(endDate)}`);
      if (range) params.push(`period=${range}`);
      if (params.length > 0) url += `?${params.join("&")}`;
      
      const [salesData, perfData] = await Promise.all([
        fetchApi(url),
        fetchApi("/reports/performance"),
      ]);
      setReportData(salesData);
      setPerformance(perfData || {});
    } catch (err: any) {
      toast.error(err.message);
      setReportData(null);
      setPerformance({});
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <SiteLayout>
        <div className="py-24 text-center">Loading reports...</div>
      </SiteLayout>
    );

  const totalRevenue = reportData?.totalRevenue || 0;
  const totalOrders = reportData?.totalOrders || 0;
  const totalItemsSold = reportData?.totalItemsSold || 0;
  const safeSales = reportData?.sales || [];

  return (
    <SiteLayout>
      <div className="py-12 max-w-7xl mx-auto px-4">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
          <h1 className="text-3xl font-bold text-navy-deep">Sales Reports</h1>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex gap-2 bg-gray-100 p-1 rounded-xl">
              {["daily", "weekly", "monthly", "yearly"].map((r) => (
                <button
                  key={r}
                  onClick={() => {
                    setRange(r);
                    setStartDate("");
                    setEndDate("");
                    // loadReports will be triggered by range change if we use useEffect, but here we call it manually
                  }}
                  className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition ${
                    range === r
                      ? "bg-white text-emerald-600 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
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
              <button
                onClick={loadReports}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700"
              >
                Apply
              </button>
            </div>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-card">
            <div className="text-sm text-gray-500 font-semibold uppercase tracking-wider mb-2">
              Revenue ({range})
            </div>
            <div className="text-3xl font-bold text-emerald-600">
              {formatNaira(totalRevenue)}
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-card">
            <div className="text-sm text-gray-500 font-semibold uppercase tracking-wider mb-2">
              Orders
            </div>
            <div className="text-3xl font-bold text-navy-deep">{totalOrders}</div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-card">
            <div className="text-sm text-gray-500 font-semibold uppercase tracking-wider mb-2">
              Units Sold
            </div>
            <div className="text-3xl font-bold text-blue-600">
              {totalItemsSold}
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-card">
            <div className="text-sm text-gray-500 font-semibold uppercase tracking-wider mb-2">
              Avg. Order Value
            </div>
            <div className="text-3xl font-bold text-purple-600">
              {formatNaira(totalOrders ? totalRevenue / totalOrders : 0)}
            </div>
          </div>
        </div>

        {/* Product Performance */}
        {performance && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Best Sellers */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-card">
              <h3 className="text-lg font-bold text-navy-deep mb-4 flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" /> Best Selling Products
              </h3>
              <div className="space-y-3">
                {(performance.bestSellers || []).slice(0, 5).map((prod: any, idx: number) => (
                  <div key={prod.product?._id} className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-yellow-100 text-yellow-700 rounded-full flex items-center justify-center font-bold">
                        {idx + 1}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 text-sm">
                          {prod.product?.name}
                        </div>
                        <div className="text-xs text-gray-500">{prod.unitsSold} units</div>
                      </div>
                    </div>
                    <div className="font-bold text-emerald-600 text-sm">
                      {formatNaira(prod.revenue)}
                    </div>
                  </div>
                ))}
                {(performance.bestSellers || []).length === 0 && (
                  <div className="text-center py-4 text-gray-500">No sales data</div>
                )}
              </div>
            </div>

            {/* Most Profitable */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-card">
              <h3 className="text-lg font-bold text-navy-deep mb-4 flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-emerald-600" /> Most Profitable
              </h3>
              <div className="space-y-3">
                {(performance.mostProfitable || []).slice(0, 5).map((prod: any, idx: number) => (
                  <div key={prod.product?._id} className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center font-bold">
                        {idx + 1}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 text-sm">
                          {prod.product?.name}
                        </div>
                        <div className="text-xs text-gray-500">{prod.unitsSold} units</div>
                      </div>
                    </div>
                    <div className="font-bold text-purple-600 text-sm">
                      {formatNaira(prod.profit)}
                    </div>
                  </div>
                ))}
                {(performance.mostProfitable || []).length === 0 && (
                  <div className="text-center py-4 text-gray-500">No sales data</div>
                )}
              </div>
            </div>

            {/* Slow Moving */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-card">
              <h3 className="text-lg font-bold text-navy-deep mb-4 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600" /> Slow Moving
              </h3>
              <div className="space-y-3">
                {(performance.slowMoving || []).slice(0, 5).map((prod: any, idx: number) => (
                  <div key={prod.product?._id} className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-yellow-100 text-yellow-700 rounded-full flex items-center justify-center font-bold">
                        {idx + 1}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 text-sm">
                          {prod.product?.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {prod.unitsSold === 0 ? "Never sold" : `${prod.unitsSold} units`}
                        </div>
                      </div>
                    </div>
                    {prod.lastSold && (
                      <div className="text-xs text-gray-500">
                        Last: {new Date(prod.lastSold).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                ))}
                {(performance.slowMoving || []).length === 0 && (
                  <div className="text-center py-4 text-gray-500">No slow products</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Recent Sales */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-card overflow-hidden">
          <div className="p-6 border-b border-gray-200 font-bold text-navy-deep flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-emerald-600" /> Recent Sales
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase">Date</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase">Customer</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase">Items</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase">Status</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {safeSales.map((s: any) => (
                  <tr key={s._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm">{new Date(s.date).toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm">{s.customerName}</td>
                    <td className="px-6 py-4 text-sm">{s.items.length} items</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-bold ${
                          s.status === "Delivered"
                            ? "bg-emerald-100 text-emerald-700"
                            : s.status === "Paid"
                            ? "bg-blue-100 text-blue-700"
                            : s.status === "Pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {s.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-bold text-emerald-600">
                      {formatNaira(s.totalAmount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {safeSales.length === 0 && (
            <div className="p-12 text-center text-gray-500">
              No sales recorded for this period.
            </div>
          )}
        </div>
      </div>
    </SiteLayout>
  );
}
