import express from 'express';
import { updateUserColour } from '../controllers/userSettingsController.js';
import authenticateUser from '../middleware/authMiddleware.js';

const userSettingsRouter = express.Router();

// Routes for user settings
userSettingsRouter.put('/update-colour', authenticateUser, updateUserColour);

export default userSettingsRouter;