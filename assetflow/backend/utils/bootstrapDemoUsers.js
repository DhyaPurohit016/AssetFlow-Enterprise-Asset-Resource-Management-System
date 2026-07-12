import User from "../models/User.js";

const demoUsers = [
  {
    name: "Admin User",
    email: "admin@assetflow.com",
    password: "admin123",
    role: "Admin",
  },
  {
    name: "Rohan Mehta",
    email: "manager@assetflow.com",
    password: "manager123",
    role: "Asset Manager",
  },
  {
    name: "Priya Shah",
    email: "priya@assetflow.com",
    password: "employee123",
    role: "Employee",
  },
];

// Adds any missing documented demo credentials in development.
// Unlike the full seed script, this never deletes or replaces existing records.
const bootstrapDemoUsers = async () => {
  const existingEmails = await User.find({
    email: { $in: demoUsers.map((user) => user.email) },
  }).distinct("email");
  const existing = new Set(existingEmails);
  const missingUsers = demoUsers.filter((user) => !existing.has(user.email));

  if (missingUsers.length === 0) return;

  await Promise.all(missingUsers.map((user) => User.create(user)));
  console.log("Created missing demo users. Log in with admin@assetflow.com / admin123");
};

export default bootstrapDemoUsers;
