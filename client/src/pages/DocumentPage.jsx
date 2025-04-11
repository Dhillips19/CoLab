import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import Editor from "../components/Editor/Editor";
import Chat from "../components/Editor/Chat";
import DocumentTitle from "../components/Editor/DocumentTitle";
import UserList from "../components/Editor/UserList";
import ManageCollaborators from "../components/Editor/ManageCollaborators"
import Export from "../components/Editor/Export";
import socket from "../socket/socket";
import "../styles/DocumentPage.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons";

export default function DocumentPage() {
    const {documentId} = useParams();
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [isDocumentOwner, setIsDocumentOwner] = useState(false);
    const [colour, setColour] = useState("");
    const [activeUsers, setActiveUsers] = useState([]);
    const [showManageCollaborators, setShowManageCollaborators] = useState(false);
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

                // check if user is logged in
                const token = localStorage.getItem("token");
                if (!token) {
                    navigate("/login");
                    return;
                }
                
                // Verify document ID and check if user has access
                const response = await fetch(`http://localhost:3001/api/documents/verify/${documentId}`, {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                });
                
                // if document does not exist
                if (response.status === 404) {
                    navigate("/document-not-found", { state: { documentId } });
                    return;
                }
                
                // if document exists but user does not have access
                if (response.status === 403) {
                    setError("You don't have permission to access this document.");
                    return;
                }
                
                // throw error if response is not ok
                if (!response.ok) {
                    throw new Error(`Error: ${response.statusText}`);
                }

                // get document data to store owner
                const data = await response.json();
                const isOwner = data.owner;
                
                // set is owner state
                setIsDocumentOwner(isOwner);
                
                const setupSocketConnection = () => {
                    // Get username from token
                    const token = localStorage.getItem("token");
                    if (token) {
                        try {
                            const decoded = jwtDecode(token);
                            setUsername(decoded.username || "Anonymous");
                            setColour(decoded.colour || "3498db");
            
                            // connect to websocket and join document room
                            if (socket.connected) {
                                console.log("Socket already connected, forcing reconnection");
                                socket.disconnect();
                                socket.connect();
                            } else if (!socket.connected) {
                                console.log("Socket not connected, connecting now");
                                socket.connect();
                            }
            
                            socket.off("documentError");
                            socket.off("updateUsers");
                            socket.off("initialState");
                            socket.off("updateTitle");
                            socket.off("loadMessages");
                            
                            socket.on("documentError", (error) => {
                                if(error.code === "DOCUMENT_NOT_FOUND") {
                                    navigate("/document-not-found", { state: { documentId } });
                                } else if(error.code === "ACCESS_DENIED") {
                                    setError("You don't have permission to access this document");
                                }
                            });
            
                            socket.emit("joinDocumentRoom", { 
                                documentId, 
                                username: decoded.username, 
                                colour: decoded.colour
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
                        socket.emit("leaveDocumentRoom", documentId);
                        socket.off("updateUsers");
                        socket.off("documentError");
                    };
                };
                
                // setup socket
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

    useEffect(() => {
        // This function runs when the user is about to leave the page
        const handleBeforeUnload = () => {
            console.log(`Page unloading, leaving document room: ${documentId}`);
            socket.emit("leaveDocumentRoom", documentId);
        };
    
        // Add the event listener for page unload
        window.addEventListener("beforeunload", handleBeforeUnload);
        
        // Clean up the event listener when component unmounts
        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
        };
    }, [documentId]);

    const leaveDocument = () => {
        socket.emit("leaveDocumentRoom", documentId);
    }

    const toggleCollaboratorSearch = () => {
        setShowManageCollaborators(prev => !prev);
    }

    // Close collaborator search when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (collaboratorRef.current && 
                !collaboratorRef.current.contains(event.target) && 
                !event.target.closest('.manage-collaborators-btn')) {
                setShowManageCollaborators(false);
            }
        }
        
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // show loading state
    if (documentLoading) {
        return (
            <div className="document-page">
                <div className="document-loading">
                    <p>Loading document...</p>
                </div>
            </div>
        );
    }

    // on document error, display the error and a return to home
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
                    <Link to="/" className="brand-link" onClick={leaveDocument}>
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
                    </div>
                </div>
                
                <div className="header-right">
                    <div className="user-list-container">
                        <UserList users={activeUsers.filter(user => user.username !== username)} />
                    </div>
                    
                    {isDocumentOwner && (
                        <button 
                            className="manage-collaborators-btn"
                            onClick={toggleCollaboratorSearch}
                        >
                            Manage Users
                        </button>
                    )}
                    
                </div>
                
                <div className="user-icon-container">
                    <div className="user-icon" style={{ backgroundColor: colour }}>
                    <FontAwesomeIcon icon={faUser} />
                    </div>
                </div>
                
            </div>
            
            {/* Collaborator search panel */}
            <div 
                className={`collaborator-management-container ${showManageCollaborators ? 'open' : ''}`}
                ref={collaboratorRef}
            >
                <div className="panel-header">
                    <h3>Manage Collaborators</h3>
                    <button 
                        className="close-panel-btn" 
                        onClick={() => setShowManageCollaborators(false)}
                    >
                        ×
                    </button>
                </div>
                <ManageCollaborators documentId={documentId} />
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