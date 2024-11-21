import { Server } from 'socket.io';
import { PORT, CORS_OPTIONS} from './config.js'
import * as Y from 'yjs';
import express from 'express'
import connectDB from './DB/connect.js';
import createUserRoute from './routes/createUser.js';

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

// create Y.js document to hold changes
const doc = new Y.Doc();

// deal with ydoc updates and log disconnection when user disconnects
io.on('connection', (socket) => {
    console.log('User connected');

    // send initial doc state to new client
    socket.emit('initialState', Y.encodeStateAsUpdate(doc));

    // listen for doc updates, apply the update to the ydoc, and broadcast the change to clients
    socket.on('update', (update) => {
        Y.applyUpdate(doc, new Uint8Array(update));
        socket.broadcast.emit('update', update);
    });

    // log when user disconnects from server
    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});