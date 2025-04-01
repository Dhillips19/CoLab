// import React, { useState, useEffect } from "react";
// import { useParams } from "react-router-dom";
// import { jwtDecode } from "jwt-decode";
// import Editor from "../components/Editor/Editor";
// import NavBar from "../components/NavBar/NavBar";
// import Chat from "../components/Editor/Chat";
// import DocumentTitle from "../components/Editor/DocumentTitle";
// import UserList from "../components/Editor/UserList";
// import CollaboratorSearch from "../components/Editor/CollaboratorSearch";
// import "../css/DocumentPage.css";
// import socket from "../socket/socket";

// export default function DocumentPage() {
//     const {documentId} = useParams();
//     const [username, setUsername] = useState("");
//     const [colour, setColour] = useState("");
//     const [activeUsers, setActiveUsers] = useState();
//     const [showCollaboratorSearch, setShowCollaboratorSearch] = useState(false);

//     useEffect(() => {
//         // Get username from token
//         const token = localStorage.getItem("token");
//         if (token) {
//             try {
//                 const decoded = jwtDecode(token);
//                 console.log("Decoded token:", decoded);
//                 setUsername(decoded.username || "Anonymous");
//                 setColour(decoded.colour || "3498db");

//                 // connect to websocket and join document room
//                 if (!socket.connected) {
//                     socket.connect();
//                 }

//                 // socket.emit("joinDocumentRoom", documentId);
//                 socket.emit("joinDocumentRoom", { documentId, username: decoded.username || "Anonymous" , colour: decoded.colour || "3498db" });

//             } catch (error) {
//                 console.error("Error decoding token:", error);
//             }
//         }

//         socket.on("updateUsers", (users) => {
//             console.log("Active users:", users);
//             setActiveUsers(users);
//         });

//         return () => {
//             socket.disconnect();
//             socket.off("leaveDocumentRoom"); // clean up listener
//         };
//     }, [documentId]);

//     const toggleCollaboratorSearch = () => {
//         setShowCollaboratorSearch(prev => !prev);
//     }

//     return (
//         <div className="document-page">
//             <NavBar />
            
//             <div className="document-header">
//                 <div className="header-left-section">
//                     <DocumentTitle documentId={documentId} username={username}/>
//                 </div>
//                 <div className="header-right-section">
//                     <UserList users={activeUsers} />
                
//                     <button 
//                         className="add-collaborator-btn"
//                         onClick={toggleCollaboratorSearch}
//                     >
//                         {showCollaboratorSearch ? 'Hide Collaborator Search' : '+ Add Collaborator'}
//                     </button>
//                 </div>
//             </div>
            
//             <div className="content-container">
//                 <div className={`editor-wrapper ${showCollaboratorSearch ? 'panel-open' : ''}`}>
//                     <Editor documentId={documentId} username={username} />
//                 </div>

//                 <div className={`collaborator-search-container ${showCollaboratorSearch ? 'open' : ''}`}>
//                     <div className="panel-header">
//                         <button className="close-panel-btn" onClick={toggleCollaboratorSearch}>Close</button>
//                     </div>
//                     <CollaboratorSearch documentId={documentId} />
//                 </div>
//             </div>
            

//             <Chat documentId={documentId} username={username} />
//         </div>
//     );
// }

// Add a ref for handling clicks outside the dropdown
import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import Editor from "../components/Editor/Editor";
import NavBar from "../components/NavBar/NavBar";
import Chat from "../components/Editor/Chat";
import DocumentTitle from "../components/Editor/DocumentTitle";
import UserList from "../components/Editor/UserList";
import CollaboratorSearch from "../components/Editor/CollaboratorSearch";
import "../css/DocumentPage.css";
import socket from "../socket/socket";

export default function DocumentPage() {
    const {documentId} = useParams();
    const [username, setUsername] = useState("");
    const [colour, setColour] = useState("");
    const [activeUsers, setActiveUsers] = useState();
    const [showCollaboratorSearch, setShowCollaboratorSearch] = useState(false);
    const collaboratorRef = useRef(null); // Add this ref

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

    useEffect(() => {
        // Get username from token
        const token = localStorage.getItem("token");
        if (token) {
            try {
                const decoded = jwtDecode(token);
                console.log("Decoded token:", decoded);
                setUsername(decoded.username || "Anonymous");
                setColour(decoded.colour || "3498db");

                // connect to websocket and join document room
                if (!socket.connected) {
                    socket.connect();
                }

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
    }, [documentId]);

    const toggleCollaboratorSearch = () => {
        setShowCollaboratorSearch(prev => !prev);
    }

    return (
        <div className="document-page">
            <NavBar />
            
            <div className="document-header">
                <div className="header-left-section">
                    <DocumentTitle documentId={documentId} username={username}/>
                </div>
                <div className="header-right-section">
                    <UserList users={activeUsers} />
                
                    <button 
                        className="add-collaborator-btn"
                        onClick={toggleCollaboratorSearch}
                    >
                        {showCollaboratorSearch ? 'Hide' : '+ Add Collaborator'}
                    </button>
                    
                    {/* Dropdown collaborator search */}
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
                </div>
            </div>
            
            <div className="content-container">
                <div className="editor-wrapper">
                    <Editor documentId={documentId} username={username} />
                </div>
            </div>
            
            <Chat documentId={documentId} username={username} />
        </div>
    );
}