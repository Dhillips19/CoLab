import express from 'express';
import { searchUser, addCollaborator, getCollaborators, removeCollaborator } from '../controllers/collaboratorSearchController.js';
import authenticateUser from '../middleware/authMiddleware.js';

const editorRouter = express.Router();

// Search for users
editorRouter.get('/search', authenticateUser, searchUser);

// Get current collaborators
editorRouter.get('/:documentId/collaborators', authenticateUser, getCollaborators);

// Add collaborator
editorRouter.post('/:documentId/collaborators', authenticateUser, addCollaborator);

// Remove collaborator
editorRouter.delete('/:documentId/collaborators/:userId', authenticateUser, removeCollaborator);

export default editorRouter;