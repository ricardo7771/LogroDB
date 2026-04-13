import multer from 'multer';

// Configuramos para que la imagen no se guarde en el disco, sino en la RAM (más rápido)
const storage = multer.memoryStorage();

// Filtro opcional: Solo aceptar imágenes
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('El archivo no es una imagen válida'), false);
  }
};

export const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Límite de 5MB
  fileFilter
});