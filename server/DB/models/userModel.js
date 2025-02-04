import mongoose from 'mongoose';

const userModel = new mongoose.Schema({
    // id: {
    //     type: String,
    //     required: true,
    //     unique: true,
    //     default: () => new mongoose.Types.ObjectId().toString(),
    // },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
    },
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
}, {
    timestamps: true,
});

const User = mongoose.model('User', userModel);

export default User;

