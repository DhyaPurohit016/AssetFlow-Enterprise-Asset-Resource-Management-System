import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      enum: ["booking", "allocation", "maintenance", "audit", "asset_update"],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    relatedEntity: {
      entityType: { type: String, default: null },
      entityId: { type: mongoose.Schema.Types.ObjectId, default: null },
    },
    isRead: { type: Boolean, default: false },
    readAt: { type: Date, default: null },
    actionUrl: { type: String, default: null },
  },
  { timestamps: true }
);

// Index for efficient querying
notificationSchema.index({ recipient: 1, isRead: 1 });
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ createdAt: -1 });

export default mongoose.model("Notification", notificationSchema);
