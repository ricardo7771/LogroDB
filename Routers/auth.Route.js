import express from "express"; 
import { login, register, forgotPassword, resetPassword } from "../Controllers/auth.Controller.js";
import { upload } from "../Middleware/cloudinary.middleware.js"; // Middleware de Multer

const router = express.Router(); 

// El registro ahora acepta una imagen
router.post("/register", upload.single("image"), register); 
router.post("/login", login); 
router.post("/forgot-password", forgotPassword); 
router.patch("/reset-password", resetPassword); 

export default router;