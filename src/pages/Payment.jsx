import { useEffect, useMemo, useState } from "react";
import { CreditCard, ShieldCheck, CheckCircle2, Landmark } from "lucide-react";
import { listRequests } from "../api/requests";
import { useAuth } from "../context/AuthContext";
import Topbar from "../components/Topbar";
import { EmptyState, SkeletonRows } from "./Home";

// NOTE: the backend has no payment endpoint yet — approved requests are settled
// by finance offline via the bank details emailed to suppliers. This page is a
// UI-only mock so the flow feels complete; "Pay now" just marks it paid locally.
export default function Payment() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paid, setPaid] = useState(() => new Set());
  const [payingId, setPayingId] = useState(null);
  const [card, setCard] = useState({ number: "", name: "", expiry: "", cvv: "" });

  useEffect(() => {
    async function load() {
      try {
        const all = await listRequests();
        const mine = user?.userId
          ? all.filter((r) => r.user?.userId === user.userId)
          : all;
        setRequests(mine.filter((r) => r.status === "APPROVED" || r.status === "DELIVERED"));
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user?.userId]);

  const dueRequests = useMemo(
    () => requests.filter((r) => r.status === "APPROVED" && !paid.has(r.requestId)),
    [requests, paid]
  );

  function handlePay(id) {
    setPaid((prev) => new Set(prev).add(id));
    setPayingId(null);
    setCard({ number: "", name: "", expiry: "", cvv: "" });
  }

  return (
    <div>
      <Topbar
        title="Payment"
        subtitle="Settle approved orders once they've cleared admin review."
      />

      <div className="bg-signal-light text-signal text-xs rounded-lg px-4 py-3 mb-6 flex items-center gap-2">
        <ShieldCheck size={15} className="shrink-0" />
        Demo checkout — no real charge is made. Card details aren't sent anywhere.
      </div>

      {loading ? (
        <SkeletonRows />
      ) : dueRequests.length === 0 ? (
        <div className="bg-card rounded-card shadow-card border border-ink/5 p-6">
          <EmptyState
            icon={Landmark}
            title="Nothing due right now"
            body="Approved orders awaiting payment will show up here."
          />
        </div>
      ) : (
        <div className="space-y-3">
          {dueRequests.map((r) => (
            <div key={r.requestId} className="bg-card rounded-card shadow-card border border-ink/5 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-ink">{r.product?.name}</div>
                  <div className="text-xs text-slate-light mt-0.5 font-mono-num">
                    #{String(r.requestId).padStart(4, "0")} · Qty {r.numberOfQuantities}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono-num text-base font-semibold text-ink">
                    ₹{(r.totalPrice ?? 0).toLocaleString("en-IN")}
                  </div>
                  <button
                    onClick={() => setPayingId(payingId === r.requestId ? null : r.requestId)}
                    className="text-xs font-medium text-signal hover:underline mt-1"
                  >
                    {payingId === r.requestId ? "Cancel" : "Pay now"}
                  </button>
                </div>
              </div>

              {payingId === r.requestId && (
                <div className="mt-5 pt-5 border-t border-ink/5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-slate mb-1.5">Card number</label>
                    <div className="relative">
                      <CreditCard size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-light" />
                      <input
                        value={card.number}
                        onChange={(e) => setCard({ ...card, number: e.target.value })}
                        placeholder="4242 4242 4242 4242"
                        maxLength={19}
                        className="w-full rounded-lg border border-ink/10 bg-white pl-9 pr-3.5 py-2.5 text-sm text-ink placeholder:text-slate-light focus:border-signal focus:ring-1 focus:ring-signal outline-none transition font-mono-num"
                      />
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-slate mb-1.5">Name on card</label>
                    <input
                      value={card.name}
                      onChange={(e) => setCard({ ...card, name: e.target.value })}
                      placeholder={user?.name ?? "Full name"}
                      className="w-full rounded-lg border border-ink/10 bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-slate-light focus:border-signal focus:ring-1 focus:ring-signal outline-none transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate mb-1.5">Expiry</label>
                    <input
                      value={card.expiry}
                      onChange={(e) => setCard({ ...card, expiry: e.target.value })}
                      placeholder="MM/YY"
                      maxLength={5}
                      className="w-full rounded-lg border border-ink/10 bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-slate-light focus:border-signal focus:ring-1 focus:ring-signal outline-none transition font-mono-num"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate mb-1.5">CVV</label>
                    <input
                      value={card.cvv}
                      onChange={(e) => setCard({ ...card, cvv: e.target.value })}
                      placeholder="123"
                      maxLength={3}
                      className="w-full rounded-lg border border-ink/10 bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-slate-light focus:border-signal focus:ring-1 focus:ring-signal outline-none transition font-mono-num"
                    />
                  </div>
                  <button
                    onClick={() => handlePay(r.requestId)}
                    className="sm:col-span-2 bg-signal hover:bg-signal-dark text-white text-sm font-medium rounded-lg py-2.5 transition-colors mt-1"
                  >
                    Confirm payment · ₹{(r.totalPrice ?? 0).toLocaleString("en-IN")}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {paid.size > 0 && (
        <div className="mt-6">
          <h2 className="text-xs font-medium text-slate-light mb-3">Paid this session</h2>
          <div className="space-y-2">
            {requests
              .filter((r) => paid.has(r.requestId))
              .map((r) => (
                <div
                  key={r.requestId}
                  className="flex items-center gap-3 bg-good-light text-good rounded-lg px-4 py-2.5 text-sm"
                >
                  <CheckCircle2 size={15} />
                  {r.product?.name} · ₹{(r.totalPrice ?? 0).toLocaleString("en-IN")}
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
