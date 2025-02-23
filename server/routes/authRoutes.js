import express from 'express';
import { registerUser, loginUser, logoutUser } from '../controllers/authController.js';

const userRouter = express.Router();

// register user route
userRouter.post('/register', registerUser);

// login user route
userRouter.post('/login', loginUser);

// logout user route
userRouter.post('/logout', logoutUser);

export default userRouter;