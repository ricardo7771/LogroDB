import { v2 as cloudinary } from 'cloudinary';
import config from '../DB/ConfigDB.js'; // Asegúrate de tener estas variables en tu .env

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export const uploadToCloudinary = async (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: 'user_profiles' }, // Se guardarán en esta carpeta
      (error, result) => {
        if (error) reject(error);
        else resolve(result.secure_url); // Nos devuelve el link HTTPS
      }
    );
    uploadStream.end(fileBuffer);
  });
};