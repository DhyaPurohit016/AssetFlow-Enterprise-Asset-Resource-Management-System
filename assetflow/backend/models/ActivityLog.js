import mongoose from "mongoose";

const activityLogSchema = new mongoose.Schema(
  {
    actor: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    action: { type: String, required: true }, // e.g. "asset.allocated", "maintenance.raised"
    message: { type: String, required: true }, // human readable, e.g. "Laptop AF-0114 allocated to Priya Shah"
    entityType: { type: String, default: "" }, // "Asset", "Allocation", "Maintenance"
    entityId: { type: mongoose.Schema.Types.ObjectId, default: null },
    category: {
      type: String,
      enum: ["Alert", "Approval", "Booking", "Audit", "General"],
      default: "General",
    },
  },
  { timestamps: true }
);

export default mongoose.model("ActivityLog", activityLogSchema);
