import Notification from "../models/Notification.js";
import { asyncHandler } from "../middlewares/errorMiddleware.js";

// Get user notifications
export const getNotifications = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, unreadOnly = false } = req.query;
  const skip = (page - 1) * limit;

  const filter = { recipient: req.user._id };
  if (unreadOnly === "true") filter.isRead = false;

  const notifications = await Notification.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Notification.countDocuments(filter);
  const unreadCount = await Notification.countDocuments({
    recipient: req.user._id,
    isRead: false,
  });

  res.json({
    notifications,
    unreadCount,
    pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) },
  });
});

// Mark notification as read
export const markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findByIdAndUpdate(
    req.params.id,
    { isRead: true, readAt: new Date() },
    { new: true }
  );

  if (!notification) {
    res.status(404);
    throw new Error("Notification not found");
  }

  res.json(notification);
});

// Mark all notifications as read
export const markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { recipient: req.user._id, isRead: false },
    { isRead: true, readAt: new Date() }
  );

  res.json({ message: "All notifications marked as read" });
});

// Delete notification
export const deleteNotification = asyncHandler(async (req, res) => {
  const notification = await Notification.findByIdAndDelete(req.params.id);

  if (!notification) {
    res.status(404);
    throw new Error("Notification not found");
  }

  res.json({ message: "Notification deleted successfully" });
});

// Get unread count
export const getUnreadCount = asyncHandler(async (req, res) => {
  const unreadCount = await Notification.countDocuments({
    recipient: req.user._id,
    isRead: false,
  });

  res.json({ unreadCount });
});

// Create notification (internal use - called from other controllers)
export const createNotification = async (recipientId, type, title, message, options = {}) => {
  try {
    const notification = await Notification.create({
      recipient: recipientId,
      type,
      title,
      message,
      relatedEntity: options.relatedEntity,
      actionUrl: options.actionUrl,
    });
    return notification;
  } catch (error) {
    console.error("Error creating notification:", error);
  }
};
