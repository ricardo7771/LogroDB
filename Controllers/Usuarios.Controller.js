import * as UserService from '../Services/Usuarios.Service.js';
import { uploadToCloudinary } from '../Utils/cloudinari.js'; // Importamos tu utilidad de Cloudinary

export async function getMyUser(req, res) {
  try {
    const id = req.user.id;
    const user = await UserService.getMyUser(id);
    return res.status(200).json(user);
  } catch (error) {
    return res.status(404).json({ error: error.message });
  }
}

export async function getAllUsers(req, res) {
  try {
    const { page, limit, role, search } = req.query;

    const pageNumber = parseInt(page, 10) || 1;
    const limitNumber = Math.min(parseInt(limit, 10) || 20, 100);

    const users = await UserService.getAllUsers({
      page: pageNumber,
      limit: limitNumber,
      role,
      search
    });

    return res.status(200).json(users);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
}

// AQUÍ INTEGRAMOS CLOUDINARY
export async function patchMyUser(req, res) {
  try {
    const id = req.user.id; 
    const data = { ...req.body };

    // Si Multer capturó una imagen (vía req.file)
    if (req.file) {
      // 1. Subimos la imagen a la nube
      const imageUrl = await uploadToCloudinary(req.file.buffer);
      // 2. Agregamos el link al objeto de datos para el Service
      data.profile_image_url = imageUrl;
    }

    const result = await UserService.patchUserProfile(id, data);

    return res.status(200).json({
      ...result,
      profile_image_url: data.profile_image_url || null
    });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

export async function patchUserByAdmin(req, res) {
  try {
    const { id } = req.params;
    const data = { ...req.body };

    const result = await UserService.patchUserAdmin(id, data);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

export async function deleteMyUser(req, res) {
  try {
    const id = req.user.id;
    const result = await UserService.deleteMyUser(id);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

export async function deleteUserByAdmin(req, res) {
  try {
    const { id } = req.params;
    const result = await UserService.deleteUserAdmin(id);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}