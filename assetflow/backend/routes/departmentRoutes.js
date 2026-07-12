import express from "express";
import {
  getDepartments, createDepartment, updateDepartment, deleteDepartment,
  getCategories, createCategory, updateCategory, deleteCategory,
  getEmployees, updateEmployee,
} from "../controllers/departmentController.js";
import { protect, authorize } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.get("/departments", getDepartments);
router.post("/departments", authorize("Admin"), createDepartment);
router.put("/departments/:id", authorize("Admin"), updateDepartment);
router.delete("/departments/:id", authorize("Admin"), deleteDepartment);

router.get("/categories", getCategories);
router.post("/categories", authorize("Admin", "Asset Manager"), createCategory);
router.put("/categories/:id", authorize("Admin", "Asset Manager"), updateCategory);
router.delete("/categories/:id", authorize("Admin", "Asset Manager"), deleteCategory);

router.get("/employees", getEmployees);
router.put("/employees/:id", authorize("Admin"), updateEmployee);

export default router;
