// import { Server } from "socket.io";
// import * as Y from "yjs";
// import { loadDocument, saveDocument, updateDocumentTitle } from "./controllers/documentController.js";
// import { loadChatMessages, saveChatMessage } from "./controllers/chatController.js";

// const roomData = {}; // Store Y.js documents per room

// export default function initializeSocket(server) {
//     const io = new Server(server, {
//         cors: {
//             origin: "http://localhost:3000",
//         },
//     });

//     io.on("connection", (socket) => {
//         console.log(`New user connected. Socket ID: ${socket.id}`);

//         let currentDocumentId = null;

//         // Handle joining a document room
//         socket.on("joinDocumentRoom", async (documentId) => {
//             try {
//                 console.log(`User joined document: ${documentId}`);

//                 if (!roomData[documentId]) {
//                     const { ydoc, documentTitle } = await loadDocument(documentId);
//                     roomData[documentId] = { ydoc, documentTitle, timer: null };

//                     // Auto-save document state every 10 seconds
//                     roomData[documentId].timer = setInterval(async () => {
//                         try {
//                             if (roomData[documentId]) {
//                                 console.log(`Saving document: ${documentId}`);
//                                 await saveDocument(documentId, roomData[documentId].ydoc);
//                             }
//                         } catch (error) {
//                             console.error(`Error saving document ${documentId}:`, error);
//                         }
//                     }, 10000);
//                 }

//                 // Get the Y.js document & send initial state
//                 const { ydoc, documentTitle } = roomData[documentId];
//                 socket.emit("updateState", Y.encodeStateAsUpdate(ydoc));
//                 socket.emit("updateTitle", documentTitle);

//                 // Load and send chat history
//                 try {
//                     const chatHistory = await loadChatMessages(documentId);
//                     socket.emit("loadMessages", chatHistory);
//                 } catch (error) {
//                     console.error(`Error loading chat for ${documentId}:`, error);
//                 }

//                 // Join the room
//                 currentDocumentId = documentId;
//                 socket.join(documentId);
//             } catch (error) {
//                 console.error(`Error handling document room ${documentId}:`, error);
//             }
//         });

//         // Handle document updates
//         socket.on("updateState", (update) => {
//             if (currentDocumentId && roomData[currentDocumentId]) {
//                 Y.applyUpdate(roomData[currentDocumentId].ydoc, new Uint8Array(update));
//                 socket.to(currentDocumentId).emit("updateState", update);
//             } else {
//                 console.warn("Update received before joining a document room.");
//             }
//         });

//         // Handle document title updates
//         socket.on("updateTitle", async ({ documentId, title }) => {
//             if (!documentId || !title) return console.warn("Invalid title update request.");

//             if (roomData[documentId]) {
//                 console.log(`Title updated: ${title}`);
//                 roomData[documentId].documentTitle = title;
//                 io.to(documentId).emit("updateTitle", title);

//                 try {
//                     await updateDocumentTitle(documentId, title);
//                 } catch (error) {
//                     console.error("Failed to update document title:", error);
//                 }
//             }
//         });

//         // Handle chat messages
//         socket.on("sendMessage", async ({ documentId, username, message }) => {
//             if (!documentId || !message || !username) return;

//             const chatMessage = { username, message, timestamp: new Date() };

//             try {
//                 await saveChatMessage(documentId, chatMessage);
//                 io.to(documentId).emit("receiveMessage", chatMessage);
//             } catch (error) {
//                 console.error(`Failed to save chat message:`, error);
//             }
//         });

//         socket.on("leaveDocumentRoom", (documentId) => {
//             console.log(`User left document: ${documentId}`);
//             socket.leave(documentId);
//             if (socket.rooms.size === 0) {
//                 socket.disconnect();
//             }
//         });

//         // Handle user disconnecting
//         socket.on("disconnect", () => {
//             console.log(`User disconnected from document: ${currentDocumentId}`);
//         });

//         // Handle cleanup when the last user leaves
//         socket.on("disconnecting", async () => {
//             const rooms = Array.from(socket.rooms).filter((room) => room !== socket.id);

//             for (const room of rooms) {
//                 try {
//                     const roomClients = await io.in(room).fetchSockets();

//                     if (roomClients.length <= 1) {
//                         console.log(`Last user left room ${room}, cleaning up...`);

//                         const roomDataCopy = { ...roomData[room] };

//                         if (roomDataCopy.timer) {
//                             clearInterval(roomDataCopy.timer);
//                             delete roomData[room];
//                         }

//                         if (roomDataCopy.ydoc) {
//                             await saveDocument(room, roomDataCopy.ydoc);
//                             console.log(`Document ${room} saved.`);
//                         }
//                     } else {
//                         console.log(`${roomClients.length - 1} users still in room ${room}, no cleanup needed.`);
//                     }
//                 } catch (error) {
//                     console.error(`Error during room cleanup for ${room}:`, error);
//                 }
//             }
//         });
//     });

//     return io;
// }

// object to store room-specific ydoc and timer
// const roomData = {};

// export default function initializeSocket(server) {
//     const io = new Server(server, {
//         cors: {
//             origin: "http://localhost:3000",
//         },
//     });

//     io.on('connection', (socket) => {
//         console.log('User connected');

//         // User joins a document room
//         socket.on('joinDocumentRoom', async (documentId) => {
//             try {

//                 // load or create the yjs document for the room for the first user in the room
//                 if (!roomData[documentId]) {
//                     const { ydoc, documentTitle} = await loadDocument(documentId); // load or create document in DB
//                     roomData[documentId] = { ydoc, documentTitle, timer: null }; // add ydoc to roomData object

//                     // save the document state to the DB every 10 seconds
//                     roomData[documentId].timer = setInterval(async () => {
//                         console.log(`Saving document ${documentId} to database.`);
//                         await saveDocument(documentId, roomData[documentId].ydoc);
//                     }, 10000); // 10 seconds
//                 }

//                 // retrieve ydoc from roomData object
//                 const { ydoc, documentTitle } = roomData[documentId];

//                 // send initial state to new client
//                 socket.emit('initialState', Y.encodeStateAsUpdate(ydoc));

//                 // join client to document room
//                 socket.join(documentId);

//                 // listen for doc updates, apply the update to the ydoc, and broadcast the change to clients in the room
//                 socket.on('update', (update) => {
//                     Y.applyUpdate(ydoc, new Uint8Array(update)); 
//                     socket.to(documentId).emit('update', update);
//                 });

//                 // log when user disconnects from server
//                 socket.on('disconnect', () => {
//                     console.log(`User disconnected from document ${documentId}`);
//                 });

//             } catch (error) {
//                 console.error(`Error handling room ${documentId}:`, error);
//             }
//         });

//         // clean up room when all users have disconnected
//         socket.on('disconnecting', async () => {
//             // save current document rooms in array, excluding socket private room
//             const documentRooms = Array.from(socket.rooms).filter((room) => room !== socket.id);

//             // check for document room and delete it
//             for (const room of documentRooms) {
//                 console.log(`Cleaning up room ${room}`);

//                 // remove timer, save document to DB, and delete room data
//                 if (roomData[room]) {
//                     clearInterval(roomData[room].timer);
//                     await saveDocument(room, roomData[room].ydoc);
//                     delete roomData[room];
//                 }
//             }
//         });
//     });

//     return io;
// };

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
            
            console.log(`User ${username}, ${colour}`);
            
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
                socket.emit("error", "An error occurred while joining the document");
            }
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
