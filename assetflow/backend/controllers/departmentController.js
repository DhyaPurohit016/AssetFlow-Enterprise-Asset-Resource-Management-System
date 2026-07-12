import Department from "../models/Department.js";
import Category from "../models/Category.js";
import User from "../models/User.js";
import { asyncHandler } from "../middlewares/errorMiddleware.js";

// ---------- Departments ----------

export const getDepartments = asyncHandler(async (req, res) => {
  const departments = await Department.find()
    .populate("head", "name email")
    .populate("parentDepartment", "name")
    .sort({ name: 1 });
  res.json(departments);
});

export const createDepartment = asyncHandler(async (req, res) => {
  const { name, head, parentDepartment } = req.body;
  const department = await Department.create({ name, head: head || null, parentDepartment: parentDepartment || null });
  res.status(201).json(department);
});

export const updateDepartment = asyncHandler(async (req, res) => {
  const department = await Department.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!department) {
    res.status(404);
    throw new Error("Department not found");
  }
  res.json(department);
});

export const deleteDepartment = asyncHandler(async (req, res) => {
  const department = await Department.findByIdAndDelete(req.params.id);
  if (!department) {
    res.status(404);
    throw new Error("Department not found");
  }
  res.json({ message: "Department removed" });
});

// ---------- Categories ----------

export const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find().sort({ name: 1 });
  res.json(categories);
});

export const createCategory = asyncHandler(async (req, res) => {
  const { name, prefix, description } = req.body;
  const category = await Category.create({ name, prefix, description });
  res.status(201).json(category);
});

export const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!category) {
    res.status(404);
    throw new Error("Category not found");
  }
  res.json(category);
});

export const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findByIdAndDelete(req.params.id);
  if (!category) {
    res.status(404);
    throw new Error("Category not found");
  }
  res.json({ message: "Category removed" });
});

// ---------- Employee Directory ----------

export const getEmployees = asyncHandler(async (req, res) => {
  const employees = await User.find().populate("department", "name").select("-password").sort({ name: 1 });
  res.json(employees);
});

export const updateEmployee = asyncHandler(async (req, res) => {
  // Only Admin should be able to change role - enforced via route middleware
  const { name, department, designation, status, role } = req.body;
  const employee = await User.findByIdAndUpdate(
    req.params.id,
    { name, department, designation, status, ...(role ? { role } : {}) },
    { new: true, runValidators: true }
  ).select("-password");

  if (!employee) {
    res.status(404);
    throw new Error("Employee not found");
  }
  res.json(employee);
});
