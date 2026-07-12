import Allocation from "../models/Allocation.js";
import Asset from "../models/Asset.js";
import ActivityLog from "../models/ActivityLog.js";
import { asyncHandler } from "../middlewares/errorMiddleware.js";

// @desc  Allocate an available asset directly to an employee
// @route POST /api/allocations
export const allocateAsset = asyncHandler(async (req, res) => {
  const { assetId, allocatedTo, department, dueDate, conditionAtAllocation } = req.body;

  const asset = await Asset.findById(assetId);
  if (!asset) {
    res.status(404);
    throw new Error("Asset not found");
  }

  // Conflict detection: prevent double allocation
  if (asset.lifecycleStatus === "Allocated") {
    res.status(409);
    throw new Error(
      `${asset.assetTag} is already allocated. Use a transfer request instead of a direct allocation.`
    );
  }
  if (asset.lifecycleStatus === "Under Maintenance") {
    res.status(409);
    throw new Error(`${asset.assetTag} is under maintenance and cannot be allocated.`);
  }

  const allocation = await Allocation.create({
    asset: asset._id,
    allocatedTo,
    allocatedBy: req.user._id,
    department,
    type: "Allocation",
    status: "Active",
    conditionAtAllocation: conditionAtAllocation || asset.condition,
    dueDate: dueDate || null,
  });

  asset.lifecycleStatus = "Allocated";
  asset.currentHolder = allocatedTo;
  await asset.save();

  await ActivityLog.create({
    actor: req.user._id,
    action: "asset.allocated",
    message: `${asset.assetTag} allocated by ${req.user.name}`,
    entityType: "Allocation",
    entityId: allocation._id,
    category: "Approval",
  });

  res.status(201).json(allocation);
});

// @desc  Raise a transfer request (moves asset from current holder to a new employee)
// @route POST /api/allocations/transfer
export const requestTransfer = asyncHandler(async (req, res) => {
  const { assetId, transferTo, transferReason } = req.body;

  const asset = await Asset.findById(assetId);
  if (!asset) {
    res.status(404);
    throw new Error("Asset not found");
  }
  if (asset.lifecycleStatus !== "Allocated") {
    res.status(400);
    throw new Error("Only currently allocated assets can be transferred");
  }

  const transfer = await Allocation.create({
    asset: asset._id,
    allocatedTo: transferTo,
    allocatedBy: req.user._id,
    type: "Transfer",
    transferFrom: asset.currentHolder,
    transferTo,
    transferReason,
    status: "Pending",
  });

  await ActivityLog.create({
    actor: req.user._id,
    action: "transfer.requested",
    message: `Transfer requested for ${asset.assetTag} by ${req.user.name}`,
    entityType: "Allocation",
    entityId: transfer._id,
    category: "Approval",
  });

  res.status(201).json(transfer);
});

// @desc  Approve or reject a pending transfer request
// @route PATCH /api/allocations/:id/decision
export const decideTransfer = asyncHandler(async (req, res) => {
  const { decision } = req.body; // "Approved" | "Rejected"
  const transfer = await Allocation.findById(req.params.id).populate("asset");

  if (!transfer) {
    res.status(404);
    throw new Error("Transfer request not found");
  }
  if (transfer.status !== "Pending") {
    res.status(400);
    throw new Error("This request has already been actioned");
  }

  transfer.status = decision;
  transfer.approvedBy = req.user._id;
  await transfer.save();

  if (decision === "Approved") {
    const asset = await Asset.findById(transfer.asset._id);
    asset.currentHolder = transfer.transferTo;
    await asset.save();
  }

  await ActivityLog.create({
    actor: req.user._id,
    action: `transfer.${decision.toLowerCase()}`,
    message: `Transfer for ${transfer.asset.assetTag} ${decision.toLowerCase()} by ${req.user.name}`,
    entityType: "Allocation",
    entityId: transfer._id,
    category: "Approval",
  });

  res.json(transfer);
});

// @desc  Return an allocated asset
// @route POST /api/allocations/:id/return
export const returnAsset = asyncHandler(async (req, res) => {
  const { conditionAtReturn } = req.body;
  const allocation = await Allocation.findById(req.params.id).populate("asset");

  if (!allocation) {
    res.status(404);
    throw new Error("Allocation not found");
  }

  allocation.status = "Returned";
  allocation.conditionAtReturn = conditionAtReturn;
  allocation.returnedAt = new Date();
  await allocation.save();

  const asset = await Asset.findById(allocation.asset._id);
  asset.lifecycleStatus = "Available";
  asset.currentHolder = null;
  if (conditionAtReturn) asset.condition = conditionAtReturn;
  await asset.save();

  await ActivityLog.create({
    actor: req.user._id,
    action: "asset.returned",
    message: `${asset.assetTag} returned and marked available`,
    entityType: "Allocation",
    entityId: allocation._id,
    category: "General",
  });

  res.json(allocation);
});

// @desc  Get allocation history for a specific asset
// @route GET /api/allocations/asset/:assetId
export const getAssetAllocationHistory = asyncHandler(async (req, res) => {
  const history = await Allocation.find({ asset: req.params.assetId })
    .populate("allocatedTo", "name email")
    .populate("allocatedBy", "name")
    .populate("transferFrom", "name")
    .populate("transferTo", "name")
    .sort({ createdAt: -1 });

  res.json(history);
});

// @desc  List all allocations/transfers with optional status filter (drives Screen 5 UI)
// @route GET /api/allocations
export const getAllocations = asyncHandler(async (req, res) => {
  const { status, type } = req.query;
  const query = {};
  if (status) query.status = status;
  if (type) query.type = type;

  const allocations = await Allocation.find(query)
    .populate("asset", "assetTag name")
    .populate("allocatedTo", "name email")
    .populate("transferFrom", "name")
    .populate("transferTo", "name")
    .sort({ createdAt: -1 });

  // Overdue detection
  const now = new Date();
  const withOverdue = allocations.map((a) => {
    const obj = a.toObject();
    obj.isOverdue = a.status === "Active" && a.dueDate && new Date(a.dueDate) < now;
    return obj;
  });

  res.json(withOverdue);
});
