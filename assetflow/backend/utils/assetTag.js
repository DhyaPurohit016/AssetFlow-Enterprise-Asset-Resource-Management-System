import Asset from "../models/Asset.js";

// Generates a sequential tag like AF-0001, AF-0002... regardless of category,
// matching the "AF-xxxx" pattern used across the AssetFlow UI/wireframes.
export const generateAssetTag = async () => {
  const lastAsset = await Asset.findOne().sort({ createdAt: -1 }).select("assetTag");

  let nextNumber = 1;
  if (lastAsset?.assetTag) {
    const match = lastAsset.assetTag.match(/(\d+)$/);
    if (match) nextNumber = parseInt(match[1], 10) + 1;
  }

  return `AF-${String(nextNumber).padStart(4, "0")}`;
};

export const logActivity = async (ActivityLog, { actor, action, message, entityType, entityId, category }) => {
  try {
    await ActivityLog.create({ actor, action, message, entityType, entityId, category });
  } catch (err) {
    console.error("Failed to log activity:", err.message);
  }
};
