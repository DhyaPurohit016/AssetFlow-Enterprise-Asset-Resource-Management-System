import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { PlusCircle, X } from "lucide-react";
import api from "../services/api";
import { EmptyState } from "../components/States";

const COLUMNS = ["Pending", "Approved", "Technician Assigned", "In Progress", "Resolved"];

const PRIORITY_STYLE = {
  Low: "bg-surface-700 text-ink-200",
  Medium: "bg-amber-950 text-amber-400",
  High: "bg-maroon-900 text-maroon-400",
  Critical: "bg-maroon-900 text-maroon-400",
};

export default function Maintenance() {
  const [columns, setColumns] = useState({});
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm();

  const load = () => {
    setLoading(true);
    Promise.all([api.get("/maintenance"), api.get("/assets", { params: { limit: 100 } })])
      .then(([m, a]) => {
        setColumns(m.data);
        setAssets(a.data.assets);
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const onSubmit = async (values) => {
    try {
      await api.post("/maintenance", values);
      toast.success("Maintenance request raised");
      reset();
      setShowForm(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not raise request");
    }
  };

  const advance = async (request) => {
    const idx = COLUMNS.indexOf(request.status);
    const next = COLUMNS[idx + 1];
    if (!next) return;
    try {
      const payload = { status: next };
      if (next === "Technician Assigned") payload.technicianName = "Unassigned Technician";
      await api.patch(`/maintenance/${request._id}/status`, payload);
      toast.success(`Moved to "${next}"`);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not update status");
    }
  };

  const totalRequests = Object.values(columns).flat().length;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-ink-400">Approving a card moves the asset to Under Maintenance; resolving it returns the asset to Available.</p>
        <button onClick={() => setShowForm((s) => !s)} className="btn-primary shrink-0">
          <PlusCircle size={16} /> Raise Request
        </button>
      </div>

      {showForm && (
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-ink-50 text-sm">New Maintenance Request</h3>
            <button onClick={() => setShowForm(false)}><X size={16} className="text-ink-400" /></button>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Asset</label>
              <select className="input" {...register("assetId", { required: true })}>
                <option value="">Select asset</option>
                {assets.map((a) => (
                  <option key={a._id} value={a._id}>{a.assetTag} — {a.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Priority</label>
              <select className="input" {...register("priority")} defaultValue="Medium">
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="label">Issue Description</label>
              <textarea className="input min-h-20" placeholder="Describe the issue..." {...register("issue", { required: true })} />
            </div>
            <div className="sm:col-span-2">
              <button type="submit" disabled={isSubmitting} className="btn-primary">
                {isSubmitting ? "Submitting..." : "Submit Request"}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-5 gap-3">
          {COLUMNS.map((c) => <div key={c} className="h-64 bg-surface-800 rounded-xl2 animate-pulse" />)}
        </div>
      ) : totalRequests === 0 ? (
        <EmptyState title="No maintenance requests" subtitle="Raised requests will appear here as kanban cards." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-start">
          {COLUMNS.map((col) => (
            <div key={col} className="card p-3 min-h-[16rem]">
              <div className="flex items-center justify-between mb-3 px-1">
                <p className="text-xs font-medium text-ink-400">{col}</p>
                <span className="text-xs text-ink-600">{(columns[col] || []).length}</span>
              </div>
              <div className="space-y-2">
                {(columns[col] || []).map((r) => (
                  <button
                    key={r._id}
                    onClick={() => advance(r)}
                    className="w-full text-left bg-surface-800 hover:bg-surface-700 border border-surface-700 rounded-lg p-3 transition-colors"
                    title={col !== "Resolved" ? "Click to advance to next stage" : "Resolved"}
                  >
                    <p className="font-mono text-xs text-sage-400">{r.asset?.assetTag}</p>
                    <p className="text-sm text-ink-50 mt-0.5 line-clamp-2">{r.issue}</p>
                    <span className={`badge mt-2 ${PRIORITY_STYLE[r.priority]}`}>{r.priority}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
