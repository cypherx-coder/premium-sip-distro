import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { SiteLayout } from "@/components/site/Layout";
import { useAuth } from "@/lib/auth";
import { fetchApi } from "@/lib/api";
import { Search, Filter, RefreshCw } from "lucide-react";

export const Route = createFileRoute("/admin/transactions")({
  component: AdminTransactions,
});

function AdminTransactions() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "Admin")) {
      navigate({ to: "/" });
      return;
    }
    loadLogs();
  }, [user, authLoading]);

  const loadLogs = async () => {
    try {
      setLoading(true);
      let url = "/reports/transactions?limit=200";
      const params: string[] = [];
      if (startDate) params.push(`startDate=${encodeURIComponent(startDate)}`);
      if (endDate) params.push(`endDate=${encodeURIComponent(endDate)}`);
      if (params.length > 0) url += `&${params.join("&")}`;
      const data = await fetchApi(url);
      setLogs(data);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = useMemo(() => {
    return logs.filter((l) => {
      const matchesSearch =
        search === "" ||
        l.action.toLowerCase().includes(search.toLowerCase()) ||
        l.description.toLowerCase().includes(search.toLowerCase()) ||
        (l.orderNumber && l.orderNumber.toLowerCase().includes(search.toLowerCase())) ||
        l.user.toLowerCase().includes(search.toLowerCase());
      const matchesType = typeFilter === "All" || l.action === typeFilter;
      const matchesDate =
        (!startDate || new Date(l.createdAt) >= new Date(startDate)) &&
        (!endDate || new Date(l.createdAt) <= new Date(endDate + "T23:59:59"));
      return matchesSearch && matchesType && matchesDate;
    });
  }, [logs, search, typeFilter, startDate, endDate]);

  const paginatedLogs = useMemo(() => {
    const start = (page - 1) * itemsPerPage;
    return filteredLogs.slice(start, start + itemsPerPage);
  }, [filteredLogs, page]);

  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);

  if (loading)
    return (
      <SiteLayout>
        <div className="py-24 text-center">Loading transactions...</div>
      </SiteLayout>
    );

  return (
    <SiteLayout>
      <div className="py-12 max-w-7xl mx-auto px-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <h1 className="text-3xl font-bold text-navy-deep">Transaction History</h1>
          <button
            onClick={() => {
              loadLogs();
              setPage(1);
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border hover:bg-gray-100"
          >
            <RefreshCw className="h-4 w-4" /> Refresh
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-card mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search actions, descriptions, orders, users..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg"
              />
            </div>
            <div>
              <select
                value={typeFilter}
                onChange={(e) => {
                  setTypeFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="All">All Actions</option>
                <option value="Order Created">Order Created</option>
                <option value="Status Changed">Status Changed</option>
                <option value="Payment Confirmed">Payment Confirmed</option>
                <option value="Delivery Confirmed">Delivery Confirmed</option>
                <option value="Inventory Reduction">Inventory Reduction</option>
                <option value="Order Cancelled">Order Cancelled</option>
              </select>
            </div>
            <div className="flex gap-2">
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setPage(1);
                }}
                className="flex-1 px-3 py-2 border rounded-lg"
              />
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setPage(1);
                }}
                className="flex-1 px-3 py-2 border rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase">Date</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase">Time</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase">Action</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase">Order #</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase">User</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedLogs.map((log) => {
                  return (
                    <tr key={log._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm whitespace-nowrap">{log.date}</td>
                      <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">{log.time}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                            log.action === "Order Created"
                              ? "bg-blue-100 text-blue-700"
                              : log.action === "Status Changed"
                              ? "bg-yellow-100 text-yellow-700"
                              : log.action === "Payment Confirmed"
                              ? "bg-emerald-100 text-emerald-700"
                              : log.action === "Delivery Confirmed"
                              ? "bg-purple-100 text-purple-700"
                              : log.action === "Inventory Reduction"
                              ? "bg-red-100 text-red-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {log.action}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold">
                        {log.orderNumber || "N/A"}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {log.user}
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-600">
                        {log.description}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex justify-center gap-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            <div className="flex items-center px-4 font-bold text-navy-deep">
              Page {page} of {totalPages}
            </div>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </SiteLayout>
  );
}