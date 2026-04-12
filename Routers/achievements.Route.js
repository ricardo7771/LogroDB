import express from "express";
import {
  getMyAchievements,
  getAllAchievements,
  createAchievement,
  patchAchievement,
  deleteAchievement
} from "../Controllers/achievements.Controller.js";

import { checkToken, checkRole } from "../Middleware/auth.middleware.js";

const router = express.Router();


router.get("/achievements/me", checkToken, getMyAchievements);
router.get("/achievements", checkToken, checkRole(["ADMIN"]), getAllAchievements);
router.post("/achievements/create", checkToken, createAchievement);
router.patch("/achievements/:id", checkToken, patchAchievement);
router.delete("/achievements/me", checkToken, deleteAchievement);
router.delete("/achievements/:id", checkRole(["ADMIN"]), checkToken, deleteAchievement);


export default router;