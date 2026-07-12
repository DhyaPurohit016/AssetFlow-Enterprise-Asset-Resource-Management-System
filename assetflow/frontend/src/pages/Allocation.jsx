import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import api from "../services/api";
import StatusBadge from "../components/StatusBadge";
import { TableSkeleton, EmptyState } from "../components/States";
import { useAuthStore } from "../store/authStore";

export default function Allocation() {
  const { register, handleSubmit, watch, reset, formState: { isSubmitting } } = useForm();
  const [assets, setAssets] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = useAuthStore((s) => s.user);

  const selectedAssetId = watch("assetId");
  const selectedAsset = assets.find((a) => a._id === selectedAssetId);

  const loadAll = () => {
    setLoading(true);
    Promise.all([
      api.get("/assets", { params: { limit: 100 } }),
      api.get("/org/employees"),
      api.get("/allocations"),
    ])
      .then(([a, e, allo]) => {
        setAssets(a.data.assets);
        setEmployees(e.data);
        setAllocations(allo.data);
      })
      .finally(() => setLoading(false));
  };

  useEffect(loadAll, []);

  const isConflict = selectedAsset?.lifecycleStatus === "Allocated";

  const onSubmit = async (values) => {
    try {
      if (isConflict) {
        await api.post("/allocations/transfer", {
          assetId: values.assetId,
          transferTo: values.employeeId,
          transferReason: values.reason,
        });
        toast.success("Transfer request submitted for approval");
      } else {
        await api.post("/allocations", {
          assetId: values.assetId,
          allocatedTo: values.employeeId,
          department: values.department || undefined,
        });
        toast.success("Asset allocated");
      }
      reset();
      loadAll();
    } catch (err) {
      toast.error(err.response?.data?.message || "Action failed");
    }
  };

  const decide = async (id, decision) => {
    try {
      await api.patch(`/allocations/${id}/decision`, { decision });
      toast.success(`Transfer ${decision.toLowerCase()}`);
      loadAll();
    } catch (err) {
      toast.error(err.response?.data?.message || "Action failed");
    }
  };

  const returnAsset = async (id) => {
    try {
      await api.post(`/allocations/${id}/return`, { conditionAtReturn: "Good" });
      toast.success("Asset marked returned");
      loadAll();
    } catch (err) {
      toast.error(err.response?.data?.message || "Action failed");
    }
  };

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <div className="card p-6 lg:col-span-1 h-fit">
        <h3 className="font-display font-semibold text-ink-50 mb-4 text-sm">Allocate / Transfer Asset</h3>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="label">Asset</label>
            <select className="input" {...register("assetId", { required: true })}>
              <option value="">Select an asset</option>
              {assets.map((a) => (
                <option key={a._id} value={a._id}>{a.assetTag} — {a.name}</option>
              ))}
            </select>
          </div>

          {isConflict && (
            <div className="bg-maroon-900 text-maroon-400 text-xs rounded-lg px-3 py-2.5 leading-relaxed">
              Already allocated to {selectedAsset?.currentHolder?.name || "someone"} ({selectedAsset?.department?.name || "Engineering"}).
              Submitting will raise a transfer request instead of a direct allocation.
            </div>
          )}

          <div>
            <label className="label">{isConflict ? "Transfer to" : "Allocate to"}</label>
            <select className="input" {...register("employeeId", { required: true })}>
              <option value="">Select employee...</option>
              {employees.map((e) => (
                <option key={e._id} value={e._id}>{e.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Reason / Notes</label>
            <textarea className="input min-h-20" placeholder="Optional context for this request" {...register("reason")} />
          </div>

          <button type="submit" disabled={isSubmitting || !selectedAssetId} className="btn-primary w-full">
            {isSubmitting ? "Submitting..." : isConflict ? "Submit Transfer Request" : "Allocate Asset"}
          </button>
        </form>

        {selectedAsset && (
          <div className="mt-6 pt-5 border-t border-surface-700">
            <p className="text-xs text-ink-400 mb-2">Allocation history — {selectedAsset.assetTag}</p>
            <ul className="space-y-2 text-xs text-ink-200">
              {allocations
                .filter((a) => a.asset?._id === selectedAsset._id)
                .slice(0, 4)
                .map((a) => (
                  <li key={a._id} className="border-l-2 border-surface-700 pl-2">
                    {a.type === "Transfer"
                      ? `Transfer ${a.status.toLowerCase()}: ${a.transferFrom?.name || "—"} → ${a.transferTo?.name || "—"}`
                      : `${a.status}: ${a.allocatedTo?.name || "—"}`}
                  </li>
                ))}
              {allocations.filter((a) => a.asset?._id === selectedAsset._id).length === 0 && (
                <li className="text-ink-600">No prior history.</li>
              )}
            </ul>
          </div>
        )}
      </div>

      <div className="lg:col-span-2 card overflow-hidden">
        <div className="px-5 py-4 border-b border-surface-700">
          <h3 className="font-display font-semibold text-ink-50 text-sm">All Allocations & Transfers</h3>
        </div>
        {loading ? (
          <div className="p-5"><TableSkeleton rows={5} /></div>
        ) : allocations.length === 0 ? (
          <EmptyState title="No allocations yet" subtitle="Allocate an asset to an employee to see it tracked here." />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-700 text-left text-ink-400">
                <th className="px-5 py-3 font-medium">Asset</th>
                <th className="px-5 py-3 font-medium">Type</th>
                <th className="px-5 py-3 font-medium">To</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {allocations.map((a) => (
                <tr key={a._id} className="border-b border-surface-800 last:border-0">
                  <td className="px-5 py-3 font-mono text-xs text-sage-400">{a.asset?.assetTag}</td>
                  <td className="px-5 py-3 text-ink-200">{a.type}</td>
                  <td className="px-5 py-3 text-ink-50">{(a.type === "Transfer" ? a.transferTo?.name : a.allocatedTo?.name) || "—"}</td>
                  <td className="px-5 py-3">
                    <StatusBadge status={a.status} />
                    {a.isOverdue && <span className="badge bg-maroon-900 text-maroon-400 ml-2">Overdue</span>}
                  </td>
                  <td className="px-5 py-3 text-right space-x-2">
                    {a.type === "Transfer" && a.status === "Pending" && (
                      <>
                        <button onClick={() => decide(a._id, "Approved")} className="text-xs text-sage-400 hover:underline">Approve</button>
                        <button onClick={() => decide(a._id, "Rejected")} className="text-xs text-maroon-400 hover:underline">Reject</button>
                      </>
                    )}
                    {a.type === "Allocation" && a.status === "Active" && (
                      <button onClick={() => returnAsset(a._id)} className="text-xs text-ink-400 hover:text-ink-50 hover:underline">
                        Mark Returned
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
