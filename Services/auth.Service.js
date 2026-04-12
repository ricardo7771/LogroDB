import config from "../DB/ConfigDB.js";
import {pool} from "../DB/ConexionDB.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
//import { sendResetEmail } from "../Utils/mailer.Util.js";
import { sendResetEmail } from "../Utils/mailer.Util.js";

const JWT_TOKEN = config.jwtSecret;

// ... (imports iguales)

export async function register({names, first_last_name, second_last_name, email, password, role}) {
  
  // 1. CAMBIO: Validación solo para Gmail
  const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
  if (!email || !gmailRegex.test(email)) {
    throw new Error("Solo se permiten correos de @gmail.com");
  }

  // 2. CAMBIO: Validación de caracteres (Mínimo 8 como pide el nuevo requisito)
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

  // 3. CAMBIO: Lógica de rol automático (Si no envían nada, es USER)
  const finalRole = role ? role.toUpperCase() : "USER";

  try {
    const [result] = await pool.query(
        // Agregado 'role' al INSERT
        "INSERT INTO users (names, first_last_name, second_last_name, email, password, role) VALUES(?,?,?,?,?,?)",
        [names, first_last_name, second_last_name, email, hashPassword, finalRole]
    )

    return {
        id: result.insertId,
        names,
        email, 
        role: finalRole
    }
// ... resto del código igual
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      throw new Error("El email ya existe");
    }
    throw error;
  }
}

export async function login({email, password}) {

    if(!email){
        throw new Error("Ingrese su email")
    }

    if(!password){
        throw new Error("Ingrese su contraseña")
    }

   let query = `
    SELECT id, names, first_last_name, second_last_name, email, password, role 
    FROM users 
    WHERE email = ? 
    LIMIT 1
  `;
    const [row] = await pool.query(query, [email]);

    if (row.length === 0){
        throw new Error("Sin credenciales validas")
    }

    const user = row[0];

    const passwordMatch = await bcrypt.compare(password, user.password); 

    if(!passwordMatch){
        throw new Error("Credenciales invalidas")
    }

    const token = jwt.sign(
        {
            id: user.id, 
            email: user.email, 
            role: user.role
        }, 
        JWT_TOKEN, 
        {expiresIn: "1h"}

    ); 

    return{
        token, 
        user: {
            id: user.id, 
            names: user.names, 
            first_last_name: user.first_last_name, 
            second_last_name: user.second_last_name, 
            email: user.email, 
            role: user.role
        }
    } 
}
// 1. Solicitar el código (POST)
export async function forgotPassword(email) {
  if (!email) throw new Error("El email es obligatorio");

  const [user] = await pool.query("SELECT id FROM users WHERE email = ? LIMIT 1", [email]);
  
  if (user.length === 0) {
    return { message: "Si el correo existe, se enviaron instrucciones" };
  }

  // GENERAR CÓDIGO DE 6 DÍGITOS (Ejemplo: 529401)
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  
  // EXPIRACIÓN CORTA (15 minutos es más seguro para códigos)
  const expires = new Date(Date.now() + 15 * 60 * 1000); 

  // Guardamos el código en la misma columna 'reset_token'
  await pool.query(
    "UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE email = ?",
    [code, expires, email]
  );

  // Enviamos el código por correo
  await sendResetEmail(email, code);

  return { message: "Código de verificación enviado al correo" };
}

// 2. Validar código y cambiar contraseña (PATCH)
export async function resetPassword({ token, newPassword }) {
  // El 'token' que recibe ahora es el código de 6 dígitos que el usuario escribe
  
  if (newPassword.length < 8 || newPassword.length > 20) {
    throw new Error("La contraseña debe tener entre 8 y 20 caracteres");
  }

  // Buscamos el código y que no haya expirado
  const [rows] = await pool.query(
    "SELECT id FROM users WHERE reset_token = ? AND reset_token_expires > NOW() LIMIT 1",
    [token]
  );

  if (rows.length === 0) {
    throw new Error("Código inválido o expirado");
  }

  const hashPassword = await bcrypt.hash(newPassword, 10);

  // Limpiamos el código de la BD para que no se use otra vez
  await pool.query(
    "UPDATE users SET password = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?",
    [hashPassword, rows[0].id]
  );

  return { message: "Contraseña actualizada correctamente" };
}

//pendiente a revicion
/*
export async function forgotPassword(email){
    if(!email){
      throw new Error("Se necesita un email para restablecer la contraseña");
    }

    const [rows] = await pool.query(
      `
      SELECT id FROM users WHERE email = ? LIMIT 1
      `,
      email
    ); 

    if(rows.length === 0){
      throw new Error("Si el correo existe, se enviaran instrucciones");
    }

    const token = crypto.randomBytes(32).toString("hex"); 
    const expires = new Date(Date.now() + 60 * 60 * 1000); 

    await pool.query(
    `UPDATE users 
     SET reset_token = ?, reset_token_expires = ?
     WHERE email = ?`,
    [token, expires, email]
    );

    await sendResetEmail(email, token);

  return {
    message: "Si el correo existe, se enviaron instrucciones",
    token
  };

}
*/
