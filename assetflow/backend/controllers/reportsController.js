import Asset from "../models/Asset.js";
import Allocation from "../models/Allocation.js";
import Maintenance from "../models/Maintenance.js";
import ActivityLog from "../models/ActivityLog.js";
import Department from "../models/Department.js";
import { asyncHandler } from "../middlewares/errorMiddleware.js";

// Dashboard analytics
export const getDashboardAnalytics = asyncHandler(async (req, res) => {
  const assetStats = await Asset.aggregate([
    {
      $facet: {
        byStatus: [
          { $group: { _id: "$lifecycleStatus", count: { $sum: 1 } } },
        ],
        byCondition: [
          { $group: { _id: "$condition", count: { $sum: 1 } } },
        ],
        total: [{ $count: "count" }],
      },
    },
  ]);

  const allocationStats = await Allocation.aggregate([
    {
      $facet: {
        byStatus: [{ $group: { _id: "$status", count: { $sum: 1 } } }],
        overdueCount: [
          {
            $match: {
              status: "Pending",
              returnDate: { $lt: new Date() },
            },
          },
          { $count: "count" },
        ],
      },
    },
  ]);

  const maintenanceStats = await Maintenance.aggregate([
    {
      $facet: {
        byStatus: [{ $group: { _id: "$status", count: { $sum: 1 } } }],
        byPriority: [{ $group: { _id: "$priority", count: { $sum: 1 } } }],
      },
    },
  ]);

  res.json({
    assets: assetStats[0],
    allocations: allocationStats[0],
    maintenance: maintenanceStats[0],
  });
});

// Asset utilization report
export const getAssetUtilizationReport = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  const filter = {};

  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate) filter.createdAt.$lte = new Date(endDate);
  }

  const report = await Asset.aggregate([
    { $match: filter },
    {
      $lookup: {
        from: "allocations",
        localField: "_id",
        foreignField: "asset",
        as: "allocations",
      },
    },
    {
      $project: {
        assetTag: 1,
        name: 1,
        category: 1,
        lifecycleStatus: 1,
        allocationCount: { $size: "$allocations" },
        currentAllocation: {
          $cond: [
            { $eq: ["$lifecycleStatus", "Allocated"] },
            { $arrayElemAt: ["$allocations", 0] },
            null,
          ],
        },
      },
    },
  ]);

  res.json(report);
});

// Department assets report
export const getDepartmentAssetsReport = asyncHandler(async (req, res) => {
  const report = await Department.aggregate([
    {
      $lookup: {
        from: "assets",
        localField: "_id",
        foreignField: "department",
        as: "assets",
      },
    },
    {
      $project: {
        name: 1,
        assetCount: { $size: "$assets" },
        assetsByStatus: {
          $arrayToObject: {
            $map: {
              input: {
                $setUnion: ["$assets.lifecycleStatus"],
              },
              as: "status",
              in: {
                k: "$$status",
                v: {
                  $size: {
                    $filter: {
                      input: "$assets",
                      as: "asset",
                      cond: { $eq: ["$$asset.lifecycleStatus", "$$status"] },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  ]);

  res.json(report);
});

// Maintenance statistics
export const getMaintenanceReport = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  const filter = {};

  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate) filter.createdAt.$lte = new Date(endDate);
  }

  const report = await Maintenance.aggregate([
    { $match: filter },
    {
      $facet: {
        byStatus: [
          {
            $group: {
              _id: "$status",
              count: { $sum: 1 },
              avgResolutionTime: {
                $avg: {
                  $cond: [
                    { $ne: ["$resolvedAt", null] },
                    {
                      $divide: [
                        { $subtract: ["$resolvedAt", "$createdAt"] },
                        1000 * 60 * 60,
                      ],
                    },
                    0,
                  ],
                },
              },
            },
          },
        ],
        byPriority: [
          {
            $group: {
              _id: "$priority",
              count: { $sum: 1 },
            },
          },
        ],
        overdue: [
          {
            $match: {
              status: { $ne: "Resolved" },
              dueDate: { $lt: new Date() },
            },
          },
          { $count: "count" },
        ],
      },
    },
  ]);

  res.json(report[0]);
});

// Audit trail
export const getAuditTrail = asyncHandler(async (req, res) => {
  const { actor, action, entityType, page = 1, limit = 20 } = req.query;
  const skip = (page - 1) * limit;

  const filter = {};
  if (actor) filter.actor = actor;
  if (action) filter.action = action;
  if (entityType) filter.entityType = entityType;

  const logs = await ActivityLog.find(filter)
    .populate("actor", "name email")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await ActivityLog.countDocuments(filter);

  res.json({
    logs,
    pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) },
  });
});

// Asset allocation history
export const getAssetAllocationHistory = asyncHandler(async (req, res) => {
  const { assetId } = req.params;

  const history = await Allocation.find({ asset: assetId })
    .populate("asset", "assetTag name")
    .populate("allocatedTo", "name email department")
    .populate("allocatedBy", "name email")
    .sort({ createdAt: -1 });

  if (!history) {
    res.status(404);
    throw new Error("No allocation history found");
  }

  res.json(history);
});

// Export statistics for charts
export const getChartData = asyncHandler(async (req, res) => {
  const { type, period } = req.query; // period: day, week, month

  let dateFilter = {};
  const now = new Date();

  if (period === "day") {
    dateFilter = {
      $gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
    };
  } else if (period === "week") {
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    dateFilter = { $gte: weekAgo };
  } else if (period === "month") {
    dateFilter = {
      $gte: new Date(now.getFullYear(), now.getMonth(), 1),
    };
  }

  let data = {};

  if (type === "assets" || !type) {
    data.assets = await Asset.aggregate([
      { $match: { createdAt: dateFilter } },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);
  }

  if (type === "allocations" || !type) {
    data.allocations = await Allocation.aggregate([
      { $match: { createdAt: dateFilter } },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);
  }

  if (type === "maintenance" || !type) {
    data.maintenance = await Maintenance.aggregate([
      { $match: { createdAt: dateFilter } },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);
  }

  res.json(data);
});
