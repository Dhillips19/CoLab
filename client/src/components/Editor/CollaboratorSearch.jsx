import React, { useState } from 'react';
import '../../styles/CollaboratorSearch.css';

const CollaboratorSearch = ({ documentId }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Update the handleSearch function
    const handleSearch = async (e) => {
        e.preventDefault();
        try {
            // Add console.log for debugging
            console.log('Searching for:', searchTerm);

            if (!searchTerm.trim()) {
                setError('Please enter a search term');
                return;
            }

            // Add documentId to search query
            const response = await fetch(`http://localhost:3001/api/editor/search?term=${encodeURIComponent(searchTerm)}&documentId=${documentId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem("token")}`
                }
            });

            const data = await response.json();
            
            // Add console.log for debugging
            console.log('Search response:', data);

            if (response.ok) {
                setSearchResults(data);
                setError('');
                if (data.length === 0) {
                    setError('No users found');
                }
            } else {
                setError(data.message || 'Failed to search users');
            }
        } catch (error) {
            console.error('Search error:', error);
            setError('Failed to search users');
        }
    };

    // Add collaborator to document
    const addCollaborator = async (userId) => {
        try {
            const response = await fetch(`http://localhost:3001/api/editor/${documentId}/collaborators`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem("token")}`
                },
                body: JSON.stringify({ userId })
            });
            const data = await response.json();
            if (response.ok) {
                setSuccess(`Collaborator added successfully`);
                setSearchResults(results => results.filter(user => user._id !== userId));
                setTimeout(() => setSuccess(''), 3000);
            } else {
                setError(data.message);
            }
        } catch (error) {
            setError('Failed to add collaborator');
        }
    };

    return (
        <div className="collaborator-search">
            <form onSubmit={handleSearch} className="search-form">
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search users by username or email"
                    className="search-input"
                />
                <button type="submit" className="search-button">Search</button>
            </form>

            {error && <p className="error-message">{error}</p>}
            {success && <p className="success-message">{success}</p>}

            <div className="search-results">
                {searchResults.map(user => (
                    <div key={user._id} className="user-result">
                        <span>{user.username}</span>
                        <span>{user.email}</span>
                        <button 
                            onClick={() => addCollaborator(user._id)}
                            className="add-button"
                        >
                            Add
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CollaboratorSearch;