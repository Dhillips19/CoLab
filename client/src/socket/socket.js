import { io } from "socket.io-client";

const URL = "http://localhost:3001"; // server URL
let socket = null;

export const initiateSocket = (documentId) => {
    if (!socket) {
        // initialise socket if it does not exist
        socket = io(URL, {
            query: { documentId }, // pass the documentID to server
        });

        // handle successful connection
        socket.on("connect", () => {
            console.log("Connected to WebSocket server:", socket.id);
            socket.emit("joinDocumentRoom", documentId); // join document room
        });

        // handle disconnection
        socket.on("disconnect", () => {
            console.log("Disconnected from WebSocket server");
        });
    }
    return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect(); // close the connection
        socket = null;
        console.log("Socket disconnected");
    }
};
