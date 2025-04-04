import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import NavBar from '../components/NavBar/NavBar';
import CreateDocument from '../components/Documents/CreateDocument';
import '../css/DocumentNotFound.css';

const DocumentNotFound = () => {
    const location = useLocation();
    const documentId = location.state?.documentId || 'unknown';

    return (
        <div className="not-found-container">
            <NavBar />
            <div className="not-found-content">
                <h1>Document Not Found</h1>
                <p>The document with ID <code>{documentId}</code> does not exist.</p>
                <div className="not-found-options">
                    <Link to="/" className="return-home">
                        Return to Home
                    </Link>
                    <div className="create-new-document">
                        <CreateDocument/>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DocumentNotFound;