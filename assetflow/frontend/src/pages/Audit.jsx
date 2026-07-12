import React, { useState, useEffect } from "react";
import { reportsAPI } from "../services/apiServices";
import { format } from "date-fns";

export default function Audit() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [actions, setActions] = useState([]);

  useEffect(() => {
    fetchAuditTrail();
  }, [filter, actionFilter, page]);

  useEffect(() => {
    const uniqueActions = new Set(logs.map((log) => log.action));
    setActions(Array.from(uniqueActions).sort());
  }, [logs]);

  const fetchAuditTrail = async () => {
    try {
      setLoading(true);
      const params = { page, limit: 20 };
      if (actionFilter) params.action = actionFilter;
      if (filter) params.actor = filter;

      const response = await reportsAPI.getAuditTrail(params);
      setLogs(response.data.logs);
      setTotalPages(response.data.pagination.pages);
    } catch (error) {
      console.error("Error fetching audit trail:", error);
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (action) => {
    const icons = {
      "asset.created": "📦",
      "asset.updated": "✏️",
      "asset.deleted": "🗑️",
      "allocation.created": "📋",
      "allocation.updated": "📋",
      "allocation.completed": "✓",
      "maintenance.created": "🔧",
      "maintenance.updated": "🔧",
      "maintenance.resolved": "✓",
      "user.signup": "👤",
      "user.login": "🔓",
      "booking.created": "📅",
      "booking.updated": "📅",
      "booking.deleted": "🗑️",
    };
    return icons[action] || "📌";
  };

  const getActionColor = (action) => {
    if (action.includes("created")) return "text-green-400";
    if (action.includes("updated")) return "text-blue-400";
    if (action.includes("deleted")) return "text-red-400";
    if (action.includes("completed") || action.includes("resolved"))
      return "text-emerald-400";
    return "text-surface-300";
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Audit Trail</h1>

      <div className="flex flex-col sm:flex-row gap-4">
        <input
          type="text"
          placeholder="Filter by user name..."
          value={filter}
          onChange={(e) => {
            setFilter(e.target.value);
            setPage(1);
          }}
          className="input input-bordered input-sm flex-1"
        />
        <select
          value={actionFilter}
          onChange={(e) => {
            setActionFilter(e.target.value);
            setPage(1);
          }}
          className="select select-bordered select-sm"
        >
          <option value="">All Actions</option>
          {actions.map((action) => (
            <option key={action} value={action}>
              {action}
            </option>
          ))}
        </select>
        <button onClick={fetchAuditTrail} className="btn btn-sm btn-primary">
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      ) : logs.length === 0 ? (
        <div className="card p-8 text-center bg-surface-900 border border-surface-700">
          <p className="text-surface-400">No audit logs found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {logs.map((log) => (
            <div
              key={log._id}
              className="card p-4 bg-surface-900 border border-surface-700 hover:border-primary/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                  <span className="text-2xl mt-1">{getActionIcon(log.action)}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`font-mono text-sm ${getActionColor(log.action)}`}>
                        {log.action}
                      </span>
                      {log.category && (
                        <span className="badge badge-sm badge-outline">
                          {log.category}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-surface-200">{log.message}</p>
                    <div className="flex flex-wrap gap-2 mt-2 text-xs text-surface-400">
                      {log.actor && (
                        <span>
                          <strong>User:</strong> {log.actor?.name || "Unknown"}
                        </span>
                      )}
                      {log.entityType && (
                        <span>
                          <strong>Type:</strong> {log.entityType}
                        </span>
                      )}
                      <span>
                        {format(
                          new Date(log.createdAt),
                          "MMM dd, yyyy hh:mm:ss a"
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Pagination */}
          <div className="flex justify-center items-center gap-2 mt-6">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="btn btn-sm btn-outline"
            >
              ← Previous
            </button>
            <span className="text-sm text-surface-400">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="btn btn-sm btn-outline"
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
