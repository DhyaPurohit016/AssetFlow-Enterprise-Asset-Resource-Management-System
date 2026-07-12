import express from "express";
import * as reportsController from "../controllers/reportsController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(protect);

// Analytics & Dashboard
router.get("/dashboard-analytics", reportsController.getDashboardAnalytics);

// Asset utilization
router.get("/asset-utilization", reportsController.getAssetUtilizationReport);

// Department assets
router.get("/department-assets", reportsController.getDepartmentAssetsReport);

// Maintenance statistics
router.get("/maintenance", reportsController.getMaintenanceReport);

// Audit trail
router.get("/audit-trail", reportsController.getAuditTrail);

// Asset allocation history
router.get("/asset/:assetId/allocation-history", reportsController.getAssetAllocationHistory);

// Chart data
router.get("/chart-data", reportsController.getChartData);

export default router;
