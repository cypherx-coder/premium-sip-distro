import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { SiteLayout } from "@/components/site/Layout";
import { useAuth } from "@/lib/auth";
import { fetchApi } from "@/lib/api";
import { User, Building2, Lock } from "lucide-react";

export const Route = createFileRoute("/admin/profile")({
  component: AdminProfile,
});

function AdminProfile() {
  const { user, loading: authLoading, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<any>(null);
  const [businessData, setBusinessData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("profile");

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
      const [profile, business] = await Promise.all([
        fetchApi("/auth/profile"),
        fetchApi("/auth/business"),
      ]);
      setProfileData(profile);
      setBusinessData(business);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <SiteLayout>
        <div className="py-24 text-center">Loading profile...</div>
      </SiteLayout>
    );

  return (
    <SiteLayout>
      <div className="py-12 max-w-3xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-navy-deep mb-8">Admin Profile</h1>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-gray-200">
          <button
            onClick={() => setActiveTab("profile")}
            className={`pb-3 px-1 border-b-2 font-semibold transition ${
              activeTab === "profile"
                ? "border-emerald-600 text-emerald-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <User className="h-4 w-4 inline mr-2" /> Profile
          </button>
          <button
            onClick={() => setActiveTab("business")}
            className={`pb-3 px-1 border-b-2 font-semibold transition ${
              activeTab === "business"
                ? "border-emerald-600 text-emerald-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <Building2 className="h-4 w-4 inline mr-2" /> Business Info
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
          {activeTab === "profile" && (
            <ProfileForm
              data={profileData}
              onSuccess={() => {
                toast.success("Profile updated successfully!");
                loadData();
              }}
            />
          )}
          {activeTab === "business" && (
            <BusinessForm
              data={businessData}
              onSuccess={() => {
                toast.success("Business info updated successfully!");
                loadData();
              }}
            />
          )}
          {activeTab === "password" && (
            <PasswordForm />
          )}
        </div>

        <button
          onClick={logout}
          className="mt-6 w-full py-3 border border-red-200 text-red-600 rounded-xl font-semibold hover:bg-red-50"
        >
          Log Out
        </button>
      </div>
    </SiteLayout>
  );
}

function ProfileForm({ data, onSuccess }: { data: any; onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setLoading(true);
      const formData = new FormData(e.currentTarget);
      const payload = {
        name: formData.get("name"),
        email: formData.get("email"),
      };
      await fetchApi("/auth/profile", {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      onSuccess();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block font-semibold mb-1">Name</label>
        <input
          required
          name="name"
          defaultValue={data.name}
          className="w-full border rounded-lg px-3 py-2"
        />
      </div>
      <div>
        <label className="block font-semibold mb-1">Email</label>
        <input
          required
          type="email"
          name="email"
          defaultValue={data.email}
          className="w-full border rounded-lg px-3 py-2"
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

function BusinessForm({ data, onSuccess }: { data: any; onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setLoading(true);
      const formData = new FormData(e.currentTarget);
      const payload = {
        name: formData.get("name"),
        phone: formData.get("phone"),
        address: formData.get("address"),
      };
      await fetchApi("/auth/business", {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      onSuccess();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block font-semibold mb-1">Business Name</label>
        <input
          name="name"
          defaultValue={data.name}
          className="w-full border rounded-lg px-3 py-2"
        />
      </div>
      <div>
        <label className="block font-semibold mb-1">Business Phone</label>
        <input
          name="phone"
          defaultValue={data.phone}
          className="w-full border rounded-lg px-3 py-2"
        />
      </div>
      <div>
        <label className="block font-semibold mb-1">Business Address</label>
        <textarea
          name="address"
          rows={3}
          defaultValue={data.address}
          className="w-full border rounded-lg px-3 py-2"
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
        <label className="block font-semibold mb-1">Current Password</label>
        <input
          required
          type="password"
          name="currentPassword"
          className="w-full border rounded-lg px-3 py-2"
        />
      </div>
      <div>
        <label className="block font-semibold mb-1">New Password</label>
        <input
          required
          type="password"
          name="newPassword"
          className="w-full border rounded-lg px-3 py-2"
        />
      </div>
      <div>
        <label className="block font-semibold mb-1">Confirm New Password</label>
        <input
          required
          type="password"
          name="confirmPassword"
          className="w-full border rounded-lg px-3 py-2"
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
