import Asset from "../models/Asset.js";
import ActivityLog from "../models/ActivityLog.js";
import { generateAssetTag } from "../utils/assetTag.js";
import { asyncHandler } from "../middlewares/errorMiddleware.js";

// @desc  Register a new asset
// @route POST /api/assets
export const createAsset = asyncHandler(async (req, res) => {
  const {
    name, category, serialNumber, condition, purchaseDate,
    warrantyExpiry, location, department, images, documents, notes,
  } = req.body;

  if (!name || !category) {
    res.status(400);
    throw new Error("Asset name and category are required");
  }

  const assetTag = await generateAssetTag();

  const asset = await Asset.create({
    assetTag,
    name,
    category,
    serialNumber,
    condition,
    purchaseDate,
    warrantyExpiry,
    location,
    department,
    images: images || [],
    documents: documents || [],
    notes,
    // QR encodes a deep link to the asset detail page; frontend renders it with qrcode.react
    qrCodeUrl: `${process.env.CLIENT_URL || "http://localhost:5173"}/assets/tag/${assetTag}`,
  });

  await ActivityLog.create({
    actor: req.user._id,
    action: "asset.registered",
    message: `${req.user.name} registered asset ${asset.assetTag} - ${asset.name}`,
    entityType: "Asset",
    entityId: asset._id,
    category: "General",
  });

  res.status(201).json(asset);
});

// @desc  List assets with search, filter, pagination
// @route GET /api/assets
export const getAssets = asyncHandler(async (req, res) => {
  const { search, category, status, department, page = 1, limit = 10 } = req.query;

  const query = {};
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { assetTag: { $regex: search, $options: "i" } },
      { serialNumber: { $regex: search, $options: "i" } },
    ];
  }
  if (category) query.category = category;
  if (status) query.lifecycleStatus = status;
  if (department) query.department = department;

  const skip = (Number(page) - 1) * Number(limit);

  const [assets, total] = await Promise.all([
    Asset.find(query)
      .populate("category", "name prefix")
      .populate("department", "name")
      .populate("currentHolder", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Asset.countDocuments(query),
  ]);

  res.json({
    assets,
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
  });
});

// @desc  Get single asset by ID (with allocation-history-friendly population)
// @route GET /api/assets/:id
export const getAssetById = asyncHandler(async (req, res) => {
  const asset = await Asset.findById(req.params.id)
    .populate("category", "name prefix")
    .populate("department", "name")
    .populate("currentHolder", "name email");

  if (!asset) {
    res.status(404);
    throw new Error("Asset not found");
  }
  res.json(asset);
});

// @desc  Get single asset by its tag (used by QR scan deep link)
// @route GET /api/assets/tag/:tag
export const getAssetByTag = asyncHandler(async (req, res) => {
  const asset = await Asset.findOne({ assetTag: req.params.tag })
    .populate("category", "name prefix")
    .populate("department", "name")
    .populate("currentHolder", "name email");

  if (!asset) {
    res.status(404);
    throw new Error("No asset found with that tag");
  }
  res.json(asset);
});

// @desc  Update an asset
// @route PUT /api/assets/:id
export const updateAsset = asyncHandler(async (req, res) => {
  const asset = await Asset.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!asset) {
    res.status(404);
    throw new Error("Asset not found");
  }

  await ActivityLog.create({
    actor: req.user._id,
    action: "asset.updated",
    message: `${req.user.name} updated asset ${asset.assetTag}`,
    entityType: "Asset",
    entityId: asset._id,
    category: "General",
  });

  res.json(asset);
});

// @desc  Delete / retire an asset
// @route DELETE /api/assets/:id
export const deleteAsset = asyncHandler(async (req, res) => {
  const asset = await Asset.findByIdAndDelete(req.params.id);
  if (!asset) {
    res.status(404);
    throw new Error("Asset not found");
  }
  res.json({ message: "Asset removed" });
});

// @desc  Bulk upload assets (from parsed Excel/CSV rows sent as JSON array)
// @route POST /api/assets/bulk
export const bulkCreateAssets = asyncHandler(async (req, res) => {
  const { assets } = req.body;
  if (!Array.isArray(assets) || assets.length === 0) {
    res.status(400);
    throw new Error("Provide a non-empty array of assets");
  }

  const created = [];
  for (const row of assets) {
    const assetTag = await generateAssetTag();
    const asset = await Asset.create({
      assetTag,
      name: row.name,
      category: row.category,
      serialNumber: row.serialNumber,
      condition: row.condition || "New",
      location: row.location,
      department: row.department || null,
      qrCodeUrl: `${process.env.CLIENT_URL || "http://localhost:5173"}/assets/tag/${assetTag}`,
    });
    created.push(asset);
  }

  res.status(201).json({ message: `${created.length} assets imported`, assets: created });
});
