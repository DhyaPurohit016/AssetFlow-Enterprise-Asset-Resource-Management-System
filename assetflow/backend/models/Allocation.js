import mongoose from "mongoose";

const allocationSchema = new mongoose.Schema(
  {
    asset: { type: mongoose.Schema.Types.ObjectId, ref: "Asset", required: true },
    allocatedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    allocatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    department: { type: mongoose.Schema.Types.ObjectId, ref: "Department", default: null },

    type: {
      type: String,
      enum: ["Allocation", "Transfer", "Return"],
      default: "Allocation",
    },

    // For transfers: who it's moving from/to
    transferFrom: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    transferTo: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    transferReason: { type: String, default: "" },

    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected", "Active", "Returned"],
      default: "Active",
    },

    conditionAtAllocation: { type: String, default: "" },
    conditionAtReturn: { type: String, default: "" },

    dueDate: { type: Date, default: null }, // for overdue detection
    returnedAt: { type: Date, default: null },

    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true }
);

export default mongoose.model("Allocation", allocationSchema);
