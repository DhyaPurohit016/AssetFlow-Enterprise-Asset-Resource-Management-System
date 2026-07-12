import express from "express";
import * as bookingController from "../controllers/bookingController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(protect);

// Create booking
router.post("/", bookingController.createBooking);

// Get all bookings
router.get("/", bookingController.getBookings);

// Check availability
router.get("/check-availability", bookingController.checkAvailability);

// Get single booking
router.get("/:id", bookingController.getBooking);

// Update booking status
router.patch("/:id/status", bookingController.updateBookingStatus);

// Delete booking
router.delete("/:id", bookingController.deleteBooking);

export default router;
