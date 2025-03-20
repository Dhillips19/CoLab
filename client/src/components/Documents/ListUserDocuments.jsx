import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import "../../css/ListUserDocuments.css";

const ListUserDocuments = () => {
    const [documents, setDocuments] = useState([]);
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
            setDocuments(data);
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

    return (
        <div className='documents-container'>
            <h2>Your Documents</h2>

            {/* Loading & Error Handling */}
            {loading && <p>Loading...</p>}
            {error && <p>{error}</p>}

            {/* Display Documents */}
            {documents.length === 0 && !loading ? (
                <p>No documents found.</p>
            ) : (
                <div className='documents-list'>
                    {documents.map((doc) => (
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
        </div>
    );
};

export default ListUserDocuments;

