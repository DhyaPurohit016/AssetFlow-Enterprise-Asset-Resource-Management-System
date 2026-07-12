import Maintenance from "../models/Maintenance.js";
import Asset from "../models/Asset.js";
import ActivityLog from "../models/ActivityLog.js";
import { asyncHandler } from "../middlewares/errorMiddleware.js";

// @desc  Raise a maintenance request
// @route POST /api/maintenance
export const raiseMaintenanceRequest = asyncHandler(async (req, res) => {
  const { assetId, issue, priority, attachments } = req.body;

  const asset = await Asset.findById(assetId);
  if (!asset) {
    res.status(404);
    throw new Error("Asset not found");
  }

  const request = await Maintenance.create({
    asset: assetId,
    raisedBy: req.user._id,
    issue,
    priority,
    attachments: attachments || [],
    status: "Pending",
  });

  await ActivityLog.create({
    actor: req.user._id,
    action: "maintenance.raised",
    message: `Maintenance request raised for ${asset.assetTag} - ${issue}`,
    entityType: "Maintenance",
    entityId: request._id,
    category: "Alert",
  });

  res.status(201).json(request);
});

// @desc  Get all maintenance requests, shaped as kanban columns
// @route GET /api/maintenance
export const getMaintenanceRequests = asyncHandler(async (req, res) => {
  const requests = await Maintenance.find()
    .populate("asset", "assetTag name")
    .populate("raisedBy", "name")
    .sort({ createdAt: -1 });

  const columns = {
    Pending: [],
    Approved: [],
    "Technician Assigned": [],
    "In Progress": [],
    Resolved: [],
    Rejected: [],
  };

  requests.forEach((r) => {
    if (columns[r.status]) columns[r.status].push(r);
  });

  res.json(columns);
});

// @desc  Move a maintenance request to a new kanban status
// @route PATCH /api/maintenance/:id/status
export const updateMaintenanceStatus = asyncHandler(async (req, res) => {
  const { status, technicianName, resolutionNotes } = req.body;

  const request = await Maintenance.findById(req.params.id).populate("asset");
  if (!request) {
    res.status(404);
    throw new Error("Maintenance request not found");
  }

  request.status = status;
  if (technicianName) request.technicianName = technicianName;
  if (resolutionNotes) request.resolutionNotes = resolutionNotes;
  if (status === "Resolved") request.resolvedAt = new Date();
  await request.save();

  // Automatic asset status updates
  const asset = await Asset.findById(request.asset._id);
  if (["Approved", "Technician Assigned", "In Progress"].includes(status)) {
    asset.lifecycleStatus = "Under Maintenance";
  } else if (status === "Resolved") {
    asset.lifecycleStatus = "Available";
  }
  await asset.save();

  await ActivityLog.create({
    actor: req.user._id,
    action: "maintenance.status_changed",
    message: `${asset.assetTag} maintenance moved to "${status}"`,
    entityType: "Maintenance",
    entityId: request._id,
    category: "Alert",
  });

  res.json(request);
});

// @desc  Maintenance history for one asset
// @route GET /api/maintenance/asset/:assetId
export const getAssetMaintenanceHistory = asyncHandler(async (req, res) => {
  const history = await Maintenance.find({ asset: req.params.assetId })
    .populate("raisedBy", "name")
    .sort({ createdAt: -1 });
  res.json(history);
});
