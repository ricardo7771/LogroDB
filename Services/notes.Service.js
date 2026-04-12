import { pool } from "../DB/ConexionDB.js";

const NOTE_TYPES = ["NOTA", "APUNTE"];

export async function getMyNotes(user_id) {
  const [rows] = await pool.query(
    `
    SELECT id, title, note_type, content, user_id, created_at, updated_at 
    FROM notes
    WHERE user_id = ?
    `,
    [user_id]
  );

  return rows;
}

export async function getAllNotes({
  page = 1,
  limit = 10,
  search = null
}) {

  const offset = (page - 1) * limit;

  let where = "";
  let params = [];

  // 🔍 SEARCH por título
  if (search) {
    where = "WHERE n.title LIKE ?";
    params.push(`%${search}%`);
  }

  // 🔹 DATA
  const [rows] = await pool.query(
    `
    SELECT 
      n.id,
      n.title,
      n.note_type,
      n.content,
      n.created_at,
      n.updated_at,
      u.id AS user_id,
      u.names,
      u.first_last_name,
      u.second_last_name,
      u.email
    FROM notes n
    JOIN users u ON n.user_id = u.id
    ${where}
    ORDER BY n.created_at DESC
    LIMIT ? OFFSET ?
    `,
    [...params, Number(limit), Number(offset)]
  );

  // 🔹 TOTAL
  const [[{ total }]] = await pool.query(
    `
    SELECT COUNT(*) AS total
    FROM notes n
    ${where}
    `,
    params
  );

  // 🔹 FORMATO
  const formatted = rows.map(row => ({
    content: {
      id: row.id,
      title: row.title,
      note_type: row.note_type,
      content: row.content,
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

export async function createNotes(title, note_type, content, user_id) {

  if (!title) {
    throw new Error("El título es requerido");
  }

  if (note_type && !NOTE_TYPES.includes(note_type)) {
    throw new Error("Tipo de nota inválido");
  }

  const [result] = await pool.query(
    `
    INSERT INTO notes (title, note_type, content, user_id) VALUES(?,?,?,?)
    `,
    [
      title,
      note_type || "NOTA", 
      content,
      user_id
    ]
  );

  return {
    id: result.insertId,
    title,
    note_type: note_type || "NOTA",
    content,
    user_id
  };
}

export async function patchNotes(id, data, user) {
  const fields = [];
  const values = [];

  const camposPermitidos = ["title", "note_type", "content"];

  camposPermitidos.forEach(campo => {
    if (data[campo] !== undefined) {

      // 🔥 VALIDACIÓN ENUM
      if (campo === "note_type" && !NOTE_TYPES.includes(data[campo])) {
        throw new Error("Tipo de nota inválido");
      }

      fields.push(`${campo} = ?`);
      values.push(data[campo]);
    }
  });

  if (fields.length === 0) {
    throw new Error("No hay campos para actualizar");
  }

  let query = `
    UPDATE notes 
    SET ${fields.join(", ")} 
    WHERE id = ? AND user_id = ?
  `;

  values.push(id, user.id);

  const [result] = await pool.query(query, values);

  if (result.affectedRows === 0) {
    throw new Error("Nota no encontrada o sin permisos");
  }

  return { message: "Nota actualizada correctamente" };
}

export async function deleteNotes(id, user) {
  let query = "DELETE FROM notes WHERE id = ?";
  let params = [id];

  if (user.role !== "ADMIN") {
    query += " AND user_id = ?";
    params.push(user.id);
  }

  const [result] = await pool.query(query, params);

  if (result.affectedRows === 0) {
    throw new Error("Nota no encontrada o sin permisos");
  }

  return { message: "Nota eliminada correctamente" };
}
