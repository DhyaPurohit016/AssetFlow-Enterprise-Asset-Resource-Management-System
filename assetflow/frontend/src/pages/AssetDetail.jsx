import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import api from "../services/api";
import StatusBadge from "../components/StatusBadge";
import { FullPageLoader } from "../components/States";

export default function AssetDetail() {
  const { id } = useParams();
  const [asset, setAsset] = useState(null);
  const [allocationHistory, setAllocationHistory] = useState([]);
  const [maintenanceHistory, setMaintenanceHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get(`/assets/${id}`),
      api.get(`/allocations/asset/${id}`),
      api.get(`/maintenance/asset/${id}`),
    ])
      .then(([a, alloc, maint]) => {
        setAsset(a.data);
        setAllocationHistory(alloc.data);
        setMaintenanceHistory(maint.data);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <FullPageLoader />;
  if (!asset) return <p className="text-ink-400">Asset not found.</p>;

  // Merge allocation + maintenance events into one chronological timeline
  const timeline = [
    ...allocationHistory.map((a) => ({
      date: a.createdAt,
      label:
        a.type === "Transfer"
          ? `Transfer ${a.status.toLowerCase()}: ${a.transferFrom?.name || "—"} → ${a.transferTo?.name || "—"}`
          : a.status === "Returned"
          ? `Returned by ${a.allocatedTo?.name || "—"}`
          : `Allocated to ${a.allocatedTo?.name || "—"}`,
    })),
    ...maintenanceHistory.map((m) => ({
      date: m.createdAt,
      label: `Maintenance ${m.status.toLowerCase()}: ${m.issue}`,
    })),
  ].sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div className="space-y-6">
      <Link to="/assets" className="text-sm text-ink-400 hover:text-ink-50">← Back to Assets</Link>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card p-6 space-y-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-mono text-xs text-sage-400 mb-1">{asset.assetTag}</p>
              <h2 className="font-display font-semibold text-xl text-ink-50">{asset.name}</h2>
            </div>
            <StatusBadge status={asset.lifecycleStatus} />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
            <Field label="Category" value={asset.category?.name} />
            <Field label="Serial Number" value={asset.serialNumber} />
            <Field label="Condition" value={<StatusBadge status={asset.condition} />} />
            <Field label="Location" value={asset.location} />
            <Field label="Department" value={asset.department?.name} />
            <Field label="Current Holder" value={asset.currentHolder?.name} />
            <Field label="Purchase Date" value={asset.purchaseDate && new Date(asset.purchaseDate).toLocaleDateString()} />
            <Field label="Warranty Expiry" value={asset.warrantyExpiry && new Date(asset.warrantyExpiry).toLocaleDateString()} />
          </div>

          {asset.notes && (
            <div>
              <p className="label">Notes</p>
              <p className="text-sm text-ink-200">{asset.notes}</p>
            </div>
          )}
        </div>

        <div className="card p-6 flex flex-col items-center text-center">
          <p className="label self-start">Asset QR Code</p>
          <div className="bg-white p-3 rounded-lg mt-2">
            <QRCodeSVG value={asset.qrCodeUrl || asset.assetTag} size={140} />
          </div>
          <p className="text-xs text-ink-600 mt-3">Scan to open this asset's profile directly.</p>
        </div>
      </div>

      <div className="card p-6">
        <h3 className="font-display font-semibold text-ink-50 mb-4 text-sm">Asset Timeline</h3>
        {timeline.length === 0 ? (
          <p className="text-sm text-ink-600">No history yet for this asset.</p>
        ) : (
          <ul className="space-y-4">
            {timeline.map((t, i) => (
              <li key={i} className="flex gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-sage-400 mt-2 shrink-0" />
                <div>
                  <p className="text-sm text-ink-50">{t.label}</p>
                  <p className="text-xs text-ink-600">{new Date(t.date).toLocaleString()}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function Field({ label, value }) {
  return (
    <div>
      <p className="text-xs text-ink-400 mb-1">{label}</p>
      <div className="text-ink-50">{value || "—"}</div>
    </div>
  );
}
