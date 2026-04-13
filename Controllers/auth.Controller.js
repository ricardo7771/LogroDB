import * as authService from '../Services/auth.Service.js'; 
import { uploadToCloudinary } from '../Utils/cloudinari.js';

export async function register(req, res) {
    try {
        const { names, first_last_name, second_last_name, email, password, role } = req.body;

        // Validación de creación de ADMIN (Tu lógica original)
        if (role === "ADMIN") {
            if (!req.user || req.user.role !== "ADMIN") {
                return res.status(403).json({
                    error: "No tienes permisos para crear un ADMIN"
                });
            }
        }

        // --- NUEVO: Procesamiento de Imagen para Cloudinary ---
        let profile_image_url = null;
        if (req.file) {
            profile_image_url = await uploadToCloudinary(req.file.buffer);
        }
        // -----------------------------------------------------

        const user = await authService.register({
            names, 
            first_last_name, 
            second_last_name, 
            email,
            password,
            role,
            profile_image_url // Pasamos la URL al service
        });

        return res.status(201).json({
            message: "Usuario creado exitosamente", 
            user
        });
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
}

export async function login(req, res) {
    try {
        const { email, password } = req.body; 
        const data = await authService.login({ email, password });
        return res.status(200).json(data); 
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
}

export async function forgotPassword(req, res) {
  try {
    const { email } = req.body;
    const data = await authService.forgotPassword(email);
    return res.status(200).json(data);
  } catch (error) {
    if (error.message === "El email es obligatorio") {
      return res.status(400).json({ error: error.message });
    }
    return res.status(500).json({ error: "Error al procesar la solicitud" });
  }
}

export async function resetPassword(req, res) {
    try {
        const { token, newPassword, confirmPassword } = req.body;

        if (newPassword !== confirmPassword) {
            return res.status(400).json({ error: "Las contraseñas no coinciden" });
        }

        const result = await authService.resetPassword({ token, newPassword });
        return res.status(200).json(result);
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
}