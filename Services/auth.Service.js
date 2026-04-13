import config from "../DB/ConfigDB.js";
import { pool } from "../DB/ConexionDB.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendResetEmail } from "../Utils/mailer.Util.js";

const JWT_TOKEN = config.jwtSecret;

export async function register({ names, first_last_name, second_last_name, email, password, role, profile_image_url }) {
  
  // 1. Validación solo para Gmail (Tu lógica original)
  const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
  if (!email || !gmailRegex.test(email)) {
    throw new Error("Solo se permiten correos de @gmail.com");
  }

  // 2. Validación de caracteres (Tu lógica original)
  if (!password || password.length < 8 || password.length > 20) {
    throw new Error("La contraseña debe tener entre 8 y 20 caracteres");
  }

  const [Existe] = await pool.query(
    "SELECT id FROM users WHERE email = ? LIMIT 1", 
    [email]);

  if (Existe.length > 0){
    throw new Error("El email ya esta registrado");
  }

  const hashPassword = await bcrypt.hash(password, 10); 

  // 3. Lógica de rol automático
  const finalRole = role ? role.toUpperCase() : "USER";
  
  // Usamos la URL que viene de Cloudinary o null si no hay
  const imageUrl = profile_image_url || null;

  try {
    const [result] = await pool.query(
        // Agregado 'profile_image_url' al INSERT
        "INSERT INTO users (names, first_last_name, second_last_name, email, password, role, profile_image_url) VALUES(?,?,?,?,?,?,?)",
        [names, first_last_name, second_last_name, email, hashPassword, finalRole, imageUrl]
    );

    return {
        id: result.insertId,
        names,
        email, 
        role: finalRole,
        profile_image_url: imageUrl
    };
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      throw new Error("El email ya existe");
    }
    throw error;
  }
}

export async function login({ email, password }) {
    if(!email) throw new Error("Ingrese su email");
    if(!password) throw new Error("Ingrese su contraseña");

    let query = `
    SELECT id, names, first_last_name, second_last_name, email, password, role 
    FROM users 
    WHERE email = ? 
    LIMIT 1
    `;
    const [row] = await pool.query(query, [email]);

    if (row.length === 0) throw new Error("Sin credenciales validas");

    const user = row[0];
    const passwordMatch = await bcrypt.compare(password, user.password); 

    if(!passwordMatch) throw new Error("Credenciales invalidas");

    const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role }, 
        JWT_TOKEN, 
        { expiresIn: "1h" }
    ); 

    return {
        token, 
        user: {
            id: user.id, 
            names: user.names, 
            first_last_name: user.first_last_name, 
            second_last_name: user.second_last_name, 
            email: user.email, 
            role: user.role
        }
    };
}

export async function forgotPassword(email) {
  if (!email) throw new Error("El email es obligatorio");

  const [user] = await pool.query(
    "SELECT id FROM users WHERE email = ? LIMIT 1",
    [email]
  );

  if (user.length === 0) {
    return { message: "Si el correo existe, se enviaron instrucciones" };
  }

  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expires = new Date(Date.now() + 15 * 60 * 1000);

  await pool.query(
    "UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE email = ?",
    [code, expires, email]
  );

  await sendResetEmail(email, code);
  return { message: "Código de verificación enviado al correo" };
}

export async function resetPassword({ token, newPassword }) {
  if (newPassword.length < 8 || newPassword.length > 20) {
    throw new Error("La contraseña debe tener entre 8 y 20 caracteres");
  }

  const [rows] = await pool.query(
    "SELECT id FROM users WHERE reset_token = ? AND reset_token_expires > NOW() LIMIT 1",
    [token]
  );

  if (rows.length === 0) throw new Error("Código inválido o expirado");

  const hashPassword = await bcrypt.hash(newPassword, 10);

  await pool.query(
    "UPDATE users SET password = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?",
    [hashPassword, rows[0].id]
  );

  return { message: "Contraseña actualizada correctamente" };
}