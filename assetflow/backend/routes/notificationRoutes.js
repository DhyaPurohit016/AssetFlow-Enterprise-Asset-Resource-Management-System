import express from "express";
import * as notificationController from "../controllers/notificationController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(protect);

// Get notifications
router.get("/", notificationController.getNotifications);

// Get unread count
router.get("/unread/count", notificationController.getUnreadCount);

// Mark all as read
router.patch("/read-all", notificationController.markAllAsRead);

// Mark single as read
router.patch("/:id/read", notificationController.markAsRead);

// Delete notification
router.delete("/:id", notificationController.deleteNotification);

export default router;
