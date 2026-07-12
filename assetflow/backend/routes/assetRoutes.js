import express from "express";
import {
  createAsset, getAssets, getAssetById, getAssetByTag,
  updateAsset, deleteAsset, bulkCreateAssets,
} from "../controllers/assetController.js";
import { protect, authorize } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.get("/", getAssets);
router.post("/", authorize("Admin", "Asset Manager"), createAsset);
router.post("/bulk", authorize("Admin", "Asset Manager"), bulkCreateAssets);
router.get("/tag/:tag", getAssetByTag);
router.get("/:id", getAssetById);
router.put("/:id", authorize("Admin", "Asset Manager"), updateAsset);
router.delete("/:id", authorize("Admin"), deleteAsset);

export default router;
