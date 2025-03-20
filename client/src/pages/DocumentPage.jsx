import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import Editor from "../components/Editor/Editor";
import NavBar from "../components/NavBar/NavBar";
import Chat from "../components/Editor/Chat";
import DocumentTitle from "../components/Editor/DocumentTitle";
import CollaboratorSearch from "../components/Editor/CollaboratorSearch";
import "../css/DocumentPage.css";
import socket from "../socket/socket";

export default function DocumentPage() {
    const {documentId} = useParams();
    const [username, setUsername] = useState("");
    const [showCollaboratorSearch, setShowCollaboratorSearch] = useState(false);

    useEffect(() => {
        // Get username from token
        const token = localStorage.getItem("token");
        if (token) {
            try {
                const decoded = jwtDecode(token);
                setUsername(decoded.username || "Anonymous");
            } catch (error) {
                console.error("Error decoding token:", error);
            }
        }

        // connect to websocket and join document room
        if (!socket.connected) {
            socket.connect();
        }
        socket.emit("joinDocumentRoom", documentId);
        console.log(`User ${username} joined document room ${documentId}`);

        return () => {
            socket.emit("leaveDocumentRoom", documentId);

            if (socket.active)  {
                socket.disconnect();
            }
            socket.off("joinDocumentRoom"); // clean up listener
            socket.off("leaveDocumentRoom"); // clean up listener
        };
    }, [documentId]);

    return (
        <div className="document-page">
            <NavBar />
            
            <div className="document-content">
                <div className="document-header">
                    <DocumentTitle documentId={documentId} username={username}/>
                    
                    <button 
                        className="add-collaborator-btn"
                        onClick={() => setShowCollaboratorSearch(!showCollaboratorSearch)}
                    >
                        {showCollaboratorSearch ? 'Hide Collaborator Search' : '+ Add Collaborator'}
                    </button>
                </div>
                
                {showCollaboratorSearch && (
                    <div className="collaborator-search-container">
                        <CollaboratorSearch documentId={documentId} />
                    </div>
                )}
                
                <div className="editor-wrapper">
                    <Editor documentId={documentId} username={username} />
                </div>
            </div>
            
            <Chat documentId={documentId} username={username} />
        </div>
    );
}