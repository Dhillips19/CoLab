// import dotenv from 'dotenv';
// dotenv.config();

// import express from 'express'
// import cors from 'cors';
// import { Server } from 'socket.io';
// import connectDB from './DB/connect.js';
// import { PORT, CORS_OPTIONS} from './config.js'
// import * as Y from 'yjs';


// import { loadDocument, saveDocument, updateDocumentTitle } from './controllers/documentController.js';
// import { loadChatMessages, saveChatMessage } from './controllers/chatController.js';
// import userRouter from './routes/authRoutes.js';
// import documentRouter from './routes/documentRoutes.js';
// import editorRouter from './routes/editorRoutes.js';
// import userSettingsRouter from './routes/userSettingsRoutes.js';


// // create express app
// const app = express();

// app.use(cors({
//     origin: "http://localhost:3000", // Allow frontend to make requests
//     methods: ["GET", "POST", "PUT", "DELETE"],
//     allowedHeaders: ["Content-Type", "Authorization"]
// }));

// // Add console.log for debugging
// app.use((req, res, next) => {
//     console.log(`${req.method} ${req.url}`);
//     next();
// });

// // connect to MongoDB Database
// connectDB();

// //parse json from incoming api requests
// app.use(express.json());

// // routes
// app.use('/api/auth', userRouter)
// app.use('/api/documents', documentRouter);
// app.use('/api/editor', editorRouter);
// app.use('/api/user-settings', userSettingsRouter);

// // create server and listen on PORT 3001
// const server = app.listen(PORT, () => {
//     console.log(`Server listening on port ${PORT}`); 
// });

// // set up socket.io server
// const io = new Server(server, {
//     cors: CORS_OPTIONS,
// });

// // object to store room-specific ydoc and timer
// const roomData = {};

// io.on('connection', (socket) => {
    
//     console.log('User connected');

//     let currentDocumentId = null;

//     // User joins a document room
//     socket.on('joinDocumentRoom', async (documentId) => {
//         try {
//             console.log(`User joined document room ${documentId}`);
//             // load the yjs document for the room for the first user in the room
//             if (!roomData[documentId]) {
//                 const { ydoc, documentTitle } = await loadDocument(documentId); // load document from DB
//                 roomData[documentId] = { ydoc, documentTitle, timer: null }; // add ydoc to roomData object

//                 // save the document state to the DB every 10 seconds
//                 roomData[documentId].timer = setInterval(async () => {
//                     try {
//                         // Safety check if room data still exists
//                         if (!roomData[documentId] || !roomData[documentId].ydoc) {
//                             console.log(`Room data for ${documentId} no longer exists, clearing interval`);
//                             clearInterval(roomData[documentId]?.timer);
//                             return;
//                         }
                        
//                         console.log(`Saving document ${documentId} to database.`);
//                         await saveDocument(documentId, roomData[documentId].ydoc);
//                     } catch (error) {
//                         console.error(`Error saving document ${documentId} in timer:`, error);
                        
//                         // Safety check - clear interval on persistent errors
//                         if (error.message.includes('undefined') || error.message.includes('null')) {
//                             console.log(`Clearing problematic timer for ${documentId}`);
//                             clearInterval(roomData[documentId]?.timer);
//                         }
//                     }
//                 }, 1000000); // 10 seconds
//             }

//             // retrieve ydoc from roomData object
//             const { ydoc, documentTitle } = roomData[documentId];

//             // send initial state to new client
//             socket.emit('updateState', Y.encodeStateAsUpdate(ydoc));
//             socket.emit('updateTitle', documentTitle);

//             try {
//                 const chatHistory = await loadChatMessages(documentId);
//                 socket.emit('loadMessages', chatHistory); // Send chat history via WebSocket
//             } catch (error) {
//                 console.error(`Error loading chat messages for document ${documentId}:`, error);
//             }

//             // join client to document room
//             currentDocumentId = documentId;
//             socket.join(documentId);

//             // listen for doc updates, apply the update to the ydoc, and broadcast the change to clients in the room
//             // socket.on('update', (update) => {
//             //     Y.applyUpdate(ydoc, new Uint8Array(update)); 
//             //     socket.to(documentId).emit('update', update);
//             // });

//             // log when user disconnects from server
//             // socket.on('disconnect', () => {
//             //     console.log(`User disconnected from document ${documentId}`);
//             // });

//         } catch (error) {
//             console.error(`Error handling room ${documentId}:`, error);
//         }
//     });

//     socket.on('updateState', (update) => {
//         if (currentDocumentId && roomData[currentDocumentId]) {
//             Y.applyUpdate(roomData[currentDocumentId].ydoc, new Uint8Array(update)); 
//             socket.to(currentDocumentId).emit('updateState', update);
//         } else {
//                 console.warn("Update received before joining a document room.");
//         }
//     });

