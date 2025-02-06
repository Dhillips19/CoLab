import { Server } from 'socket.io';
import { PORT, CORS_OPTIONS} from './config.js'
import * as Y from 'yjs';
import express from 'express'
import connectDB from './DB/connect.js';
import { loadOrCreateDocument, saveDocument } from './controllers/documentController.js';
import userRouter from './routes/authRoutes.js';
import cors from 'cors';

// create express app
const app = express();

app.use(cors({
    origin: "http://localhost:3000", // Allow frontend to make requests
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

// connect to MongoDB Database
connectDB();

//parse json from incoming api requests
app.use(express.json());

// user route
app.use('/api/auth', userRouter)

// create server and listen on PORT 3001
const server = app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`); 
});

// set up socket.io server
const io = new Server(server, {
    cors: CORS_OPTIONS,
});

// object to store room-specific ydoc and timer
const roomData = {};

io.on('connection', (socket) => {
    console.log('User connected');

    // User joins a document room
    socket.on('joinDocumentRoom', async (documentId) => {
        try {

            // load or create the yjs document for the room for the first user in the room
            if (!roomData[documentId]) {
                const ydoc = await loadOrCreateDocument(documentId); // load or create document in DB
                roomData[documentId] = { ydoc, timer: null }; // add ydoc to roomData object

                // save the document state to the DB every 10 seconds
                roomData[documentId].timer = setInterval(async () => {
                    console.log(`Saving document ${documentId} to database.`);
                    await saveDocument(documentId, roomData[documentId].ydoc);
                }, 10000); // 10 seconds
            }

            // retrieve ydoc from roomData object
            const { ydoc } = roomData[documentId];

            // send initial state to new client
            socket.emit('initialState', Y.encodeStateAsUpdate(ydoc));

            // join client to document room
            socket.join(documentId);

            // listen for doc updates, apply the update to the ydoc, and broadcast the change to clients in the room
            socket.on('update', (update) => {
                Y.applyUpdate(ydoc, new Uint8Array(update)); 
                socket.to(documentId).emit('update', update);
            });

            // log when user disconnects from server
            socket.on('disconnect', () => {
                console.log(`User disconnected from document ${documentId}`);
            });

        } catch (error) {
            console.error(`Error handling room ${documentId}:`, error);
        }
    });

    // clean up room when all users have disconnected
    socket.on('disconnecting', async () => {
        // save current document rooms in array, excluding socket private room
        const documentRooms = Array.from(socket.rooms).filter((room) => room !== socket.id);

        // check for document room and delete it
        for (const room of documentRooms) {
            console.log(`Cleaning up room ${room}`);

            // remove timer, save document to DB, and delete room data
            if (roomData[room]) {
                clearInterval(roomData[room].timer);
                await saveDocument(room, roomData[room].ydoc);
                delete roomData[room];
            }
        }
    });
});
