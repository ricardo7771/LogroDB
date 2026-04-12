import { pool } from "../DB/ConexionDB.js";


// 🔹 GET MIS EXPERIENCIAS (USER)
export async function getMyExperiences(user_id) {
  const [rows] = await pool.query(
    `
    SELECT id, company, position, description, user_id, start_date, end_date, created_at, updated_at
    FROM experiences
    WHERE user_id = ?
    ORDER BY created_at DESC
    `,
    [user_id]
  );

  return rows;
}


// 🔹 GET TODAS LAS EXPERIENCIAS (ADMIN)
export async function getAllExperiences() {
  const [rows] = await pool.query(`
    SELECT 
      e.id,
      e.company,
      e.position,
      e.description,
      e.start_date,
      e.end_date,
      e.created_at,
      e.updated_at,
      u.id AS user_id,
      u.names,
      u.first_last_name,
      u.second_last_name,
      u.email
    FROM experiences e
    JOIN users u ON e.user_id = u.id
    ORDER BY e.created_at DESC
  `);

  const formatted = rows.map(row => ({
    experience: {
      id: row.id,
      company: row.company,
      position: row.position,
      description: row.description,
      start_date: row.start_date,
      end_date: row.end_date,
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

  return formatted;
}


// 🔹 CREATE EXPERIENCE (USER)
export async function createExperience(
  company,
  position,
  description,
  start_date,
  end_date,
  user_id
) {
  // validación básica
  if (!company && !position) {
    throw new Error("Debe proporcionar al menos empresa o puesto");
  }

  if (start_date && end_date && start_date > end_date) {
    throw new Error("La fecha de inicio no puede ser mayor a la fecha de fin");
  }

  const [result] = await pool.query(
    `
    INSERT INTO experiences (company, position, description, start_date, end_date, user_id)
    VALUES (?, ?, ?, ?, ?, ?)
    `,
    [company, position, description, start_date, end_date, user_id]
  );

  return {
    id: result.insertId,
    company,
    position,
    description,
    start_date,
    end_date,
    user_id
  };
}


// 🔹 PATCH EXPERIENCE (SOLO USER)
export async function patchExperience(id, data, user) {
  const fields = [];
  const values = [];

  const camposPermitidos = [
    "company",
    "position",
    "description",
    "start_date",
    "end_date"
  ];

  camposPermitidos.forEach(campo => {
    if (data[campo] !== undefined) {
      fields.push(`${campo} = ?`);
      values.push(data[campo]);
    }
  });

  if (fields.length === 0) {
    throw new Error("No hay campos para actualizar");
  }

  // validación de fechas
  if (data.start_date && data.end_date && data.start_date > data.end_date) {
    throw new Error("La fecha de inicio no puede ser mayor a la fecha de fin");
  }

  let query = `
    UPDATE experiences 
    SET ${fields.join(", ")} 
    WHERE id = ? AND user_id = ?
  `;

  values.push(id, user.id);

  const [result] = await pool.query(query, values);

  if (result.affectedRows === 0) {
    throw new Error("Experiencia no encontrada o sin permisos");
  }

  return { message: "Experiencia actualizada correctamente" };
}


// 🔹 DELETE EXPERIENCE (USER + ADMIN)
export async function deleteExperience(id, user) {
  let query = "DELETE FROM experiences WHERE id = ?";
  let params = [id];

  if (user.role !== "ADMIN") {
    query += " AND user_id = ?";
    params.push(user.id);
  }

  const [result] = await pool.query(query, params);

  if (result.affectedRows === 0) {
    throw new Error("Experiencia no encontrada o sin permisos");
  }

  return { message: "Experiencia eliminada correctamente" };
}