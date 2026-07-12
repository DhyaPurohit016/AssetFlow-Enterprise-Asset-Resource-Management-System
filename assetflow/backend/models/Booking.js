import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    resource: { type: mongoose.Schema.Types.ObjectId, ref: "Asset", required: true },
    bookedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    purpose: { type: String, required: true },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected", "Completed", "Cancelled"],
      default: "Pending",
    },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    rejectionReason: { type: String, default: null },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

// Index for efficient querying
bookingSchema.index({ resource: 1, startDate: 1, endDate: 1 });
bookingSchema.index({ bookedBy: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ createdAt: -1 });

export default mongoose.model("Booking", bookingSchema);
