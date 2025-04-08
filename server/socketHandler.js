import { Server } from "socket.io";
import * as Y from "yjs";
import { loadDocument, saveDocument, updateDocumentTitle } from "./controllers/documentController.js";
import { loadChatMessages, saveChatMessage } from "./controllers/chatController.js";

// Store room-specific Y.js documents and timers
const roomData = {};
const roomUsers = {}

export default function initializeSocket(server) {
    const io = new Server(server, {
        cors: {
            origin: "http://localhost:3000",
        },
    });

    io.on('connection', (socket) => {
        console.log(`User connected: ${socket.id}`);

        socket.on('joinDocumentRoom', async ({ documentId, username, colour }) => {
            
            try {
                console.log(`User ${username}, ${colour}, attempting to join document: ${documentId}`);
                
                if (socket.joinedRooms?.has(documentId)) {
                    console.log(`Socket ${socket.id} already joined ${documentId}, skipping.`);
                    return;
                }

                socket.joinedRooms = socket.joinedRooms || new Set();
                socket.joinedRooms.add(documentId);

                try {
                    console.log(`User ${socket.id} joined document room: ${documentId}`);
                    socket.join(documentId);

                    // Load or create the document
                    if (!roomData[documentId]) {
                        const docData = await loadDocument(documentId);
                        if (!docData || !docData.ydoc) {
                            console.error(`Error: Document ${documentId} could not be loaded.`);
                            socket.emit("error", "Document not found");
                            return;
                        }
                        roomData[documentId] = { ydoc: docData.ydoc, documentTitle: docData.documentTitle, timer: null };

                        // Save document state every 10 seconds
                        roomData[documentId].timer = setInterval(async () => {
                            console.log(`Auto-saving document ${documentId} to database.`);
                            await saveDocument(documentId, roomData[documentId].ydoc);
                        }, 10000);
                    }

                    const { ydoc, documentTitle } = roomData[documentId];

                    // create roomUsers object if it doesn't exist
                    if (!roomUsers[documentId]) {
                        roomUsers[documentId] = {};
                    }
                    // check if user already exists in the room
                    const userAlreadyExists = Object.values(roomUsers[documentId]).some(
                        (user) => user.username === username
                    );
                    // add user if they do not exist
                    if (!userAlreadyExists) {
                        roomUsers[documentId][socket.id] = { username, colour };
                    }
                    console.log(`Users in room ${documentId}:`, roomUsers[documentId]);

                    // Broadcast to others that a new user joined
                    io.to(documentId).emit("updateUsers", Object.values(roomUsers[documentId]));

                    // Send the initial document state
                    socket.emit("initialState", Y.encodeStateAsUpdate(ydoc));
                    socket.emit("updateTitle", documentTitle);

                    try {
                        const chatHistory = await loadChatMessages(documentId);
                        socket.emit("loadMessages", chatHistory);
                    } catch (error) {
                        console.error(`Error loading chat for ${documentId}:`, error);
                    }

                    // Attach event listeners 
                    if (!socket.hasUpdateListener) {
                        socket.on("update", (update) => {
                            Y.applyUpdate(ydoc, new Uint8Array(update));
                            socket.to(documentId).emit("update", update);
                        });
                        socket.hasUpdateListener = true; // Prevent duplicate listeners
                    }

                    socket.on("disconnect", () => {
                        console.log(`User ${socket.id} disconnected from document: ${documentId}`);
                    });

                } catch (error) {
                    console.error(`Error handling document ${documentId}:`, error);
                    socket.emit("documentError", {
                        error: "Document not found",
                        code: "DOCUMENT_NOT_FOUND",
                    });
                }
            } catch (error) {
                console.error(`Error joining document room ${documentId}:`, error);
            }    
        });

        socket.on('requestLatestState', async (documentId) => {
            try {
                if (!documentId) return;
                
                console.log(`Client requested latest state for document ${documentId}`);
                
                const { ydoc } = await loadDocument(documentId);

                if (ydoc) {
                    roomData[documentId].ydoc = ydoc; // Update in-memory document if it exists
                    const update = Y.encodeStateAsUpdate(ydoc);
                    socket.emit('latestState', update);
                }
            } catch (error) {
                console.error(`Error sending latest state for ${documentId}:`, error);
            }
        });

        socket.on('awareness-update', ({ documentId, update }) => {
            socket.to(documentId).emit('awareness-update', { update });
          });
          

        socket.on("updateTitle", async ({ documentId, title }) => {
            if (!documentId || !title) return console.warn("Invalid title update request.");

            if (roomData[documentId]) {
                console.log(`Title updated: ${title}`);
                roomData[documentId].documentTitle = title;
                io.to(documentId).emit("updateTitle", title);

                try {
                    await updateDocumentTitle(documentId, title);
                } catch (error) {
                    console.error("Failed to update document title:", error);
                }
            }
        });

        // Handle chat messages
        socket.on("sendMessage", async ({ documentId, username, message }) => {
            if (!documentId || !message || !username) return;

            const chatMessage = { username, message, timestamp: new Date() };

            try {
                await saveChatMessage(documentId, chatMessage);
                io.to(documentId).emit("receiveMessage", chatMessage);
            } catch (error) {
                console.error(`Failed to save chat message:`, error);
            }
        });

        // Handle cleanup when users disconnect
        socket.on('disconnecting', async () => {
            const documentRooms = Array.from(socket.rooms).filter((room) => room !== socket.id);

            for (const room of documentRooms) {
                console.log(`Checking cleanup for room: ${room}`);

                const roomClients = await io.in(room).fetchSockets();
                if (roomClients.length <= 1) {  // Only one user left (about to disconnect)
                    console.log(`Last user leaving room ${room}, saving and cleaning up.`);
                    
                    if (roomData[room]) {
                        if (roomData[room].timer) {
                            console.log(`Clearing auto-save timer for document ${room}`);
                            
                            clearInterval(roomData[room].timer);
                            roomData[room].timer = null; // prevent double-clears
                        }
        
                        await saveDocument(room, roomData[room].ydoc);
                        delete roomData[room];
                    }

                    if (roomUsers[room]) {
                        delete roomUsers[room][socket.id];
                        io.to(room).emit("updateUsers", Object.values(roomUsers[room]));
                    }
                } else {
                    console.log(`${roomClients.length - 1} users still in room ${room}, not cleaning up.`);
                }
            }
        });
    });

    return io;
};
