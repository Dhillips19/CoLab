// import React, { useState, useEffect } from 'react'
// import { useNavigate } from 'react-router-dom';
// import "../../css/ListUserDocuments.css";

// const ListUserDocuments = () => {
//     const [ownedDocuments, setOwnedDocuments] = useState([]);
//     const [sharedDocuments, setSharedDocuments] = useState([]);
//     const [listSelection, setListSelection] = useState("ownedDocuments");
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState("");
    
//     const navigate = useNavigate();

//     const fetchDocuments = async () => {
//         setLoading(true);
//         try {
//             const response = await fetch("http://localhost:3001/api/documents/list", {
//                 method: "GET",
//                 headers: {
//                     "Authorization": `Bearer ${localStorage.getItem("token")}`,
//                     "Content-Type": "application/json"
//                 },
//             });

//             if (!response.ok) {
//                 throw new Error(`HTTP error! status: ${response.status}`);
//             }
            
//             const data = await response.json();
//             setOwnedDocuments(data.ownedDocuments);
//             setSharedDocuments(data.sharedDocuments);
//             setError("");
//         } catch (error) {
//             setError(`Failed to fetch documents: ${error.message}`);
//             console.error("Error:", error);
//         } finally {
//             setLoading(false);
//         }
//     };

//     useEffect(() => {
//         fetchDocuments();
//     }, []);

//     return (
//         <div className='documents-container'>
//             <h2>Your Documents</h2>

//             {/* Loading & Error Handling */}
//             {loading && <p>Loading...</p>}
//             {error && <p>{error}</p>}

//             {/* Display Documents */}
//             {documents.length === 0 && !loading ? (
//                 <p>No documents found.</p>
//             ) : (
//                 <div className='documents-list'>
//                     {documents.map((doc) => (
//                         <a
//                             key={doc._id}
//                             href={`/document/${doc.documentId}`}
//                             className='document-item'
//                         >
//                             <h3 className='document-title'>{doc.documentTitle}</h3>
//                             <p className='document-date'>
//                                 Last Updated: {new Date(doc.updatedAt).toLocaleString()}
//                             </p>
//                         </a>
//                     ))}
//                 </div>
//             )}
//         </div>
//     );
// };

// export default ListUserDocuments;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import "../../css/ListUserDocuments.css";

const ListUserDocuments = () => {
    const [ownedDocuments, setOwnedDocuments] = useState([]);
    const [sharedDocuments, setSharedDocuments] = useState([]);
    const [listSelection, setListSelection] = useState("ownedDocuments");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    
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

    // Get current documents based on selection
    const currentDocuments = listSelection === "ownedDocuments" 
        ? ownedDocuments 
        : sharedDocuments;

    // Function to handle tab switching
    const handleTabChange = (tab) => {
        setListSelection(tab);
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
                                <a
                                    key={doc._id}
                                    href={`/document/${doc.documentId}`}
                                    className='document-item'
                                >
                                    <h3 className='document-title'>{doc.documentTitle}</h3>
                                    <p className='document-date'>
                                        Last Updated: {new Date(doc.updatedAt).toLocaleString()}
                                    </p>
                                </a>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default ListUserDocuments;