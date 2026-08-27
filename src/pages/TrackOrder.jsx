import { useEffect, useState } from "react";
import { Download, ChevronDown, Truck } from "lucide-react";
import { listRequests, downloadMyRequestsCsv } from "../api/requests";
import { useAuth } from "../context/AuthContext";
import StatusPill from "../components/StatusPill";
import ApprovalTrail from "../components/ApprovalTrail";
import Topbar from "../components/Topbar";
import { EmptyState, SkeletonRows } from "./Home";

export default function TrackOrder() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const all = await listRequests();
        const mine = user?.userId
          ? all.filter((r) => r.user?.userId === user.userId)
          : all;
        setRequests(mine.sort((a, b) => b.requestId - a.requestId));
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user?.userId]);

  async function handleDownload() {
    setDownloading(true);
    try {
      const blob = await downloadMyRequestsCsv();
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "my-requests.csv");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      // ignore — backend may not be reachable in preview
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div>
      <Topbar
        title="Track orders"
        subtitle="Follow each request from raise to delivery."
        action={
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="flex items-center gap-2 border border-ink/10 text-ink text-sm font-medium rounded-lg px-4 py-2.5 hover:bg-ink/5 transition disabled:opacity-60"
          >
            <Download size={15} />
            {downloading ? "Preparing…" : "Export CSV"}
          </button>
        }
      />

      {loading ? (
        <SkeletonRows />
      ) : requests.length === 0 ? (
        <div className="bg-card rounded-card shadow-card border border-ink/5 p-6">
          <EmptyState icon={Truck} title="No orders to track" body="Requests you raise will appear here." />
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((r) => {
            const isOpen = expanded === r.requestId;
            return (
              <div
                key={r.requestId}
                className="bg-card rounded-card shadow-card border border-ink/5 overflow-hidden"
              >
                <button
                  onClick={() => setExpanded(isOpen ? null : r.requestId)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-ink">
                      {r.product?.name ?? "Item request"}
                    </div>
                    <div className="text-xs text-slate-light mt-0.5 font-mono-num">
                      #{String(r.requestId).padStart(4, "0")} · Qty {r.numberOfQuantities} · ₹
                      {(r.totalPrice ?? 0).toLocaleString("en-IN")}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <StatusPill status={r.status} />
                    <ChevronDown
                      size={16}
                      className={`text-slate-light transition-transform ${isOpen ? "rotate-180" : ""}`}
                    />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 pb-6 pt-2 border-t border-ink/5">
                    <ApprovalTrail status={r.status} updatedDate={r.updatedDate} />
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 text-xs">
                      <Detail label="Department" value={r.department?.departmentName ?? "—"} />
                      <Detail label="Category" value={r.category?.categoryName ?? "—"} />
                      <Detail
                        label="Raised on"
                        value={r.createdDate ? new Date(r.createdDate).toLocaleDateString() : "—"}
                      />
                      <Detail
                        label="Last updated"
                        value={r.updatedDate ? new Date(r.updatedDate).toLocaleDateString() : "—"}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Detail({ label, value }) {
  return (
    <div>
      <div className="text-slate-light mb-1">{label}</div>
      <div className="text-ink font-medium">{value}</div>
    </div>
  );
}
