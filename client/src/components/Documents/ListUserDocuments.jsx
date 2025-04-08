import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import "../../styles/ListUserDocuments.css";

const ListUserDocuments = () => {
    const [ownedDocuments, setOwnedDocuments] = useState([]);
    const [sharedDocuments, setSharedDocuments] = useState([]);
    const [listSelection, setListSelection] = useState("ownedDocuments");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [actionStatus, setActionStatus] = useState({ type: "", message: "" });
    
    const navigate = useNavigate();

    const fetchDocuments = async () => {
        setLoading(true);
        try {
            const response = await fetch("http://localhost:3001/api/documents/list", {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("token")}`,
                    "Content-Type": "application/json"
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            setOwnedDocuments(data.ownedDocuments || []);
            setSharedDocuments(data.sharedDocuments || []);
            setError("");
        } catch (error) {
            setError(`Failed to fetch documents: ${error.message}`);
            console.error("Error:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDocuments();
    }, []);

    // Clear action status after 3 seconds
    useEffect(() => {
        if (actionStatus.message) {
            const timer = setTimeout(() => {
                setActionStatus({ type: "", message: "" });
            }, 3000);
            
            return () => clearTimeout(timer);
        }
    }, [actionStatus]);

    // Get current documents based on selection
    const currentDocuments = listSelection === "ownedDocuments" 
        ? ownedDocuments 
        : sharedDocuments;

    // Function to handle tab switching
    const handleTabChange = (tab) => {
        setListSelection(tab);
    };

    // Function to delete a document - UPDATED to use POST endpoint
    const handleDeleteDocument = async (e, documentId) => {
        e.preventDefault(); // Prevent navigation
        e.stopPropagation(); // Stop event bubbling
        
        // Confirm deletion
        const confirmDelete = window.confirm("Are you sure you want to delete this document? This action cannot be undone.");
        if (!confirmDelete) return;
        
        try {
            // Changed from DELETE to POST to match the route in documentRoutes.js
            const response = await fetch(`http://localhost:3001/api/documents/delete/${documentId}`, {
                method: "POST",  // This matches your route definition
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("token")}`,
                    "Content-Type": "application/json"
                }
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to delete document");
            }
            
            // Update the document list
            setOwnedDocuments(ownedDocuments.filter(doc => doc.documentId !== documentId));
            setActionStatus({ type: "success", message: "Document deleted successfully" });
        } catch (error) {
            console.error("Error deleting document:", error);
            setActionStatus({ type: "error", message: error.message });
        }
    };

    // Function to leave a shared document
    const handleLeaveDocument = async (e, documentId) => {
        e.preventDefault(); // Prevent navigation
        e.stopPropagation(); // Stop event bubbling
        
        // Confirm leaving
        const confirmLeave = window.confirm("Are you sure you want to leave this document? You'll need to be re-invited to access it again.");
        if (!confirmLeave) return;
        
        try {
            const response = await fetch(`http://localhost:3001/api/documents/${documentId}/leave`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("token")}`,
                    "Content-Type": "application/json"
                }
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to leave document");
            }
            
            // Update the document list
            setSharedDocuments(sharedDocuments.filter(doc => doc.documentId !== documentId));
            setActionStatus({ type: "success", message: "You've left the document" });
        } catch (error) {
            console.error("Error leaving document:", error);
            setActionStatus({ type: "error", message: error.message });
        }
    };

    const handleDocumentClick = (documentId) => {
        navigate(`/document/${documentId}`);
    };

    return (
        <div className='documents-container'>
            {/* Tab Navigation */}
            <div className="document-tabs">
                <button 
                    className={`tab-button ${listSelection === "ownedDocuments" ? "active" : ""}`}
                    onClick={() => handleTabChange("ownedDocuments")}
                >
                    My Documents {ownedDocuments.length > 0 && `(${ownedDocuments.length})`}
                </button>
                <button 
                    className={`tab-button ${listSelection === "sharedDocuments" ? "active" : ""}`}
                    onClick={() => handleTabChange("sharedDocuments")}
                >
                    Shared With Me {sharedDocuments.length > 0 && `(${sharedDocuments.length})`}
                </button>
            </div>

            {/* Status Messages */}
            {actionStatus.message && (
                <div className={`action-status ${actionStatus.type}`}>
                    {actionStatus.message}
                </div>
            )}

            {/* Loading & Error Handling */}
            {loading && <p className="loading-message">Loading documents...</p>}
            {error && <p className="error-message">{error}</p>}

            {/* Display Documents */}
            {!loading && !error && (
                <>
                    {currentDocuments.length === 0 ? (
                        <p className="empty-state">
                            {listSelection === "ownedDocuments" 
                                ? "You don't have any documents yet. Create one to get started!"
                                : "No documents have been shared with you yet."
                            }
                        </p>
                    ) : (
                        <div className='documents-list'>
                            {currentDocuments.map((doc) => (
                                <div key={doc._id} className='document-item-wrapper'>
                                    <div 
                                        className='document-item'
                                        onClick={() => handleDocumentClick(doc.documentId)}
                                    >
                                        <h3 className='document-title'>{doc.documentTitle}</h3>
                                        <p className='document-date'>
                                            Last Updated: {new Date(doc.updatedAt).toLocaleString('en-GB', {
                                                day: 'numeric',
                                                month: 'numeric',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </p>
                                        
                                        {/* Delete/Leave button */}
                                        {listSelection === "ownedDocuments" ? (
                                            <button 
                                                className="document-delete-btn"
                                                onClick={(e) => handleDeleteDocument(e, doc.documentId)}
                                                title="Delete document"
                                            >
                                                <FontAwesomeIcon icon={faTrash} />
                                            </button>
                                        ) : (
                                            <button 
                                                className="document-leave-btn"
                                                onClick={(e) => handleLeaveDocument(e, doc.documentId)}
                                                title="Leave document"
                                            >
                                                <FontAwesomeIcon icon={faSignOutAlt} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default ListUserDocuments;