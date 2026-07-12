import express from "express";
import {
  raiseMaintenanceRequest, getMaintenanceRequests,
  updateMaintenanceStatus, getAssetMaintenanceHistory,
} from "../controllers/maintenanceController.js";
import { protect, authorize } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.get("/", getMaintenanceRequests);
router.post("/", raiseMaintenanceRequest);
router.patch("/:id/status", authorize("Admin", "Asset Manager"), updateMaintenanceStatus);
router.get("/asset/:assetId", getAssetMaintenanceHistory);

export default router;
