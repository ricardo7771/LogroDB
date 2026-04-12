import {pool} from "../DB/ConexionDB.js"; 

export async function getMyNotes(user_id) {
    const [rows] = await pool.query(
        `
        SELECT id, title, content, user_id, created_at, updated_at 
        FROM notes
        WHERE user_id = ?
        `, 
        [user_id]
    ); 

    return rows; 
}

export async function getAllNotes() {
  const [rows] = await pool.query(`
    SELECT 
      n.id,
      n.title,
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
    ORDER BY n.created_at DESC
  `);

  // formatear respuesta
  const formatted = rows.map(row => ({
    content: {
      id: row.id,
      title: row.title,
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

  return formatted;
}

export async function createNotes(title, content, user_id) {
    const [result] = await pool.query(
        `
        INSERT INTO notes (title, content, user_id) VALUES(?,?,?)
        `,
        [title, content, user_id]
    ); 

    return{
      id: result.insertId, 
      title, 
      content, 
      user_id
    }; 
    
}

export async function patchNotes(id, data, user) {
  const fields = [];
  const values = [];

  const camposPermitidos = ["title", "content"];

  camposPermitidos.forEach(campo => {
    if (data[campo] !== undefined) {
      fields.push(`${campo} = ?`);
      values.push(data[campo]);
    }
  });

  if (fields.length === 0) {
    throw new Error("No hay campos para actualizar");
  }

  let query = `UPDATE notes SET ${fields.join(", ")} WHERE id = ? AND user_id = ?`;

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



