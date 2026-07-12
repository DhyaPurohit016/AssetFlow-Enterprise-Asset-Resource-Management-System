const assetService = require("../routes/assets");

function assetIndex(req, res) {
  return assetService.listAssets();
}

module.exports = {
  assetIndex,
};
