import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import "./ListUserDocuments.css";

// react component to list user documents
const ListUserDocuments = () => {

    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const navigate = useNavigate();

    // fetch user documents
    useEffect(() => {
        const fetchDocuments = async () => {
            try {
                const response = await fetch("http://localhost:3001/api/documents/list", { // use list api
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${localStorage.getItem("token")}`,
                    },
                });

                // store api response
                const data = await response.json();

                // ensure response was okay
                if (response.ok) {
                    setDocuments(data); // set documents
                } else {
                    setError(`Error: ${data.error}`); // display error if failure
                }
            // display error if encountered
            } catch (error) {
                console.error("Error fetching documents:", error);
                setError("Failed to fetch documents.");
            } finally {
                setLoading(false);
            }
        };

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
                        <div key={doc._id} className='document-item' onClick={() => navigate(`/document/${doc.documentId}`)}>
                            <h3 className='document-title'>{doc.documentTitle}</h3>
                            <p className='document-date'>
                                Last Updated: {new Date(doc.updatedAt).toLocaleString()}
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ListUserDocuments;

