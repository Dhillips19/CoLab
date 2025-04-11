import mongoose from 'mongoose';

const ChatSchema = new mongoose.Schema({
    documentId: {
        type: String,
        required: true,
    },
    messages: [
        {
            username: { type: String, required: true },
            message: { type: String, required: true },
            timestamp: { type: Date, default: Date.now },
        },
    ],
});

const Chat = mongoose.model('Chat', ChatSchema);

export default Chat;