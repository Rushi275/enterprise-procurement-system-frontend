import { useEffect, useMemo, useState } from "react";
import { Check, X, Wallet, ListChecks, Building2 } from "lucide-react";
import { listRequests, updateRequestStatus } from "../api/requests";
import { useAuth } from "../context/AuthContext";
import StatusPill from "../components/StatusPill";
import Topbar from "../components/Topbar";
import { SkeletonRows, EmptyState } from "./Home";

const STATUS_COLORS = {
  PENDING: "#E0A526",
  MANAGER_APPROVED: "#3454D1",
  MANAGER_REJECTED: "#E15554",
  APPROVED: "#1E9E6B",
  REJECTED: "#E15554",
  DELIVERED: "#12172B",
};

export default function Dashboard() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const isManager = user?.role === "MANAGER";

  useEffect(() => {
    refresh();
  }, []);

  async function refresh() {
    setLoading(true);
    try {
      const all = await listRequests();
      setRequests(all);
    } catch {
      // ignore — likely backend not running in this preview
    } finally {
      setLoading(false);
    }
  }

  const totalSpend = useMemo(
    () => requests.reduce((sum, r) => sum + (r.totalPrice ?? 0), 0),
    [requests]
  );

  const byStatus = useMemo(() => {
    const counts = {};
    requests.forEach((r) => {
      counts[r.status] = (counts[r.status] ?? 0) + 1;
    });
    return counts;
  }, [requests]);

  const byCategory = useMemo(() => {
    const map = {};
    requests.forEach((r) => {
      const name = r.category?.categoryName ?? "Uncategorized";
      map[name] = (map[name] ?? 0) + (r.totalPrice ?? 0);
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 6);
  }, [requests]);

  const maxCategorySpend = Math.max(1, ...byCategory.map(([, v]) => v));

  const actionable = requests.filter((r) => r.status === "PENDING");

  async function act(id, status) {
    setBusyId(id);
    try {
      await updateRequestStatus(id, status);
      await refresh();
    } finally {
      setBusyId(null);
    }
  }

  const conicGradient = buildConicGradient(byStatus, requests.length);

  return (
    <div>
      <Topbar
        title="Dashboard"
        subtitle="Spend and approval activity across the organization."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="bg-card rounded-card shadow-card border border-ink/5 p-6 flex flex-col justify-between">
          <div className="flex items-center gap-2 text-slate text-xs font-medium mb-4">
            <Wallet size={14} /> Total request value
          </div>
          <div className="font-display text-3xl font-semibold text-ink font-mono-num">
            ₹{totalSpend.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
          </div>
          <p className="text-xs text-slate-light mt-1">Across {requests.length} requests</p>
        </div>

        <div className="bg-card rounded-card shadow-card border border-ink/5 p-6">
          <div className="flex items-center gap-2 text-slate text-xs font-medium mb-4">
            <ListChecks size={14} /> Status breakdown
          </div>
          <div className="flex items-center gap-5">
            <div
              className="h-20 w-20 rounded-full shrink-0"
              style={{ background: conicGradient || "#EEF0F6" }}
            />
            <ul className="space-y-1.5 text-xs">
              {Object.keys(STATUS_COLORS).map((key) =>
                byStatus[key] ? (
                  <li key={key} className="flex items-center gap-2">
                    <span
                      className="h-2 w-2 rounded-full shrink-0"
                      style={{ background: STATUS_COLORS[key] }}
                    />
                    <span className="text-slate">{key.replace("_", " ").toLowerCase()}</span>
                    <span className="font-mono-num text-ink ml-auto pl-3">{byStatus[key]}</span>
                  </li>
                ) : null
              )}
            </ul>
          </div>
        </div>

        <div className="bg-card rounded-card shadow-card border border-ink/5 p-6">
          <div className="flex items-center gap-2 text-slate text-xs font-medium mb-4">
            <Building2 size={14} /> Spend by category
          </div>
          <div className="space-y-2.5">
            {byCategory.length === 0 && (
              <p className="text-xs text-slate-light">No category data yet.</p>
            )}
            {byCategory.map(([name, value]) => (
              <div key={name}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate">{name}</span>
                  <span className="font-mono-num text-ink">
                    ₹{value.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-ink/5 overflow-hidden">
                  <div
                    className="h-full bg-signal rounded-full transition-all"
                    style={{ width: `${(value / maxCategorySpend) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {isManager && (
        <div className="bg-card rounded-card shadow-card border border-ink/5 p-6">
          <h2 className="font-display font-semibold text-ink mb-1">Awaiting your review</h2>
          <p className="text-sm text-slate mb-5">
            Requests raised by your team, pending manager approval.
          </p>

          {loading ? (
            <SkeletonRows />
          ) : actionable.length === 0 ? (
            <EmptyState
              icon={ListChecks}
              title="Nothing pending"
              body="New requests from your team will show up here for approval."
            />
          ) : (
            <div className="divide-y divide-ink/5">
              {actionable.map((r) => (
                <div key={r.requestId} className="flex items-center justify-between py-4">
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-ink">
                      {r.product?.name ?? "Item request"} · Qty {r.numberOfQuantities}
                    </div>
                    <div className="text-xs text-slate-light mt-0.5">
                      Raised by {r.user?.name ?? "—"} · ₹{(r.totalPrice ?? 0).toLocaleString("en-IN")}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      disabled={busyId === r.requestId}
                      onClick={() => act(r.requestId, "MANAGER_REJECTED")}
                      className="h-8 w-8 rounded-lg bg-coral-light text-coral flex items-center justify-center hover:opacity-80 disabled:opacity-40 transition"
                      title="Reject"
                    >
                      <X size={15} />
                    </button>
                    <button
                      disabled={busyId === r.requestId}
                      onClick={() => act(r.requestId, "MANAGER_APPROVED")}
                      className="h-8 w-8 rounded-lg bg-good-light text-good flex items-center justify-center hover:opacity-80 disabled:opacity-40 transition"
                      title="Approve"
                    >
                      <Check size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function buildConicGradient(byStatus, total) {
  if (!total) return null;
  let acc = 0;
  const stops = Object.entries(byStatus).map(([status, count]) => {
    const start = (acc / total) * 360;
    acc += count;
    const end = (acc / total) * 360;
    return `${STATUS_COLORS[status] ?? "#9298A8"} ${start}deg ${end}deg`;
  });
  return `conic-gradient(${stops.join(", ")})`;
}
