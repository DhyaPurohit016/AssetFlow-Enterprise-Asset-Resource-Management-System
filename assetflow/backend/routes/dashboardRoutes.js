import express from "express";
import { getDashboardData, globalSearch } from "../controllers/dashboardController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.get("/", getDashboardData);
router.get("/search", globalSearch);

export default router;
