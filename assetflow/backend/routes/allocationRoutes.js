import express from "express";
import {
  allocateAsset, requestTransfer, decideTransfer, returnAsset,
  getAssetAllocationHistory, getAllocations,
} from "../controllers/allocationController.js";
import { protect, authorize } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.get("/", getAllocations);
router.post("/", authorize("Admin", "Asset Manager"), allocateAsset);
router.post("/transfer", requestTransfer);
router.patch("/:id/decision", authorize("Admin", "Asset Manager", "Department Head"), decideTransfer);
router.post("/:id/return", returnAsset);
router.get("/asset/:assetId", getAssetAllocationHistory);

export default router;
