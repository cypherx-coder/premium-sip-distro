import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { SiteLayout } from "@/components/site/Layout";
import { useAuth } from "@/lib/auth";
import { fetchApi } from "@/lib/api";

export const Route = createFileRoute("/register")({
  component: Register,
});

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await fetchApi('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password }),
      });
      login(data.token, data.user);
      toast.success("Registered successfully");
      navigate({ to: '/products' });
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SiteLayout>
      <div className="py-24 max-w-md mx-auto px-4">
        <h1 className="font-display text-3xl font-bold text-navy-deep text-center mb-8">Register</h1>
        <form onSubmit={handleSubmit} className="space-y-4 bg-card p-8 rounded-2xl border border-border/50 shadow-card">
          <div>
            <label className="block text-sm font-semibold mb-2">Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-border px-4 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-border px-4 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-border px-4 py-2"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full gradient-emerald text-white py-3 rounded-full font-semibold disabled:opacity-50"
          >
            {loading ? "Registering..." : "Register"}
          </button>
          <p className="text-center text-sm text-muted-foreground mt-4">
            Already have an account? <Link to="/login" className="text-emerald font-semibold">Login</Link>
          </p>
        </form>
      </div>
    </SiteLayout>
  );
}
