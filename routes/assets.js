const assets = require("../models/asset");

function listAssets() {
  return {
    success: true,
    data: assets,
  };
}

function getDashboard() {
  return {
    success: true,
    data: {
      availableCriticalAssets: 42,
      allocatedEquipment: 76,
      maintenanceToday: 4,
      overdueReturns: 3,
      readinessScore: 82,
    },
  };
}

module.exports = {
  listAssets,
  getDashboard,
};
