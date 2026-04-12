import * as ContentService from "../Services/content.service.js";

export const handleGet = (tableName) => async (req, res) => {
  try {
    const data = await ContentService.getAllContent(
      tableName,
      req.user.id,
      req.user.role,
    );
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const handleCreate = (tableName) => async (req, res) => {
  try {
    const data = { ...req.body, user_id: req.user.id };
    const result = await ContentService.createContent(tableName, data);
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const handleUpdate = (tableName) => async (req, res) => {
  try {
    const result = await ContentService.updateContent(
      tableName,
      req.params.id,
      req.user.id,
      req.user.role,
      req.body,
    );
    res.json(result);
  } catch (error) {
    res.status(403).json({ error: error.message });
  }
};

export const handleDelete = (tableName) => async (req, res) => {
  try {
    const result = await ContentService.deleteContent(
      tableName,
      req.params.id,
      req.user.id,
      req.user.role,
    );
    res.json(result);
  } catch (error) {
    res.status(403).json({ error: error.message });
  }
};
