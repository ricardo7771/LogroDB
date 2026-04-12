import express from "express";
import {
  getMyTasks,
  getAllTasks,
  createTask,
  patchTask,
  deleteTask
} from "../Controllers/tasks.Controller.js";

import { checkToken, checkRole } from "../Middleware/auth.middleware.js";

const router = express.Router();

// USER
router.get("/tasks/me", checkToken, getMyTasks);
router.get("/tasks", checkToken, checkRole(["ADMIN"]), getAllTasks);
router.post("/tasks/create", checkToken, createTask);
router.patch("/tasks/:id", checkToken, patchTask);
router.delete("/tasks/me", checkToken, deleteTask);
router.delete("/tasks/:id", checkRole(["ADMIN"]), checkToken, deleteTask);



export default router;