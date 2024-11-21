import express from 'express';
import User from '../DB/userSchema.js';

const router = express.Router();

router.post('/add-user' , async (req, res) => {
    const { username, email, password } = req.body;

    try {
        const newUser = new User({ username, email, password });

        await newUser.save();

        res.status(201).json({message: 'User Created', user: newUser});
    } catch (error) {
        console.error(error);
        res.status(500).json({message: 'User could not be created', error: error.message})
    }
});

export default router;