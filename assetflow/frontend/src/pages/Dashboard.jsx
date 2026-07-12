import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";
import {
  Boxes, UserCheck, ArrowLeftRight, Clock, Wrench, PlusCircle, CalendarPlus,
} from "lucide-react";
import api from "../services/api";
import KPICard from "../components/KPICard";
import { CardSkeleton, EmptyState } from "../components/States";

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/dashboard")
      .then((res) => setData(res.data))
      .finally(() => setLoading(false));
  }, []);

  const kpis = data?.kpis || {};
  const categoryData = data?.chart?.byCategory || [];
  const totalCategoryAssets = categoryData.reduce((sum, item) => sum + (item.count || 0), 0);
  const topCategory = categoryData.length
    ? [...categoryData].sort((a, b) => b.count - a.count)[0].name
    : "—";
  const averageAssets = categoryData.length
    ? Math.round(totalCategoryAssets / categoryData.length)
    : 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-sm text-ink-400">Today's Overview</h2>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)
        ) : (
          <>
            <KPICard label="Assets Available" value={kpis.available} icon={Boxes} accent="sage" index={0} />
            <KPICard label="Assets Allocated" value={kpis.allocated} icon={UserCheck} accent="ink" index={1} />
            <KPICard label="Under Maintenance" value={kpis.underMaintenance} icon={Wrench} accent="maroon" index={2} />
            <KPICard label="Active Bookings" value={kpis.activeBookings} icon={Clock} accent="sage" index={3} />
            <KPICard label="Pending Transfers" value={kpis.pendingTransfers} icon={ArrowLeftRight} accent="ink" index={4} />
            <KPICard label="Upcoming Returns (7d)" value={kpis.upcomingReturns} icon={Clock} accent="ink" index={5} />
          </>
        )}
      </div>

      {/* Alerts */}
      {!loading && data?.alerts?.length > 0 && (
        <div className="space-y-2">
          {data.alerts.map((alert) => (
            <div key={alert.id} className="bg-maroon-900 text-maroon-400 text-sm rounded-lg px-4 py-2.5">
              {alert.message}
            </div>
          ))}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="lg:col-span-2 card p-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div>
              <h3 className="font-display font-semibold text-ink-50">Assets by Category</h3>
              <p className="text-sm text-ink-400 max-w-2xl">
                Category trends show how inventory is distributed across your asset portfolio. Use this line view to identify growth, gaps, and the categories with the highest deployment.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3 w-full sm:w-auto">
              <div className="rounded-3xl border border-surface-700 bg-surface-900 p-3 text-sm text-ink-300">
                <p className="text-ink-50 font-semibold">Total assets</p>
                <p className="mt-1 text-2xl text-sage-300">{loading ? "—" : totalCategoryAssets}</p>
              </div>
              <div className="rounded-3xl border border-surface-700 bg-surface-900 p-3 text-sm text-ink-300">
                <p className="text-ink-50 font-semibold">Top category</p>
                <p className="mt-1 text-2xl text-sage-300">{loading ? "—" : topCategory}</p>
              </div>
              <div className="rounded-3xl border border-surface-700 bg-surface-900 p-3 text-sm text-ink-300">
                <p className="text-ink-50 font-semibold">Avg per category</p>
                <p className="mt-1 text-2xl text-sage-300">{loading ? "—" : averageAssets}</p>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="h-72 bg-surface-800 rounded-lg animate-pulse" />
          ) : categoryData.length ? (
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={categoryData} margin={{ top: 10, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#232830" vertical={false} />
                <XAxis
                  dataKey="name"
                  stroke="#8B9188"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  interval={0}
                  tick={{ fill: "#A6ADBA" }}
                />
                <YAxis
                  stroke="#8B9188"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                  tick={{ fill: "#A6ADBA" }}
                />
                <Tooltip
                  contentStyle={{ background: "#181C20", border: "1px solid #232830", borderRadius: 10, fontSize: 13 }}
                  formatter={(value) => [`${value} assets`, "Count"]}
                  labelStyle={{ color: "#E2E8F0" }}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#8FA073"
                  strokeWidth={3}
                  dot={{ r: 4, stroke: "#8FA073", strokeWidth: 2, fill: "#111827" }}
                  activeDot={{ r: 6, fill: "#A9F0C1" }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState title="No asset data yet" subtitle="Register your first asset to see category trends here." />
          )}
        </div>

        {/* Quick actions + Recent activity */}
        <div className="space-y-6">
          <div className="card p-5">
            <h3 className="font-display font-semibold text-ink-50 mb-3 text-sm">Quick Actions</h3>
            <div className="space-y-2">
              <Link to="/assets/register" className="btn-secondary w-full justify-start">
                <PlusCircle size={16} /> Register Asset
              </Link>
              <Link to="/booking" className="btn-secondary w-full justify-start">
                <CalendarPlus size={16} /> Book Resource
              </Link>
              <Link to="/maintenance" className="btn-secondary w-full justify-start">
                <Wrench size={16} /> Raise Request
              </Link>
            </div>
          </div>

          <div className="card p-5">
            <h3 className="font-display font-semibold text-ink-50 mb-3 text-sm">Recent Activity</h3>
            {loading ? (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-10 bg-surface-800 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : data?.recentActivity?.length ? (
              <ul className="space-y-3">
                {data.recentActivity.map((a) => (
                  <li key={a.id} className="text-sm text-ink-200 border-l-2 border-surface-700 pl-3">
                    {a.message}
                    <p className="text-xs text-ink-600 mt-0.5">{new Date(a.createdAt).toLocaleString()}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-ink-600">No activity yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
