import jwt from 'jsonwebtoken';
import User from '../DB/models/userModel.js';

// function to authenticate user
const authenticateUser = async ( req, res, next ) => {
    try {
        const token = req.header("Authorization")?.split(" ")[1];

        // if no token is found
        if (!token) {
            return res.status(401).json({ error: "Access denied. No token provided." });
        }

        // verify token
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        // find user in db, excluding password
        const user = await User.findById(decodedToken.id).select("-password");

        // error if user not found
        if (!user) {
            return res.status(401).json({ error: "Invalid token. User does not exist." });
        }

        // attach user to request
        req.user = user;
        next();

    } catch (error) {
        return res.status(401).json({ error: "Invalid or expired token." });
    }
};

export default authenticateUser;