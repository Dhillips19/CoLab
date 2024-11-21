import { Server } from 'socket.io';
import { PORT, CORS_OPTIONS} from './config.js'
import * as Y from 'yjs';
import express from 'express'
import connectDB from './DB/connect.js';
import createUserRoute from './routes/createUser.js';
import { loadOrCreateDocument, saveDocument } from './utils/documentHandlers.js';

const app = express();
// connect to MongoDB Database
connectDB();

//parse json from incoming api requests
app.use(express.json());

// register user creation route
app.use('/api/createUser', createUserRoute)

// create server and listen on PORT 3001
const server = app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});

// set up socket.io server
const io = new Server(server, {
    cors: CORS_OPTIONS,
});

// deal with ydoc updates and log disconnection when user disconnects
io.on('connection', (socket) => {
    console.log('User connected');

    // user joins room based on document id
    socket.on('joinDocumentRoom', async (documentId) => {
        
        console.log(`User joined document: ${documentId}`);
        
        // load or create document              
        const ydoc = await loadOrCreateDocument(documentId);
        
        // send initial doc state to new client
        socket.emit('initialState', Y.encodeStateAsUpdate(ydoc));
        
        // join client to document room
        socket.join(documentId);

        // listen for doc updates, apply the update to the ydoc, and broadcast the change to clients in the room
        socket.on('update', async (update) => {
            Y.applyUpdate(ydoc, new Uint8Array(update));
            socket.to(documentId).emit('update', update);
            await saveDocument(documentId, ydoc);
        });

        // log when user disconnects from server
        socket.on('disconnect', () => {
            console.log(`User disconnected from document: ${documentId}`);
        });
    });
});