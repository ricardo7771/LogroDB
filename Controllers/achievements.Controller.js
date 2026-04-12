import * as AchievementService from "../Services/achievements.Service.js";

// 🔹 GET MIS LOGROS (USER)
export async function getMyAchievements(req, res) {
  try {
    const user_id = req.user.id;

    const achievements = await AchievementService.getMyAchievements(user_id);

    return res.status(200).json(achievements);
  } catch (error) {
    return res.status(500).json({
      error: error.message
    });
  }
}


// 🔹 GET TODOS LOS LOGROS (ADMIN)
export async function getAllAchievements(req, res) {
  try {
    const achievements = await AchievementService.getAllAchievements();

    return res.status(200).json(achievements);
  } catch (error) {
    return res.status(500).json({
      error: error.message
    });
  }
}


// 🔹 CREATE (USER)
export async function createAchievement(req, res) {
  try {
    const { title, description, achieved_at, achievement_type } = req.body;

    if (!title) {
      return res.status(400).json({
        error: "El título es requerido"
      });
    }

    const achievement = await AchievementService.createAchievement(
      title,
      description,
      achieved_at,
      achievement_type,
      req.user.id // 🔥 siempre desde token
    );

    return res.status(201).json(achievement);
  } catch (error) {
    return res.status(500).json({
      error: error.message
    });
  }
}


// 🔹 PATCH (SOLO USER)
export async function patchAchievement(req, res) {
  try {
    const { id } = req.params;
    const data = { ...req.body };

    if (Object.keys(data).length === 0) {
      return res.status(400).json({
        error: "No hay datos para actualizar"
      });
    }

    const result = await AchievementService.patchAchievement(
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


// 🔹 DELETE (USER + ADMIN)
export async function deleteAchievement(req, res) {
  try {
    const { id } = req.params;

    const result = await AchievementService.deleteAchievement(
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