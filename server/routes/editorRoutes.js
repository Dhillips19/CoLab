import express from 'express';
import { searchUser, addCollaborator } from '../controllers/collaboratorSearchController.js';
import authenticateUser from '../middleware/authMiddleware.js';

const editorRouter = express.Router();

// create document
editorRouter.get('/search', authenticateUser, searchUser);

// list documents
editorRouter.post('/:documentId/collaborators', authenticateUser, addCollaborator);

export default editorRouter;