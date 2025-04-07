// 

import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import Editor from "../components/Editor/Editor";
import Chat from "../components/Editor/Chat";
import DocumentTitle from "../components/Editor/DocumentTitle";
import UserList from "../components/Editor/UserList";
import CollaboratorSearch from "../components/Editor/CollaboratorSearch";
import Export from "../components/Editor/Export";
import VersionHistory from '../components/Editor/VersionHistory';
import socket from "../socket/socket";
import "../styles/DocumentPage.css";

export default function DocumentPage() {
    const {documentId} = useParams();
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [colour, setColour] = useState("");
    const [activeUsers, setActiveUsers] = useState([]);
    const [showCollaboratorSearch, setShowCollaboratorSearch] = useState(false);
    const [documentLoading, setDocumentLoading] = useState(true);
    const [error, setError] = useState("");
    const collaboratorRef = useRef(null);
    const quillRef = useRef(null);
    const titleRef = useRef(null);

    useEffect(() => {
        const verifyDocument = async () => {
            try {
                setDocumentLoading(true);
                setError("");

                const token = localStorage.getItem("token");
                if (!token) {
                    navigate("/login");
                    return;
                }
                
                const response = await fetch(`http://localhost:3001/api/documents/verify/${documentId}`, {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                });
                
                if (response.status === 404) {
                    navigate("/document-not-found", { state: { documentId } });
                    return;
                }
                
                if (!response.ok) {
                    throw new Error(`Error: ${response.statusText}`);
                }
                
                // Document exists, proceed with socket setup
                setupSocketConnection();
                
            } catch (error) {
                console.error("Error verifying document:", error);
                setError("Failed to load document");   
            } finally {
                setDocumentLoading(false);
            }
        };
        
        verifyDocument();
    }, [documentId, navigate]);

    const setupSocketConnection = () => {
        // Get username from token
        const token = localStorage.getItem("token");
        if (token) {
            try {
                const decoded = jwtDecode(token);
                setUsername(decoded.username || "Anonymous");
                setColour(decoded.colour || "3498db");

                // connect to websocket and join document room
                if (!socket.connected) {
                    socket.connect();
                }
                
                socket.on("documentError", (error) => {
                    if(error.code === "DOCUMENT_NOT_FOUND") {
                        navigate("/document-not-found", { state: { documentId } });
                    }
                });

                socket.emit("joinDocumentRoom", { 
                    documentId, 
                    username: decoded.username || "Anonymous", 
                    colour: decoded.colour || "3498db" 
                });

            } catch (error) {
                console.error("Error decoding token:", error);
            }
        }

        socket.on("updateUsers", (users) => {
            console.log("Active users:", users);
            setActiveUsers(users);
        });

        return () => {
            socket.disconnect();
            socket.off("leaveDocumentRoom"); // clean up listener
        };
    };

    const toggleCollaboratorSearch = () => {
        setShowCollaboratorSearch(prev => !prev);
    }

    // Close collaborator search when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (collaboratorRef.current && 
                !collaboratorRef.current.contains(event.target) && 
                !event.target.closest('.add-collaborator-btn')) {
                setShowCollaboratorSearch(false);
            }
        }
        
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // Show loading or error state
    if (documentLoading) {
        return (
            <div className="document-page">
                <div className="document-loading">
                    <p>Loading document...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="document-page">
                <div className="document-error">
                    <p>{error}</p>
                    <button onClick={() => navigate("/")}>Return to Home</button>
                </div>
            </div>
        );
    }

    return (
        <div className="document-page">
            {/* New refactored header */}
            <div className="document-header">

                <div className="brand-container">
                    <Link to="/" className="brand-link">
                        <span className="brand-text">CoLab</span>
                    </Link>
                </div>

                <div className="header-left">                    
                    <div className="top-row">
                        <div className="document-title-container">
                            <DocumentTitle documentId={documentId} username={username} titleRef={titleRef}/>
                        </div>
                    </div>
                    <div className="bottom-row">
                        <div className="document-export-container">
                            <Export quillRef={quillRef} titleRef={titleRef}/>
                        </div>
                        <div className="document-version-container">
                            <VersionHistory documentId={documentId} quillRef={quillRef} />
                        </div>
                    </div>
                </div>
                
                <div className="header-right">
                    <div className="user-list-container">
                        <UserList users={activeUsers} />
                    </div>
                    
                    <button 
                        className="add-collaborator-btn"
                        onClick={toggleCollaboratorSearch}
                    >
                        + Add Collaborator
                    </button>
                </div>
                
                <div className="user-icon-container">
                    <div className="user-icon" style={{ backgroundColor: colour }}>
                        {username.charAt(0).toUpperCase()}
                    </div>
                </div>
                
            </div>
            
            {/* Collaborator search panel */}
            <div 
                className={`collaborator-search-container ${showCollaboratorSearch ? 'open' : ''}`}
                ref={collaboratorRef}
            >
                <div className="panel-header">
                    <h3>Add Collaborators</h3>
                    <button 
                        className="close-panel-btn" 
                        onClick={() => setShowCollaboratorSearch(false)}
                    >
                        ×
                    </button>
                </div>
                <CollaboratorSearch documentId={documentId} />
            </div>
            
            {/* Content area */}
            <div className="content-container">
                <div className="editor-wrapper">
                    <Editor documentId={documentId} username={username} colour={colour} quillRef={quillRef} />
                </div>
            </div>
            
            {/* Chat component */}
            <Chat documentId={documentId} username={username} />
        </div>
    );
}