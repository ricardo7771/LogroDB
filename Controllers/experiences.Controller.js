import * as ExperienceService from "../Services/experiences.Service.js";


// 🔹 GET MIS EXPERIENCIAS (USER)
export async function getMyExperiences(req, res) {
  try {
    const user_id = req.user.id;

    const experiences = await ExperienceService.getMyExperiences(user_id);

    return res.status(200).json(experiences);
  } catch (error) {
    return res.status(500).json({
      error: error.message
    });
  }
}

export async function getAllExperiences(req, res) {
  try {
    const { page, limit, search } = req.query;

    const experiences = await ExperienceService.getAllExperiences({
      page: Number(page) || 1,
      limit: Number(limit) || 10,
      search: search || null
    });

    return res.status(200).json(experiences);

  } catch (error) {
    return res.status(500).json({
      error: error.message
    });
  }
}

export async function createExperience(req, res) {
  try {
    const { company, position, description, start_date, end_date } = req.body;

    const experience = await ExperienceService.createExperience(
      company,
      position,
      description,
      start_date,
      end_date,
      req.user.id // 🔥 siempre desde token
    );

    return res.status(201).json(experience);
  } catch (error) {
    return res.status(400).json({
      error: error.message
    });
  }
}


// 🔹 PATCH EXPERIENCE (SOLO USER)
export async function patchExperience(req, res) {
  try {
    const { id } = req.params;
    const data = { ...req.body };

    if (Object.keys(data).length === 0) {
      return res.status(400).json({
        error: "No hay datos para actualizar"
      });
    }

    const result = await ExperienceService.patchExperience(
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


// 🔹 DELETE EXPERIENCE (USER + ADMIN)
export async function deleteExperience(req, res) {
  try {
    const { id } = req.params;

    const result = await ExperienceService.deleteExperience(
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