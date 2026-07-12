import React, { useState, useEffect } from "react";
import { reportsAPI } from "../services/apiServices";

export default function Reports() {
  const [analytics, setAnalytics] = useState(null);
  const [departmentAssets, setDepartmentAssets] = useState([]);
  const [maintenanceReport, setMaintenanceReport] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedChart, setSelectedChart] = useState("assets");
  const [period, setPeriod] = useState("month");

  useEffect(() => {
    fetchAllReports();
  }, []);

  useEffect(() => {
    fetchChartData();
  }, [selectedChart, period]);

  const fetchAllReports = async () => {
    try {
      setLoading(true);
      const [
        analyticsRes,
        departmentRes,
        maintenanceRes,
      ] = await Promise.all([
        reportsAPI.getDashboardAnalytics(),
        reportsAPI.getDepartmentAssets(),
        reportsAPI.getMaintenanceReport(),
      ]);

      setAnalytics(analyticsRes.data);
      setDepartmentAssets(departmentRes.data);
      setMaintenanceReport(maintenanceRes.data);
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchChartData = async () => {
    try {
      const response = await reportsAPI.getChartData({
        type: selectedChart,
        period,
      });
      setChartData(response.data);
    } catch (error) {
      console.error("Error fetching chart data:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Reports & Analytics</h1>

      {/* KPI Cards */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Assets Stats */}
          <div className="card bg-gradient-to-br from-blue-900 to-surface-900 p-6 border border-blue-500/30">
            <h3 className="text-lg font-semibold mb-4">Assets Overview</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-surface-300">Total Assets</span>
                <span className="text-2xl font-bold text-blue-400">
                  {analytics.assets.total?.[0]?.count || 0}
                </span>
              </div>
              <div className="text-sm text-surface-400 space-y-1">
                {analytics.assets.byStatus?.map((status) => (
                  <div key={status._id} className="flex justify-between">
                    <span>{status._id}</span>
                    <span className="font-semibold">{status.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Allocations Stats */}
          <div className="card bg-gradient-to-br from-purple-900 to-surface-900 p-6 border border-purple-500/30">
            <h3 className="text-lg font-semibold mb-4">Allocations</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-surface-300">Total Allocations</span>
                <span className="text-2xl font-bold text-purple-400">
                  {analytics.allocations.byStatus?.reduce(
                    (sum, s) => sum + s.count,
                    0
                  ) || 0}
                </span>
              </div>
              <div className="text-sm text-surface-400 space-y-1">
                <div className="flex justify-between">
                  <span>Overdue</span>
                  <span className="font-semibold text-orange-400">
                    {analytics.allocations.overdueCount?.[0]?.count || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Maintenance Stats */}
          <div className="card bg-gradient-to-br from-orange-900 to-surface-900 p-6 border border-orange-500/30">
            <h3 className="text-lg font-semibold mb-4">Maintenance</h3>
            <div className="space-y-2">
              <div className="text-sm text-surface-400 space-y-1">
                {maintenanceReport?.byStatus?.map((status) => (
                  <div key={status._id} className="flex justify-between">
                    <span>{status._id}</span>
                    <span className="font-semibold">{status.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chart Data */}
      <div className="card bg-surface-900 p-6 border border-surface-700">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Trends</h2>
          <div className="flex gap-2">
            <select
              value={selectedChart}
              onChange={(e) => setSelectedChart(e.target.value)}
              className="select select-sm select-bordered"
            >
              <option value="assets">Assets</option>
              <option value="allocations">Allocations</option>
              <option value="maintenance">Maintenance</option>
            </select>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="select select-sm select-bordered"
            >
              <option value="day">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">This Month</option>
            </select>
          </div>
        </div>

        {chartData && (
          <div className="overflow-x-auto">
            <table className="table table-compact w-full">
              <thead>
                <tr>
                  <th>Date</th>
                  <th className="text-right">Count</th>
                </tr>
              </thead>
              <tbody>
                {chartData[selectedChart]?.map((item, idx) => (
                  <tr key={idx} className="hover">
                    <td>{item._id}</td>
                    <td className="text-right">
                      <div className="flex justify-end">
                        <div
                          className="bg-primary/50 rounded px-2 py-1"
                          style={{
                            width: `${
                              (item.count /
                                Math.max(
                                  ...chartData[selectedChart].map(
                                    (d) => d.count
                                  )
                                )) *
                              100
                            }%`,
                          }}
                        >
                          {item.count}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Department Assets */}
      {departmentAssets.length > 0 && (
        <div className="card bg-surface-900 p-6 border border-surface-700">
          <h2 className="text-xl font-semibold mb-4">Department Assets</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {departmentAssets.map((dept) => (
              <div
                key={dept._id}
                className="bg-surface-800 p-4 rounded-lg border border-surface-700"
              >
                <h3 className="font-semibold text-lg mb-2">{dept.name}</h3>
                <div className="text-2xl font-bold text-primary mb-3">
                  {dept.assetCount} Assets
                </div>
                <div className="space-y-1 text-sm">
                  {Object.entries(dept.assetsByStatus || {}).map(
                    ([status, count]) => (
                      <div key={status} className="flex justify-between">
                        <span className="text-surface-400">{status}</span>
                        <span className="font-semibold">{count}</span>
                      </div>
                    )
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Maintenance Breakdown */}
      {maintenanceReport && (
        <div className="card bg-surface-900 p-6 border border-surface-700">
          <h2 className="text-xl font-semibold mb-4">Maintenance Breakdown</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-lg mb-3">By Priority</h3>
              <div className="space-y-2">
                {maintenanceReport.byPriority?.map((p) => (
                  <div key={p._id} className="flex justify-between">
                    <span className="text-surface-300">{p._id}</span>
                    <span className="font-semibold">{p.count}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-3">Overdue Tasks</h3>
              <div className="text-3xl font-bold text-orange-400">
                {maintenanceReport.overdue?.[0]?.count || 0}
              </div>
              <p className="text-sm text-surface-400 mt-2">
                Tasks past their due date
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
