import React, { useState, useEffect } from "react";
import { bookingAPI } from "../services/apiServices";
import { useSocket } from "../context/SocketContext";
import StatusBadge from "../components/StatusBadge";
import { format } from "date-fns";

export default function Booking() {
  const { socket } = useSocket();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [filter, setFilter] = useState("All Statuses");
  const [formData, setFormData] = useState({
    resourceId: "",
    startDate: "",
    endDate: "",
    purpose: "",
    notes: "",
  });

  useEffect(() => {
    fetchBookings();
  }, [filter]);

  useEffect(() => {
    if (socket) {
      socket.on("booking:updated", (data) => {
        setBookings((prev) =>
          prev.map((b) => (b._id === data._id ? data : b))
        );
      });

      return () => socket.off("booking:updated");
    }
  }, [socket]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const params = filter !== "All Statuses" ? { status: filter } : {};
      const response = await bookingAPI.getBookings(params);
      setBookings(response.data.bookings);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBooking = async (e) => {
    e.preventDefault();
    try {
      const response = await bookingAPI.createBooking(formData);
      setBookings((prev) => [response.data, ...prev]);
      socket?.emit("booking:created", response.data);
      setShowForm(false);
      setFormData({ resourceId: "", startDate: "", endDate: "", purpose: "", notes: "" });
    } catch (error) {
      alert("Error creating booking: " + error.response?.data?.message);
    }
  };

  const handleStatusChange = async (bookingId, newStatus) => {
    try {
      const response = await bookingAPI.updateBookingStatus(bookingId, { status: newStatus });
      setBookings((prev) =>
        prev.map((b) => (b._id === bookingId ? response.data : b))
      );
      socket?.emit("booking:status_changed", response.data);
      setSelectedBooking(null);
    } catch (error) {
      alert("Error updating booking: " + error.response?.data?.message);
    }
  };

  const handleDeleteBooking = async (bookingId) => {
    if (window.confirm("Are you sure you want to cancel this booking?")) {
      try {
        await bookingAPI.deleteBooking(bookingId);
        setBookings((prev) => prev.filter((b) => b._id !== bookingId));
      } catch (error) {
        alert("Error deleting booking: " + error.response?.data?.message);
      }
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      Pending: "bg-yellow-100 text-yellow-800",
      Approved: "bg-green-100 text-green-800",
      Rejected: "bg-red-100 text-red-800",
      Completed: "bg-blue-100 text-blue-800",
      Cancelled: "bg-gray-100 text-gray-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Resource Booking</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn btn-primary"
        >
          + New Booking
        </button>
      </div>

      {showForm && (
        <div className="card p-6 bg-surface-900 border border-surface-700">
          <h2 className="text-xl font-semibold mb-4">Create New Booking</h2>
          <form onSubmit={handleCreateBooking} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Resource ID"
                value={formData.resourceId}
                onChange={(e) =>
                  setFormData({ ...formData, resourceId: e.target.value })
                }
                required
                className="input input-bordered"
              />
              <input
                type="datetime-local"
                value={formData.startDate}
                onChange={(e) =>
                  setFormData({ ...formData, startDate: e.target.value })
                }
                required
                className="input input-bordered"
              />
              <input
                type="datetime-local"
                value={formData.endDate}
                onChange={(e) =>
                  setFormData({ ...formData, endDate: e.target.value })
                }
                required
                className="input input-bordered"
              />
              <input
                type="text"
                placeholder="Purpose"
                value={formData.purpose}
                onChange={(e) =>
                  setFormData({ ...formData, purpose: e.target.value })
                }
                required
                className="input input-bordered"
              />
            </div>
            <textarea
              placeholder="Notes"
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              className="textarea textarea-bordered w-full"
            />
            <div className="flex gap-2">
              <button type="submit" className="btn btn-success">
                Create Booking
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="btn btn-ghost"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="flex gap-2 flex-wrap">
        {["All Statuses", "Pending", "Approved", "Completed", "Cancelled"].map(
          (status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`btn btn-sm ${
                filter === status
                  ? "btn-primary"
                  : "btn-outline"
              }`}
            >
              {status}
            </button>
          )
        )}
      </div>

      {loading ? (
        <div className="text-center py-8">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      ) : bookings.length === 0 ? (
        <div className="card p-8 text-center bg-surface-900 border border-surface-700">
          <p className="text-surface-400">No bookings found</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {bookings.map((booking) => (
            <div
              key={booking._id}
              className="card p-6 bg-surface-900 border border-surface-700 hover:border-primary transition-colors"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold">
                    {booking.resource?.name || "Unknown Resource"}
                  </h3>
                  <p className="text-sm text-surface-400">
                    By: {booking.bookedBy?.name || "Unknown"}
                  </p>
                </div>
                <span className={`badge badge-lg ${getStatusColor(booking.status)}`}>
                  {booking.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                <div>
                  <p className="text-surface-400">Start</p>
                  <p>{format(new Date(booking.startDate), "MMM dd, yyyy hh:mm a")}</p>
                </div>
                <div>
                  <p className="text-surface-400">End</p>
                  <p>{format(new Date(booking.endDate), "MMM dd, yyyy hh:mm a")}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-surface-400">Purpose</p>
                  <p>{booking.purpose}</p>
                </div>
              </div>

              {booking.notes && (
                <p className="text-sm text-surface-300 mb-4 italic">{booking.notes}</p>
              )}

              {booking.status === "Pending" && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleStatusChange(booking._id, "Approved")}
                    className="btn btn-sm btn-success"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleStatusChange(booking._id, "Rejected")}
                    className="btn btn-sm btn-error"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => handleDeleteBooking(booking._id)}
                    className="btn btn-sm btn-ghost"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
