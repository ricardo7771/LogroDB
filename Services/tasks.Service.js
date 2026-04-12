import { pool } from "../DB/ConexionDB.js";


// 🔹 GET MIS TASKS (USER)
export async function getMyTasks(user_id) {
  const [rows] = await pool.query(
    `
    SELECT id, title, description, user_id, task_date, in_progress, created_at, updated_at
    FROM tasks
    WHERE user_id = ?
    ORDER BY created_at DESC
    `,
    [user_id]
  );

  return rows;
}

export async function getAllTasks({
  page = 1,
  limit = 10,
  search = null
}) {

  const offset = (page - 1) * limit;

  let where = "";
  let params = [];

  // 🔍 SEARCH por título
  if (search && search.trim() !== "") {
    where = "WHERE t.title LIKE ?";
    params.push(`%${search}%`);
  }

  const [rows] = await pool.query(
    `
    SELECT 
      t.id,
      t.title,
      t.description,
      t.task_date,
      t.in_progress,
      t.created_at,
      t.updated_at,
      u.id AS user_id,
      u.names,
      u.first_last_name,
      u.second_last_name,
      u.email
    FROM tasks t
    JOIN users u ON t.user_id = u.id
    ${where}
    ORDER BY t.created_at DESC
    LIMIT ? OFFSET ?
    `,
    [...params, Number(limit), Number(offset)]
  );

  // 🔹 TOTAL
  const [[{ total }]] = await pool.query(
    `
    SELECT COUNT(*) AS total
    FROM tasks t
    ${where}
    `,
    params
  );

  // 🔹 FORMATO
  const formatted = rows.map(row => ({
    task: {
      id: row.id,
      title: row.title,
      description: row.description,
      task_date: row.task_date,
      in_progress: row.in_progress,
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


// 🔹 CREATE TASK (USER)
export async function createTask(title, description, task_date, in_progress, user_id) {

  if (!title) {
    throw new Error("El título es requerido");
  }

  const estadosValidos = ["PENDIENTE", "EN PROCESO", "COMPLETADO"];

  if (in_progress && !estadosValidos.includes(in_progress)) {
    throw new Error("Estado inválido");
  }

  const [result] = await pool.query(
    `
    INSERT INTO tasks (title, description, task_date, in_progress, user_id)
    VALUES (?, ?, ?, ?, ?)
    `,
    [
      title,
      description,
      task_date,
      in_progress || "PENDIENTE",
      user_id
    ]
  );

  return {
    id: result.insertId,
    title,
    description,
    task_date,
    in_progress: in_progress || "PENDIENTE",
    user_id
  };
}


// 🔹 PATCH TASK (SOLO USER)
export async function patchTask(id, data, user) {
  const fields = [];
  const values = [];

  const camposPermitidos = ["title", "description", "task_date", "in_progress"];
  const estadosValidos = ["PENDIENTE", "EN PROCESO", "COMPLETADO"];

  camposPermitidos.forEach(campo => {
    if (data[campo] !== undefined) {

      // validar estado
      if (campo === "in_progress" && !estadosValidos.includes(data[campo])) {
        throw new Error("Estado inválido");
      }

      fields.push(`${campo} = ?`);
      values.push(data[campo]);
    }
  });

  if (fields.length === 0) {
    throw new Error("No hay campos para actualizar");
  }

  let query = `
    UPDATE tasks 
    SET ${fields.join(", ")} 
    WHERE id = ? AND user_id = ?
  `;

  values.push(id, user.id);

  const [result] = await pool.query(query, values);

  if (result.affectedRows === 0) {
    throw new Error("Tarea no encontrada o sin permisos");
  }

  return { message: "Tarea actualizada correctamente" };
}


// 🔹 DELETE TASK (USER + ADMIN)
export async function deleteTask(id, user) {
  let query = "DELETE FROM tasks WHERE id = ?";
  let params = [id];

  if (user.role !== "ADMIN") {
    query += " AND user_id = ?";
    params.push(user.id);
  }

  const [result] = await pool.query(query, params);

  if (result.affectedRows === 0) {
    throw new Error("Tarea no encontrada o sin permisos");
  }

  return { message: "Tarea eliminada correctamente" };
}