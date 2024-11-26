import User from '../DB/models/userModel.js';

const userController = {
    //create a new user
    createUser: async (req, res) => {
        try {
            const { username, email, password } = req.body;

            const newUser = new User({ username, email, password });
            await newUser.save();

            res.status(201).json({message: 'User created successfully', user: newUser});
        } catch (error) {
            console.error(error);
            res.status(500).json({message: 'User could not be created', error: error.message})
        }
    }
};

export default userController;