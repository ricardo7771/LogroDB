import { pool } from "../DB/ConexionDB.js";

export async function getMyAchievements(user_id) {
  const [rows] = await pool.query(
    `
    SELECT id, title, description, user_id, achieved_at, achievement_type, created_at, updated_at
    FROM achievements
    WHERE user_id = ?
    ORDER BY created_at DESC
    `,
    [user_id]
  );

  return rows;
}

export async function getAllAchievements({
  page = 1,
  limit = 10,
  search = null
}) {

  const offset = (page - 1) * limit;

  let where = "";
  let params = [];

  // 🔍 SEARCH por título
  if (search && search.trim() !== "") {
    where = "WHERE a.title LIKE ?";
    params.push(`%${search}%`);
  }

  // 🔹 DATA
  const [rows] = await pool.query(
    `
    SELECT 
      a.id,
      a.title,
      a.description,
      a.achieved_at,
      a.achievement_type,
      a.created_at,
      a.updated_at,
      u.id AS user_id,
      u.names,
      u.first_last_name,
      u.second_last_name,
      u.email
    FROM achievements a
    JOIN users u ON a.user_id = u.id
    ${where}
    ORDER BY a.created_at DESC
    LIMIT ? OFFSET ?
    `,
    [...params, Number(limit), Number(offset)]
  );

  // 🔹 TOTAL
  const [[{ total }]] = await pool.query(
    `
    SELECT COUNT(*) AS total
    FROM achievements a
    ${where}
    `,
    params
  );

  // 🔹 FORMATO
  const formatted = rows.map(row => ({
    achievement: {
      id: row.id,
      title: row.title,
      description: row.description,
      achieved_at: row.achieved_at,
      achievement_type: row.achievement_type,
      created_at: row.created_at,
      updated_at: row.updated_at
    },
    user: {
      id: row.user_id,
      names: row.names,
      first_last_name: row.first_last_name,
      second_last_name: row.second_last_name,
      email: row.email
    }
  }));

  return {
    data: formatted,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  };
}

export async function createAchievement(title, description, achieved_at, achievement_type, user_id) {

  if (!title) {
    throw new Error("El título es requerido");
  }

  const [result] = await pool.query(
    `
    INSERT INTO achievements (title, description, achieved_at, achievement_type, user_id)
    VALUES (?, ?, ?, ?, ?)
    `,
    [title, description, achieved_at, achievement_type || "PERSONAL", user_id]
  );

  return {
    id: result.insertId,
    title,
    description,
    achieved_at,
    achievement_type: achievement_type || "PERSONAL",
    user_id
  };
}

export async function patchAchievement(id, data, user) {
  const fields = [];
  const values = [];

  const camposPermitidos = ["title", "description", "achieved_at", "achievement_type"];

  camposPermitidos.forEach(campo => {
    if (data[campo] !== undefined) {
      fields.push(`${campo} = ?`);
      values.push(data[campo]);
    }
  });

  if (fields.length === 0) {
    throw new Error("No hay campos para actualizar");
  }

  let query = `
    UPDATE achievements 
    SET ${fields.join(", ")} 
    WHERE id = ? AND user_id = ?
  `;

  values.push(id, user.id);

  const [result] = await pool.query(query, values);

  if (result.affectedRows === 0) {
    throw new Error("Logro no encontrado o sin permisos");
  }

  return { message: "Logro actualizado correctamente" };
}


export async function deleteAchievement(id, user) {
  let query = "DELETE FROM achievements WHERE id = ?";
  let params = [id];

  if (user.role !== "ADMIN") {
    query += " AND user_id = ?";
    params.push(user.id);
  }

  const [result] = await pool.query(query, params);

  if (result.affectedRows === 0) {
    throw new Error("Logro no encontrado o sin permisos");
  }

  return { message: "Logro eliminado correctamente" };
}