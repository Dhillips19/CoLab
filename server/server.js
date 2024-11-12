import http from 'http';
import { Server } from 'socket.io';
import * as Y from 'yjs';

const server = http.createServer();

// set up socket.io server
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:3000',
        methods: ['GET', 'POST']
    },
});

// create Y.js document to hold all changes
const doc = new Y.Doc();

io.on('connection', (socket) => {
    console.log('User connected');

    // send initial doc state to new client
    socket.emit('initialState', Y.encodeStateAsUpdate(doc));

    // listen for doc updates
    socket.on('update', (update) => {
        // apply the update to the Y.js doc
        Y.applyUpdate(doc, new Uint8Array(update));
        // send the update to all clients
        socket.broadcast.emit('update', update);
    });

    // disconnection
    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

// start server
server.listen(3001, () => {
    console.log('Server listening on port 3001');
});