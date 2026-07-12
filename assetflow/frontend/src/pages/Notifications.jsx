import React, { useState, useEffect } from "react";
import { notificationAPI } from "../services/apiServices";
import { useSocket } from "../context/SocketContext";
import { formatDistanceToNow } from "date-fns";

export default function Notifications() {
  const { socket } = useSocket();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
  }, [filter, page]);

  useEffect(() => {
    if (socket) {
      socket.on("notification:new", (data) => {
        setNotifications((prev) => [data, ...prev]);
        setUnreadCount((prev) => prev + 1);
      });

      return () => socket.off("notification:new");
    }
  }, [socket]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 15,
        unreadOnly: filter === "unread",
      };
      const response = await notificationAPI.getNotifications(params);
      setNotifications(response.data.notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await notificationAPI.getUnreadCount();
      setUnreadCount(response.data.unreadCount);
    } catch (error) {
      console.error("Error fetching unread count:", error);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await notificationAPI.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) =>
          n._id === id ? { ...n, isRead: true, readAt: new Date() } : n
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationAPI.markAllAsRead();
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true, readAt: new Date() }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  const handleDeleteNotification = async (id) => {
    try {
      await notificationAPI.deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const getNotificationIcon = (type) => {
    const icons = {
      booking: "📅",
      allocation: "📦",
      maintenance: "🔧",
      audit: "📋",
      asset_update: "💾",
    };
    return icons[type] || "📌";
  };

  const getNotificationColor = (type) => {
    const colors = {
      booking: "border-blue-500",
      allocation: "border-purple-500",
      maintenance: "border-orange-500",
      audit: "border-green-500",
      asset_update: "border-cyan-500",
    };
    return colors[type] || "border-surface-500";
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Notifications</h1>
          {unreadCount > 0 && (
            <p className="text-sm text-surface-400 mt-1">
              {unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}
            </p>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="btn btn-sm btn-primary"
          >
            Mark All as Read
          </button>
        )}
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => {
            setFilter("all");
            setPage(1);
          }}
          className={`btn btn-sm ${filter === "all" ? "btn-primary" : "btn-outline"}`}
        >
          All
        </button>
        <button
          onClick={() => {
            setFilter("unread");
            setPage(1);
          }}
          className={`btn btn-sm ${filter === "unread" ? "btn-primary" : "btn-outline"}`}
        >
          Unread ({unreadCount})
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      ) : notifications.length === 0 ? (
        <div className="card p-8 text-center bg-surface-900 border border-surface-700">
          <p className="text-surface-400">No notifications yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((notification) => (
            <div
              key={notification._id}
              className={`card p-4 border-l-4 ${getNotificationColor(
                notification.type
              )} bg-surface-900 hover:bg-surface-800 transition-colors ${
                !notification.isRead ? "ring-1 ring-primary" : ""
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">
                      {getNotificationIcon(notification.type)}
                    </span>
                    <div>
                      <h3 className="font-semibold">
                        {notification.title}
                      </h3>
                      {!notification.isRead && (
                        <span className="badge badge-xs badge-primary">New</span>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-surface-300">
                    {notification.message}
                  </p>
                  <p className="text-xs text-surface-500 mt-2">
                    {formatDistanceToNow(new Date(notification.createdAt), {
                      addSuffix: true,
                    })}
                  </p>
                </div>

                <div className="flex gap-1">
                  {!notification.isRead && (
                    <button
                      onClick={() => handleMarkAsRead(notification._id)}
                      className="btn btn-xs btn-ghost"
                      title="Mark as read"
                    >
                      ✓
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteNotification(notification._id)}
                    className="btn btn-xs btn-ghost text-error"
                    title="Delete"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {notification.actionUrl && (
                <div className="mt-3">
                  <a
                    href={notification.actionUrl}
                    className="link link-primary text-sm"
                  >
                    View Details →
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
