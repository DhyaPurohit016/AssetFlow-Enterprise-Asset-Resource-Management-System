function canAllocate(asset) {
  return asset.status === "Available";
}

function isCritical(asset) {
  return asset.criticality === "Critical";
}

module.exports = {
  canAllocate,
  isCritical,
};
