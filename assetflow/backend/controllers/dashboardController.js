import Asset from "../models/Asset.js";
import Allocation from "../models/Allocation.js";
import Maintenance from "../models/Maintenance.js";
import ActivityLog from "../models/ActivityLog.js";

// @desc  Aggregated dashboard data - KPIs, alerts, recent activity, chart series
// @route GET /api/dashboard
export const getDashboardData = async (req, res, next) => {
  try {
    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const [
      totalAssets,
      available,
      allocated,
      underMaintenance,
      activeAllocations,
      pendingTransfers,
      upcomingReturns,
      overdueAllocations,
      recentActivity,
      utilizationByCategory,
    ] = await Promise.all([
      Asset.countDocuments(),
      Asset.countDocuments({ lifecycleStatus: "Available" }),
      Asset.countDocuments({ lifecycleStatus: "Allocated" }),
      Asset.countDocuments({ lifecycleStatus: "Under Maintenance" }),
      Allocation.countDocuments({ status: "Active" }),
      Allocation.countDocuments({ status: "Pending", type: "Transfer" }),
      Allocation.countDocuments({
        status: "Active",
        dueDate: { $gte: now, $lte: sevenDaysFromNow },
      }),
      Allocation.find({ status: "Active", dueDate: { $lt: now } })
        .populate("asset", "assetTag name")
        .populate("allocatedTo", "name")
        .limit(5),
      ActivityLog.find().sort({ createdAt: -1 }).limit(8).populate("actor", "name"),
      Asset.aggregate([
        { $lookup: { from: "categories", localField: "category", foreignField: "_id", as: "cat" } },
        { $unwind: { path: "$cat", preserveNullAndEmptyArrays: true } },
        { $group: { _id: "$cat.name", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
    ]);

    res.json({
      kpis: {
        totalAssets,
        available,
        allocated,
        underMaintenance,
        activeBookings: activeAllocations, // booking module placeholder maps to active allocations for now
        pendingTransfers,
        upcomingReturns,
      },
      alerts: overdueAllocations.map((a) => ({
        id: a._id,
        message: `${a.asset?.assetTag} allocated to ${a.allocatedTo?.name} is overdue for return`,
      })),
      recentActivity: recentActivity.map((r) => ({
        id: r._id,
        message: r.message,
        category: r.category,
        createdAt: r.createdAt,
      })),
      chart: {
        byCategory: utilizationByCategory.map((c) => ({ name: c._id || "Uncategorized", count: c.count })),
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc  Global search across assets, employees, maintenance (Ctrl+K)
// @route GET /api/dashboard/search?q=
export const globalSearch = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 2) {
      return res.json({ assets: [], maintenance: [] });
    }

    const regex = { $regex: q, $options: "i" };

    const [assets, maintenance] = await Promise.all([
      Asset.find({ $or: [{ name: regex }, { assetTag: regex }, { serialNumber: regex }] }).limit(5),
      Maintenance.find().populate("asset", "assetTag name").limit(5),
    ]);

    res.json({ assets, maintenance });
  } catch (err) {
    next(err);
  }
};
