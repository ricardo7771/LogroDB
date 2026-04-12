import express from "express"; 
import {
 getMyNotes, 
 getAllNotes, 
 createNote,
 patchNote, 
 deleteNote
} from "../Controllers/notes.Controller.js";  
import { checkRole, checkToken } from "../Middleware/auth.middleware.js";

const router = express.Router(); 

router.get("/notes/me", checkToken, getMyNotes); 
router.get("/notes", checkRole(["ADMIN"]), checkToken, getAllNotes); 
router.post("/notes/create", checkToken, createNote); 
router.patch("/notes/:id", checkToken, patchNote); 
router.delete("/notes/me", checkToken, deleteNote);
router.delete("/notes/:id", checkRole(["ADMIN"]), checkToken, deleteNote);

export default router;