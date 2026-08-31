import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Boxes } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
    loginType: "EMPLOYEE",
  });

  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    try {
      await login(form.email, form.password, form.loginType);
      navigate("/home");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data ||
          err.message ||
          "Couldn't sign you in. Check your details and try again."
      );
    }
  }

  return (
    <div className="min-h-screen w-full flex bg-paper">
      <div className="hidden lg:flex lg:w-[42%] bg-ink text-white flex-col justify-between px-12 py-12 relative overflow-hidden">
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-signal/20 blur-3xl" />
        <div className="absolute -left-16 bottom-0 h-56 w-56 rounded-full bg-signal/10 blur-3xl" />

        <div className="relative">
          <div className="flex items-center gap-2 font-display font-semibold text-xl">
            <Boxes className="text-signal" size={22} />
            Procure<span className="text-signal">.</span>
          </div>
        </div>

        <div className="relative">
          <h2 className="font-display text-3xl leading-tight font-semibold max-w-sm">
            Every request, tracked from raise to delivery.
          </h2>

          <p className="text-white/50 mt-4 max-w-sm text-sm leading-relaxed">
            One place to raise purchase requests, follow them through manager
            and admin approval, and see exactly where your order stands.
          </p>
        </div>

        <div className="relative text-xs text-white/30 font-mono-num">
          Enterprise Procurement System
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-2 font-display font-semibold text-xl mb-10 text-ink">
            <Boxes className="text-signal" size={22} />
            Procure.
          </div>

          <h1 className="font-display text-2xl font-semibold text-ink">
            Welcome back
          </h1>

          <p className="text-sm text-slate mt-1.5 mb-8">
            Sign in with your work email to continue.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate mb-1.5">
                Login as
              </label>

              <select
                value={form.loginType}
                onChange={(e) =>
                  setForm({ ...form, loginType: e.target.value })
                }
                className="w-full rounded-lg border border-ink/10 bg-white px-3.5 py-2.5 text-sm text-ink focus:border-signal focus:ring-1 focus:ring-signal outline-none transition"
              >
                <option value="EMPLOYEE">Employee</option>
                <option value="MANAGER">Manager</option>
                <option value="ADMIN">Admin</option>
                <option value="SUPPLIER">Supplier</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate mb-1.5">
                Work email
              </label>

              <input
                type="email"
                required
                value={form.email}
                onChange={(e) =>
                  setForm({ ...form, email: e.target.value })
                }
                className="w-full rounded-lg border border-ink/10 bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-slate-light focus:border-signal focus:ring-1 focus:ring-signal outline-none transition"
                placeholder="you@company.com"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate mb-1.5">
                Password
              </label>

              <input
                type="password"
                required
                value={form.password}
                onChange={(e) =>
                  setForm({ ...form, password: e.target.value })
                }
                className="w-full rounded-lg border border-ink/10 bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-slate-light focus:border-signal focus:ring-1 focus:ring-signal outline-none transition"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="text-sm text-coral bg-coral-light rounded-lg px-3.5 py-2.5">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-signal hover:bg-signal-dark text-white text-sm font-medium rounded-lg py-2.5 transition-colors disabled:opacity-60"
            >
              {loading ? "Signing in…" : "Sign in"}
              {!loading && <ArrowRight size={15} />}
            </button>
          </form>

          <p className="text-sm text-slate text-center mt-8">
            New here?{" "}
            <Link
              to="/register"
              className="text-signal font-medium hover:underline"
            >
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}