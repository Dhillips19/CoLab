import React from 'react'
import { useNavigate } from 'react-router-dom';

// react create document button component
const CreateDocument = () => {

    const navigate = useNavigate();

    // function to handle create document
    const handleCreateDocument = async () => {
        try {
            const response = await fetch('http://localhost:3001/api/documents/create', { // use create api
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem("token")}` 
                },
                body: JSON.stringify({})
            });

            // store api response
            const data = await response.json();

            // ensure response was okay
            if (response.ok) {
                navigate(`/document/${data.documentId}`); // redirect user to document on success
            } else {
                alert(`Error: ${data.error}`); // display error if failure
            }
            // display error if encountered
        } catch (error) {
            console.error("Error creating document:", error);
            alert("Failed to create document.");
        }
    };
    // display create document button
    return (
        <div>
            <button onClick={handleCreateDocument}>Create Document</button> 
        </div>
    );
}

// export component for use
export default CreateDocument;
