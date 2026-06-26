import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { SiteLayout } from "@/components/site/Layout";
import { useAuth } from "@/lib/auth";
import { fetchApi } from "@/lib/api";
import { formatNaira } from "@/lib/products";
import { Package, Clock, CheckCircle, Truck, XCircle, User as UserIcon, Lock, Trash2 } from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  component: CustomerDashboard,
});

function CustomerDashboard() {
  const { user, loading: authLoading, updateUser } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("orders");
  const [profileData, setProfileData] = useState<any>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate({ to: '/login' });
      return;
    }
    loadData();
  }, [user, authLoading, navigate]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [profile, ordersData] = await Promise.all([
        fetchApi("/auth/profile"),
        fetchApi("/orders/my"),
      ]);
      setProfileData(profile);
      setOrders(ordersData);
    } catch (err: any) {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <SiteLayout><div className="py-24 text-center">Loading dashboard...</div></SiteLayout>;

  return (
    <SiteLayout>
      <div className="py-12 max-w-5xl mx-auto px-4">
        <div className="mb-10">
          <h1 className="font-display text-3xl font-bold text-navy-deep">Welcome back, {user?.name}</h1>
          <p className="text-muted-foreground mt-2">Manage your orders and profile information.</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-gray-200">
          <button
            onClick={() => setActiveTab("orders")}
            className={`pb-3 px-1 border-b-2 font-semibold transition ${
              activeTab === "orders"
                ? "border-emerald-600 text-emerald-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <Package className="h-4 w-4 inline mr-2" /> Orders
          </button>
          <button
            onClick={() => setActiveTab("profile")}
            className={`pb-3 px-1 border-b-2 font-semibold transition ${
              activeTab === "profile"
                ? "border-emerald-600 text-emerald-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <UserIcon className="h-4 w-4 inline mr-2" /> Profile
          </button>
          <button
            onClick={() => setActiveTab("password")}
            className={`pb-3 px-1 border-b-2 font-semibold transition ${
              activeTab === "password"
                ? "border-emerald-600 text-emerald-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <Lock className="h-4 w-4 inline mr-2" /> Change Password
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-card p-8">
          {activeTab === "orders" && (
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
          )}
          {activeTab === "profile" && (
            <ProfileForm
              data={profileData}
              onSuccess={(updatedUser) => {
                toast.success("Profile updated successfully!");
                updateUser(updatedUser);
                loadData();
              }}
            />
          )}
          {activeTab === "password" && (
            <PasswordForm />
          )}
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

function ProfileForm({ data, onSuccess }: { data: any; onSuccess: (user: any) => void }) {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }
      if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)) {
        toast.error("Only JPEG, JPG, PNG, and WEBP files are allowed");
        return;
      }
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleUpload = async () => {
    if (!preview) return;
    try {
      setUploading(true);
      const input = document.getElementById('customer-profile-image') as HTMLInputElement;
      if (input.files && input.files[0]) {
        const formData = new FormData();
        formData.append('image', input.files[0]);
        const updatedUser = await fetchApi('/auth/profile/image', {
          method: 'POST',
          body: formData,
        });
        onSuccess(updatedUser);
        toast.success("Profile image updated successfully!");
        setPreview(null);
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = async () => {
    try {
      const updatedUser = await fetchApi('/auth/profile/image', {
        method: 'DELETE',
      });
      onSuccess(updatedUser);
      toast.success("Profile image deleted successfully!");
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setLoading(true);
      const formData = new FormData(e.currentTarget);
      const payload = {
        name: formData.get("name"),
        email: formData.get("email"),
        phoneNumber: formData.get("phoneNumber"),
        deliveryAddress: formData.get("deliveryAddress"),
      };
      const updatedUser = await fetchApi("/auth/profile", {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      onSuccess(updatedUser);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex flex-col items-center">
        <div className="relative">
          <div className="h-32 w-32 rounded-full overflow-hidden bg-secondary flex items-center justify-center mb-4">
            {preview ? (
              <img src={preview} alt="Preview" className="h-full w-full object-cover" />
            ) : data.profileImage ? (
              <img src={data.profileImage} alt={data.name} className="h-full w-full object-cover" />
            ) : (
              <UserIcon className="h-12 w-12 text-navy-deep" />
            )}
          </div>
          {preview && (
            <button
              type="button"
              onClick={() => setPreview(null)}
              className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
        <div className="flex gap-2">
          <label className="cursor-pointer px-4 py-2 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition">
            Choose Image
            <input
              id="customer-profile-image"
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              className="hidden"
              onChange={handleFileChange}
            />
          </label>
          {preview && (
            <button
              type="button"
              onClick={handleUpload}
              disabled={uploading}
              className="px-4 py-2 bg-navy-deep text-white rounded-lg font-semibold hover:bg-navy transition disabled:opacity-50"
            >
              {uploading ? "Uploading..." : "Upload"}
            </button>
          )}
          {data.profileImage && !preview && (
            <button
              type="button"
              onClick={handleDeleteImage}
              className="px-4 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition"
            >
              Delete
            </button>
          )}
        </div>
      </div>
      <div>
        <label className="block font-semibold mb-2">Name</label>
        <input
          required
          name="name"
          defaultValue={data.name}
          className="w-full border rounded-lg px-4 py-2"
        />
      </div>
      <div>
        <label className="block font-semibold mb-2">Email</label>
        <input
          required
          type="email"
          name="email"
          defaultValue={data.email}
          className="w-full border rounded-lg px-4 py-2"
        />
      </div>
      <div>
        <label className="block font-semibold mb-2">Phone Number</label>
        <input
          name="phoneNumber"
          defaultValue={data.phoneNumber || ""}
          className="w-full border rounded-lg px-4 py-2"
        />
      </div>
      <div>
        <label className="block font-semibold mb-2">Delivery Address</label>
        <textarea
          name="deliveryAddress"
          rows={3}
          defaultValue={data.deliveryAddress || ""}
          className="w-full border rounded-lg px-4 py-2"
        />
      </div>
      <div className="pt-4">
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-emerald-600 text-white py-3 rounded-lg font-semibold hover:bg-emerald-700 disabled:opacity-50"
        >
          {loading ? "Updating..." : "Save Changes"}
        </button>
      </div>
    </form>
  );
}

function PasswordForm() {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    if (formData.get("newPassword") !== formData.get("confirmPassword")) {
      toast.error("New passwords do not match!");
      return;
    }
    try {
      setLoading(true);
      const payload = {
        currentPassword: formData.get("currentPassword"),
        newPassword: formData.get("newPassword"),
      };
      await fetchApi("/auth/profile/password", {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      toast.success("Password updated successfully!");
      e.currentTarget.reset();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block font-semibold mb-2">Current Password</label>
        <input
          required
          type="password"
          name="currentPassword"
          className="w-full border rounded-lg px-4 py-2"
        />
      </div>
      <div>
        <label className="block font-semibold mb-2">New Password</label>
        <input
          required
          type="password"
          name="newPassword"
          className="w-full border rounded-lg px-4 py-2"
        />
      </div>
      <div>
        <label className="block font-semibold mb-2">Confirm New Password</label>
        <input
          required
          type="password"
          name="confirmPassword"
          className="w-full border rounded-lg px-4 py-2"
        />
      </div>
      <div className="pt-4">
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-emerald-600 text-white py-3 rounded-lg font-semibold hover:bg-emerald-700 disabled:opacity-50"
        >
          {loading ? "Updating..." : "Change Password"}
        </button>
      </div>
    </form>
  );
}
