import Booking from "../models/Booking.js";
import Asset from "../models/Asset.js";
import User from "../models/User.js";
import ActivityLog from "../models/ActivityLog.js";
import { asyncHandler } from "../middlewares/errorMiddleware.js";

// Create booking
export const createBooking = asyncHandler(async (req, res) => {
  const { resourceId, startDate, endDate, purpose, notes } = req.body;

  if (!resourceId || !startDate || !endDate || !purpose) {
    res.status(400);
    throw new Error("Resource, startDate, endDate, and purpose are required");
  }

  if (new Date(startDate) >= new Date(endDate)) {
    res.status(400);
    throw new Error("Start date must be before end date");
  }

  const resource = await Asset.findById(resourceId);
  if (!resource) {
    res.status(404);
    throw new Error("Resource not found");
  }

  const booking = await Booking.create({
    resource: resourceId,
    bookedBy: req.user._id,
    startDate,
    endDate,
    purpose,
    notes,
  }).populate("resource bookedBy");

  await ActivityLog.create({
    actor: req.user._id,
    action: "booking.created",
    message: `Booking created for ${resource.name}`,
    entityType: "Booking",
    entityId: booking._id,
    category: "Booking",
  });

  res.status(201).json(booking);
});

// Get all bookings with filters
export const getBookings = asyncHandler(async (req, res) => {
  const { status, resourceId, userId, page = 1, limit = 10 } = req.query;
  const skip = (page - 1) * limit;

  const filter = {};
  if (status) filter.status = status;
  if (resourceId) filter.resource = resourceId;
  if (userId) filter.bookedBy = userId;

  const bookings = await Booking.find(filter)
    .populate("resource", "assetTag name category")
    .populate("bookedBy", "name email")
    .populate("approvedBy", "name email")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Booking.countDocuments(filter);

  res.json({
    bookings,
    pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) },
  });
});

// Get single booking
export const getBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id)
    .populate("resource", "assetTag name category serialNumber")
    .populate("bookedBy", "name email department")
    .populate("approvedBy", "name email");

  if (!booking) {
    res.status(404);
    throw new Error("Booking not found");
  }

  res.json(booking);
});

// Update booking status
export const updateBookingStatus = asyncHandler(async (req, res) => {
  const { status, rejectionReason } = req.body;

  if (!status || !["Pending", "Approved", "Rejected", "Completed", "Cancelled"].includes(status)) {
    res.status(400);
    throw new Error("Valid status is required");
  }

  const booking = await Booking.findByIdAndUpdate(
    req.params.id,
    {
      status,
      approvedBy: status === "Approved" ? req.user._id : booking?.approvedBy,
      rejectionReason: status === "Rejected" ? rejectionReason : null,
    },
    { new: true }
  ).populate("resource bookedBy approvedBy");

  if (!booking) {
    res.status(404);
    throw new Error("Booking not found");
  }

  await ActivityLog.create({
    actor: req.user._id,
    action: "booking.updated",
    message: `Booking status changed to ${status}`,
    entityType: "Booking",
    entityId: booking._id,
    category: "Booking",
  });

  res.json(booking);
});

// Delete booking
export const deleteBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findByIdAndDelete(req.params.id);

  if (!booking) {
    res.status(404);
    throw new Error("Booking not found");
  }

  await ActivityLog.create({
    actor: req.user._id,
    action: "booking.deleted",
    message: "Booking cancelled",
    entityType: "Booking",
    entityId: booking._id,
    category: "Booking",
  });

  res.json({ message: "Booking deleted successfully" });
});

// Check availability
export const checkAvailability = asyncHandler(async (req, res) => {
  const { resourceId, startDate, endDate } = req.query;

  if (!resourceId || !startDate || !endDate) {
    res.status(400);
    throw new Error("Resource, startDate, and endDate are required");
  }

  const conflictingBookings = await Booking.find({
    resource: resourceId,
    status: { $in: ["Pending", "Approved"] },
    $or: [
      { startDate: { $lt: new Date(endDate), $gte: new Date(startDate) } },
      { endDate: { $lte: new Date(endDate), $gt: new Date(startDate) } },
      { startDate: { $lte: new Date(startDate) }, endDate: { $gte: new Date(endDate) } },
    ],
  });

  res.json({
    available: conflictingBookings.length === 0,
    conflictCount: conflictingBookings.length,
  });
});
