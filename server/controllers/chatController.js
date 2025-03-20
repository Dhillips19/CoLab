import Chat from '../DB/models/chatModel.js';

// Save a new chat message
export async function saveChatMessage(documentId, chatMessage) {
    try {
        const chat = await Chat.findOneAndUpdate(
            { documentId },
            { $push: { messages: chatMessage } },
            { new: true, upsert: true }
        );
        return chat;
    } catch (error) {
        console.error('Error saving chat message:', error);
    }
}

// Load chat history
export async function loadChatMessages(documentId) {
    try {
        const chat = await Chat.findOne({ documentId });
        return chat ? chat.messages : [];
    } catch (error) {
        console.error('Error loading chat messages:', error);
        return [];
    }
}
