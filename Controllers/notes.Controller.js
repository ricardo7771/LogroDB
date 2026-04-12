import * as NotesService from "../Services/notes.Service.js";

export async function getMyNotes(req, res) {
  try {
    const user_id = req.user.id;

    const notes = await NotesService.getMyNotes(user_id);

    return res.status(200).json(notes);
  } catch (error) {
    return res.status(500).json({
      error: error.message
    });
  }
}

export async function getAllNotes(req, res) {
  try {
    const { page, limit, search } = req.query;

    const notes = await NotesService.getAllNotes({
      page: Number(page) || 1,
      limit: Number(limit) || 10,
      search: search || null
    });

    return res.status(200).json(notes);

  } catch (error) {
    return res.status(500).json({
      error: error.message
    });
  }
}

export async function createNote(req, res) {
  try {
    const { title, content } = req.body;

    // validación básica
    if (!title) {
      return res.status(400).json({
        error: "El título es requerido"
      });
    }

    const note = await NotesService.createNotes(
      title,
      content,
      req.user.id
    );

    return res.status(201).json(note);
  } catch (error) {

    if (error.message === "Tipo de nota inválido") {
      return res.status(400).json({
        error: "note_type debe ser 'NOTA' o 'APUNTE'"
      });
    }

    return res.status(500).json({
      error: error.message
    });
  }
}

export async function patchNote(req, res) {
  try {
    const { id } = req.params;
    const data = { ...req.body };

    const result = await NotesService.patchNotes(id, data, req.user);

    return res.status(200).json(result);
  } catch (error) {

    if (error.message === "Tipo de nota inválido") {
      return res.status(400).json({
        error: "note_type debe ser 'NOTA' o 'APUNTE'"
      });
    }

    return res.status(403).json({
      error: error.message
    });
  }
}

export async function deleteNote(req, res) {
  try {
    const { id } = req.params;

    const result = await NotesService.deleteNotes(id, req.user);

    return res.status(200).json(result);
  } catch (error) {
    return res.status(404).json({
      error: error.message
    });
  }
}