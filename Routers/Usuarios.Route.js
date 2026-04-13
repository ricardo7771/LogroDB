import express from "express"; 
import {
  getMyUser,
  getAllUsers,
  patchMyUser,
  patchUserByAdmin,
  deleteMyUser,
  deleteUserByAdmin
} from "../Controllers/Usuarios.Controller.js";

import { checkRole, checkToken } from "../Middleware/auth.middleware.js";
// 1. Importamos el middleware de Multer que configuraste
import { upload } from "../Middleware/cloudinary.middleware.js"; 

const router = express.Router(); 

// 👤 USER (propio)
router.get("/users/me", checkToken, getMyUser);

// 2. Agregamos 'upload.single("image")' antes del controlador
// Esto permite que el controlador reciba 'req.file'
router.patch("/users/me", checkToken, upload.single("image"), patchMyUser);

router.delete("/users/me", checkToken, deleteMyUser);

// 🛠 ADMIN
router.get("/users", checkToken, checkRole(["ADMIN"]), getAllUsers);
router.patch("/users/:id", checkToken, checkRole(["ADMIN"]), patchUserByAdmin);
router.delete("/users/:id", checkToken, checkRole(["ADMIN"]), deleteUserByAdmin);

export default router;