//     socket.on('updateTitle', async ({ documentId, title }) => {
//         if (!documentId || !title) {
//             console.warn(`Invalid title update request: ${documentId}, ${title}`);
//             return;
//         }
    
//         if (roomData[documentId]) {
//             console.log(`Server received title update for ${documentId}: ${title}`);
    
//             roomData[documentId].documentTitle = title;
//             io.to(documentId).emit('updateTitle', title);
    
//             try {
//                 await updateDocumentTitle(documentId, title);
//                 console.log(`Title updated in DB: ${title}`);
//             } catch (error) {
//                 console.error(`Failed to update document title:`, error);
//             }
//         } else {
//             console.warn(`updateTitle: No room found for document ${documentId}`);
//         }
//     });

//     socket.on('sendMessage', async ({ documentId, username, message }) => {
//         if (!documentId || !message || !username) return;
    
//         // Create a chat message object
//         const chatMessage = {
//             username,
//             message,
//             timestamp: new Date(),
//         };
    
//         // Save message to MongoDB
//         try {
//             await saveChatMessage(documentId, chatMessage);
//         } catch (error) {
//             console.error(`Failed to save chat message:`, error);
//         }
    
//         // Broadcast message to all users in the same document room
//         io.to(documentId).emit('receiveMessage', chatMessage);
//     });
        
//     // log when user disconnects from server
//     socket.on('disconnect', () => {
//         console.log(`User disconnected from document ${currentDocumentId}`);
//     });

//     // clean up room when all users have disconnected
//     socket.on('disconnecting', async () => {
//         // save current document rooms in array, excluding socket private room
//         const documentRooms = Array.from(socket.rooms).filter((room) => room !== socket.id);

//         // Process each room one by one
//         for (const room of documentRooms) {
//             console.log(`Socket disconnecting from room ${room}`);
            
//             try {
//                 // Check if this is the last user in the room
//                 const roomClients = await io.in(room).fetchSockets();
//                 if (roomClients.length <= 1) { // Only this disconnecting socket is left
//                     console.log(`Last user left room ${room}, cleaning up resources`);

//                     // Make a local copy of the room data first
//                     const roomDataCopy = roomData[room] ? { ...roomData[room] } : null;
                    
//                     if (roomDataCopy) {
//                         // Step 1: Clear the timer first to prevent future callbacks
//                         if (roomDataCopy.timer) {
//                             clearInterval(roomDataCopy.timer);
                            
//                             // Also clear in original object to prevent parallel runs
//                             if (roomData[room]) {
//                                 roomData[room].timer = null;
//                             }
//                         }
                        
//                         // Step 2: Save the document if we have a valid ydoc
//                         if (roomDataCopy.ydoc) {
//                             try {
//                                 console.log(`Saving document ${room} before cleanup`);
//                                 await saveDocument(room, roomDataCopy.ydoc);
//                                 console.log(`Document ${room} saved successfully`);
//                             } catch (saveError) {
//                                 console.error(`Failed to save document ${room} during cleanup:`, saveError);
//                             }
//                         }
                        
//                         // Step 3: Only after saving, delete the room data
//                         // Check again if it exists to avoid race conditions
//                         if (roomData[room]) {
//                             console.log(`Deleting room data for ${room}`);
//                             delete roomData[room];
//                         }
//                     } else {
//                         console.log(`No room data found for ${room}, nothing to clean up`);
//                     }
//                 } else {
//                     console.log(`${roomClients.length - 1} users still in room ${room}, not cleaning up yet`);
//                 }
//             } catch (error) {
//                 console.error(`Error processing room ${room} during disconnect:`, error);
//             }
//         }
//     });
// });

import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import { Server } from 'socket.io';
import connectDB from './DB/connect.js';
import { PORT, CORS_OPTIONS } from './config.js';
import userRouter from './routes/authRoutes.js';
import documentRouter from './routes/documentRoutes.js';
import editorRouter from './routes/editorRoutes.js';
import userSettingsRouter from './routes/userSettingsRoutes.js';
import initializeSocket from './socketHandler.js'; // Move WebSocket logic to a separate file

// Initialize Express App
const app = express();
app.use(cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());

// Log incoming requests (for debugging)
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

// Connect to MongoDB
connectDB();

// Register API Routes
app.use('/api/auth', userRouter);
app.use('/api/documents', documentRouter);
app.use('/api/editor', editorRouter);
app.use('/api/user-settings', userSettingsRouter);

// Start Express Server
const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// Initialize WebSocket Server
initializeSocket(server);
