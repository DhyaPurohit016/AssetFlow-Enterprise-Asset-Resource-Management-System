import dotenv from "dotenv";
import connectDB from "../config/db.js";
import User from "../models/User.js";
import Department from "../models/Department.js";
import Category from "../models/Category.js";
import Asset from "../models/Asset.js";
import Allocation from "../models/Allocation.js";
import Maintenance from "../models/Maintenance.js";
import ActivityLog from "../models/ActivityLog.js";


dotenv.config();

console.log("Starting seed script...");

const run = async () => {
  await connectDB();
  console.log("Clearing existing data...");
  await Promise.all([
    User.deleteMany(), Department.deleteMany(), Category.deleteMany(),
    Asset.deleteMany(), Allocation.deleteMany(), Maintenance.deleteMany(), ActivityLog.deleteMany(),
  ]);

  console.log("Seeding departments...");
  const engineering = await Department.create({ name: "Engineering" });
  const facilities = await Department.create({ name: "Facilities" });
  const fieldOps = await Department.create({ name: "Field Ops" });

  console.log("Seeding categories...");
  const laptop = await Category.create({ name: "Laptop", prefix: "LT" });
  const projector = await Category.create({ name: "Projector", prefix: "PJ" });
  const chair = await Category.create({ name: "Office Chair", prefix: "CH" });
  const monitor = await Category.create({ name: "Monitor", prefix: "MN" });

  console.log("Seeding users...");
  const admin = await User.create({
    name: "Admin User", email: "admin@assetflow.com", password: "admin123",
    role: "Admin", department: engineering._id, status: "Active",
  });
  const manager = await User.create({
    name: "Rohan Mehta", email: "manager@assetflow.com", password: "manager123",
    role: "Asset Manager", department: engineering._id, status: "Active",
  });
  const priya = await User.create({
    name: "Priya Shah", email: "priya@assetflow.com", password: "employee123",
    role: "Employee", department: engineering._id, status: "Active",
  });
  const arjun = await User.create({
    name: "Arjun Nair", email: "arjun@assetflow.com", password: "employee123",
    role: "Employee", department: fieldOps._id, status: "Active",
  });

  engineering.head = manager._id;
  await engineering.save();

  console.log("Seeding assets...");
  const laptop1 = await Asset.create({
    assetTag: "AF-0114", name: "Dell Latitude 5420", category: laptop._id,
    serialNumber: "DL5420-2291", condition: "Good", lifecycleStatus: "Allocated",
    purchaseDate: new Date("2023-02-10"), warrantyExpiry: new Date("2026-02-10"),
    location: "Bangalore HQ", department: engineering._id, currentHolder: priya._id,
    qrCodeUrl: `${process.env.CLIENT_URL || "http://localhost:5173"}/assets/tag/AF-0114`,
  });
  const projector1 = await Asset.create({
    assetTag: "AF-0062", name: "Projector", category: projector._id,
    serialNumber: "EPX-7742", condition: "Fair", lifecycleStatus: "Under Maintenance",
    purchaseDate: new Date("2022-06-01"), location: "4th Floor Meeting Room",
    department: facilities._id,
    qrCodeUrl: `${process.env.CLIENT_URL || "http://localhost:5173"}/assets/tag/AF-0062`,
  });
  const chair1 = await Asset.create({
    assetTag: "AF-0201", name: "Office Chair", category: chair._id,
    serialNumber: "ERG-1090", condition: "New", lifecycleStatus: "Available",
    purchaseDate: new Date("2024-01-15"), location: "Warehouse",
    qrCodeUrl: `${process.env.CLIENT_URL || "http://localhost:5173"}/assets/tag/AF-0201`,
  });
  const monitor1 = await Asset.create({
    assetTag: "AF-0343", name: "Dell 24-inch Monitor", category: monitor._id,
    serialNumber: "MN2299-01", condition: "Good", lifecycleStatus: "Available",
    purchaseDate: new Date("2023-09-01"), location: "Bangalore HQ",
    qrCodeUrl: `${process.env.CLIENT_URL || "http://localhost:5173"}/assets/tag/AF-0343`,
  });

  console.log("Seeding allocation + transfer history...");
  await Allocation.create({
    asset: laptop1._id, allocatedTo: priya._id, allocatedBy: manager._id,
    department: engineering._id, type: "Allocation", status: "Active",
    conditionAtAllocation: "Good", dueDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
  });
  await Allocation.create({
    asset: laptop1._id, allocatedTo: arjun._id, allocatedBy: manager._id,
    type: "Transfer", transferFrom: priya._id, transferTo: arjun._id,
    transferReason: "Priya Shah is moving to Engineering department",
    status: "Pending",
  });

  console.log("Seeding maintenance requests (kanban)...");
  await Maintenance.create({
    asset: projector1._id, raisedBy: manager._id, issue: "Bulb flickering, needs replacement",
    priority: "High", status: "Technician Assigned", technicianName: "R. Kumar",
  });
  await Maintenance.create({
    asset: monitor1._id, raisedBy: priya._id, issue: "Screen has a dead pixel cluster",
    priority: "Low", status: "Pending",
  });

  console.log("Seeding activity feed...");
  await ActivityLog.create([
    { actor: manager._id, action: "asset.allocated", message: "Laptop AF-0114 allocated to Priya Shah", category: "Approval" },
    { actor: priya._id, action: "booking.confirmed", message: "Room B2 booking confirmed - 2:00 to 3:00 PM", category: "Booking" },
    { actor: manager._id, action: "maintenance.status_changed", message: "Projector AF-0062 maintenance request opened", category: "Alert" },
  ]);

  console.log("\nSeed complete. Demo logins:");
  console.log("  Admin:          admin@assetflow.com / admin123");
  console.log("  Asset Manager:  manager@assetflow.com / manager123");
  console.log("  Employee:       priya@assetflow.com / employee123");
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
