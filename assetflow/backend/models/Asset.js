import mongoose from "mongoose";

const assetSchema = new mongoose.Schema(
  {
    assetTag: { type: String, required: true, unique: true }, // e.g. AF-0012, auto generated
    name: { type: String, required: true, trim: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
    serialNumber: { type: String, trim: true },
    condition: {
      type: String,
      enum: ["New", "Good", "Fair", "Damaged"],
      default: "New",
    },
    lifecycleStatus: {
      type: String,
      enum: ["Available", "Allocated", "Under Maintenance", "Retired"],
      default: "Available",
    },
    purchaseDate: { type: Date },
    warrantyExpiry: { type: Date },
    location: { type: String, default: "" },
    department: { type: mongoose.Schema.Types.ObjectId, ref: "Department", default: null },
    currentHolder: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    images: [{ type: String }],
    documents: [{ type: String }],
    qrCodeUrl: { type: String, default: "" },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

assetSchema.index({ name: "text", assetTag: "text", serialNumber: "text" });

export default mongoose.model("Asset", assetSchema);
