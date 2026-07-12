import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Search, PlusCircle, ChevronLeft, ChevronRight } from "lucide-react";
import api from "../services/api";
import StatusBadge from "../components/StatusBadge";
import { TableSkeleton, EmptyState } from "../components/States";

export default function Assets() {
  const [assets, setAssets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  useEffect(() => {
    api.get("/org/categories").then((res) => setCategories(res.data)).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = { page, limit: 8 };
    if (search) params.search = search;
    if (status) params.status = status;
    if (category) params.category = category;

    const timeout = setTimeout(() => {
      api
        .get("/assets", { params })
        .then((res) => {
          setAssets(res.data.assets);
          setPages(res.data.pages || 1);
        })
        .finally(() => setLoading(false));
    }, 300);

    return () => clearTimeout(timeout);
  }, [search, status, category, page]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-600" />
          <input
            className="input pl-9"
            placeholder="Search by tag, serial, or QR code..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <Link to="/assets/register" className="btn-primary">
          <PlusCircle size={16} /> Register Asset
        </Link>
      </div>

      <div className="flex gap-3 flex-wrap">
        <select className="input w-auto" value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }}>
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>{c.name}</option>
          ))}
        </select>
        <select className="input w-auto" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
          <option value="">All Statuses</option>
          <option value="Available">Available</option>
          <option value="Allocated">Allocated</option>
          <option value="Under Maintenance">Under Maintenance</option>
          <option value="Retired">Retired</option>
        </select>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-5"><TableSkeleton rows={6} /></div>
        ) : assets.length === 0 ? (
          <EmptyState
            title="No assets found"
            subtitle="Try adjusting your filters, or register a new asset to get started."
            action={<Link to="/assets/register" className="btn-primary">Register Asset</Link>}
          />
        ) : (
          <>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-700 text-left text-ink-400">
                  <th className="px-5 py-3 font-medium">Tag</th>
                  <th className="px-5 py-3 font-medium">Name</th>
                  <th className="px-5 py-3 font-medium">Category</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Location</th>
                </tr>
              </thead>
              <tbody>
                {assets.map((asset) => (
                  <tr
                    key={asset._id}
                    className="border-b border-surface-800 last:border-0 hover:bg-surface-800/60 cursor-pointer transition-colors"
                    onClick={() => (window.location.href = `/assets/${asset._id}`)}
                  >
                    <td className="px-5 py-3 font-mono text-xs text-sage-400">{asset.assetTag}</td>
                    <td className="px-5 py-3 text-ink-50">{asset.name}</td>
                    <td className="px-5 py-3 text-ink-200">{asset.category?.name || "—"}</td>
                    <td className="px-5 py-3"><StatusBadge status={asset.lifecycleStatus} /></td>
                    <td className="px-5 py-3 text-ink-400">{asset.location || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex items-center justify-between px-5 py-3 border-t border-surface-700 text-sm text-ink-400">
              <span>Page {page} of {pages}</span>
              <div className="flex gap-2">
                <button className="btn-secondary px-2.5 py-1.5" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                  <ChevronLeft size={14} />
                </button>
                <button className="btn-secondary px-2.5 py-1.5" disabled={page >= pages} onClick={() => setPage((p) => p + 1)}>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
