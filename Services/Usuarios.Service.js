import {pool} from "../DB/ConexionDB.js";

export async function getMyUser(id) {

  const [rows] = await pool.query(
    `
    SELECT id, names, first_last_name, second_last_name,
           email, role, created_at, updated_at, profile_image_url
    FROM users
    WHERE id = ?
    `,
    [id]
  );

  if (rows.length === 0) {
    throw new Error("Usuario no encontrado");
  }

  return rows[0];
}

export async function getAllUsers({ page = 1, limit = 20, search = null }) {
  const offset = (page - 1) * limit;
  let params = [];
  let whereSQL = "";

  // 4. CAMBIO: Búsqueda automática en Nombres o Apellidos (Buscador inteligente)
  if (search) {
    whereSQL = `WHERE (names LIKE ? OR first_last_name LIKE ? OR second_last_name LIKE ? OR email LIKE ?)`;
    const s = `%${search}%`;
    params.push(s, s, s, s);
  }

  const [rows] = await pool.query(
    `SELECT id, names, first_last_name, second_last_name, email, role, profile_image_url, created_at 
     FROM users ${whereSQL} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    [...params, Number(limit), Number(offset)]
  );

  // 🔹 count
  const [[{ Total }]] = await pool.query(
    `
    SELECT COUNT(*) AS Total
    FROM users
    ${whereSQL}
    `,
    params
  );

  return {
    data: rows,
    pagination: {
      Total,
      page,
      limit,
      totalPages: Math.ceil(Total / limit)
    }
  };
}

export async function patchUserProfile(id, data) {
  const fields = []; 
  const values = []; 

  // 5. CAMBIO: Se agrega profile_image_url para el link de Cloudinary
  const camposPermitidos = ['names', 'first_last_name', 'second_last_name', 'profile_image_url'];

  camposPermitidos.forEach(campo => {
    if (data[campo] !== undefined) {
      fields.push(`${campo} = ?`);
      values.push(data[campo]);
    }
  });

  if (fields.length === 0) throw new Error("No hay campos para actualizar");

  values.push(id); 
  const query = `UPDATE users SET ${fields.join(", ")} WHERE id = ?`;
  await pool.query(query, values); 

  return { message: "Perfil actualizado correctamente" }; 
}

export async function patchUserAdmin(id, data) {

  const fields = []; 
  const values = []; 

  if (data.names !== undefined) {
    fields.push("names = ?"); 
    values.push(data.names); 
  }

  if (data.first_last_name !== undefined) {
    fields.push("first_last_name = ?"); 
    values.push(data.first_last_name); 
  }

  if (data.second_last_name !== undefined) {
    fields.push("second_last_name = ?"); 
    values.push(data.second_last_name); 
  }

  if (data.role !== undefined) {
    fields.push("role = ?"); 
    values.push(data.role); 
  }

  if (fields.length === 0) {
    throw new Error("No hay campos para actualizar"); 
  }

  values.push(id); 

  const query = `
    UPDATE users 
    SET ${fields.join(", ")} 
    WHERE id = ?
  `;

  await pool.query(query, values); 

  return { message: "Usuario actualizado correctamente" }; 
}


export async function deleteMyUser(id) {

  const [user] = await pool.query(
    "SELECT id FROM users WHERE id = ?",
    [id]
  );

  if (user.length === 0) {
    throw new Error("Usuario no encontrado");
  }

  await pool.query(
    "DELETE FROM users WHERE id = ?",
    [id]
  );

  return { message: "Cuenta eliminada correctamente" };
}

export async function deleteUserAdmin(id) {

  const [user] = await pool.query(
    "SELECT id FROM users WHERE id = ?",
    [id]
  );

  if (user.length === 0) {
    throw new Error("Usuario no encontrado");
  }

  await pool.query(
    "DELETE FROM users WHERE id = ?",
    [id]
  );

  return { message: "Usuario eliminado correctamente" };
}