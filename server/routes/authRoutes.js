import express from 'express';
import { registerUser, loginUser, logoutUser, changePassword } from '../controllers/authController.js';
import authenticateUser from '../middleware/authMiddleware.js';

const userRouter = express.Router();

// register user route
userRouter.post('/register', registerUser);

// login user route
userRouter.post('/login', loginUser);

// logout user route
userRouter.post('/logout', logoutUser);

// change password route
userRouter.put('/change-password', authenticateUser, changePassword);

userRouter.get('/verify', authenticateUser, (req, res) => {
    res.status(200).json({ valid: true });
  });
  
export default userRouter;