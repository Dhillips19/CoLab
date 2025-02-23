import React, { createContext, useContext, useEffect, useState } from "react";
import { initiateSocket, disconnectSocket } from "./socket";
import { useParams } from "react-router-dom";

const SocketContext = createContext(null);

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {

    const { documentId } = useParams(); // get document id from route
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        if (documentId) {
            const newSocket = initiateSocket(documentId); // initialise socket
            setSocket(newSocket);
        }

        return () => {
            disconnectSocket(); // cleanup when component unmounts
        };
    }, [documentId]); // when document id changes the useEffect reruns

    return (
        <SocketContext.Provider value={socket}>
            {children} {/* render children components that will usse socket*/}
        </SocketContext.Provider>
    );
};
