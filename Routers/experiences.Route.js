import express from "express";
import {
  getMyExperiences,
  getAllExperiences,
  createExperience,
  patchExperience,
  deleteExperience
} from "../Controllers/experiences.Controller.js";

import { checkToken, checkRole } from "../Middleware/auth.middleware.js";

const router = express.Router();

// USER
router.get("/experiences/me", checkToken, getMyExperiences);
router.get("/experiences", checkToken, checkRole(["ADMIN"]), getAllExperiences);
router.post("/experiences/create", checkToken, createExperience);
router.patch("/experiences/:id", checkToken, patchExperience);
router.delete("/experiences/me", checkToken, deleteExperience);
router.delete("/experiences/:id", checkRole(["ADMIN"]), checkToken, deleteExperience);


export default router;