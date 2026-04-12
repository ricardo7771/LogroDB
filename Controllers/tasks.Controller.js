import * as TaskService from "../Services/tasks.Service.js";


// 🔹 GET MIS TASKS (USER)
export async function getMyTasks(req, res) {
  try {
    const user_id = req.user.id;

    const tasks = await TaskService.getMyTasks(user_id);

    return res.status(200).json(tasks);
  } catch (error) {
    return res.status(500).json({
      error: error.message
    });
  }
}


// 🔹 GET TODAS LAS TASKS (ADMIN)
export async function getAllTasks(req, res) {
  try {
    const tasks = await TaskService.getAllTasks();

    return res.status(200).json(tasks);
  } catch (error) {
    return res.status(500).json({
      error: error.message
    });
  }
}


// 🔹 CREATE TASK (USER)
export async function createTask(req, res) {
  try {
    const { title, description, task_date, in_progress } = req.body;

    if (!title) {
      return res.status(400).json({
        error: "El título es requerido"
      });
    }

    const task = await TaskService.createTask(
      title,
      description,
      task_date,
      in_progress,
      req.user.id // 🔥 siempre del token
    );

    return res.status(201).json(task);
  } catch (error) {
    return res.status(400).json({
      error: error.message
    });
  }
}


// 🔹 PATCH TASK (SOLO USER)
export async function patchTask(req, res) {
  try {
    const { id } = req.params;
    const data = { ...req.body };

    if (Object.keys(data).length === 0) {
      return res.status(400).json({
        error: "No hay datos para actualizar"
      });
    }

    const result = await TaskService.patchTask(
      id,
      data,
      req.user
    );

    return res.status(200).json(result);
  } catch (error) {
    return res.status(403).json({
      error: error.message
    });
  }
}


// 🔹 DELETE TASK (USER + ADMIN)
export async function deleteTask(req, res) {
  try {
    const { id } = req.params;

    const result = await TaskService.deleteTask(
      id,
      req.user
    );

    return res.status(200).json(result);
  } catch (error) {
    return res.status(403).json({
      error: error.message
    });
  }
}