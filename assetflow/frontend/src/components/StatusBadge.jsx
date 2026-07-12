const STYLES = {
  Available: "bg-sage-900 text-sage-400",
  Allocated: "bg-surface-700 text-ink-200",
  "Under Maintenance": "bg-maroon-900 text-maroon-400",
  Retired: "bg-surface-800 text-ink-600",
  Active: "bg-sage-900 text-sage-400",
  Pending: "bg-amber-950 text-amber-400",
  Approved: "bg-sage-900 text-sage-400",
  Rejected: "bg-maroon-900 text-maroon-400",
  Returned: "bg-surface-700 text-ink-200",
  "Technician Assigned": "bg-blue-950 text-blue-400",
  "In Progress": "bg-blue-950 text-blue-400",
  Resolved: "bg-sage-900 text-sage-400",
  New: "bg-sage-900 text-sage-400",
  Good: "bg-surface-700 text-ink-200",
  Fair: "bg-amber-950 text-amber-400",
  Damaged: "bg-maroon-900 text-maroon-400",
};

export default function StatusBadge({ status }) {
  const style = STYLES[status] || "bg-surface-700 text-ink-200";
  return <span className={`badge ${style}`}>{status}</span>;
}
