import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserPlus, faUserMinus, faSearch, faTimes } from '@fortawesome/free-solid-svg-icons';
import '../../styles/ManageCollaborators.css';

const ManageCollaborators = ({ documentId }) => {
    // State for search/add functionality
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    
    // State for current collaborators (remove functionality)
    const [collaborators, setCollaborators] = useState([]);
    
    // UI state management
    const [activeTab, setActiveTab] = useState('add');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    // Fetch current collaborators when component mounts or document changes
    useEffect(() => {
        if (documentId && activeTab === 'remove') {
            fetchCollaborators();
        }
    }, [documentId, activeTab]);

    // Function to fetch current collaborators
    const fetchCollaborators = async () => {
        setLoading(true);
        try {
            const response = await fetch(`http://localhost:3001/api/editor/${documentId}/collaborators`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem("token")}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch collaborators');
            }

            const data = await response.json();
            setCollaborators(data);
        } catch (error) {
            console.error('Error fetching collaborators:', error);
            setError('Failed to load collaborators');
        } finally {
            setLoading(false);
        }
    };

    // Handle search for adding collaborators
    const handleSearch = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        
        try {
            if (!searchTerm.trim()) {
                setError('Please enter a search term');
                return;
            }

            setLoading(true);
            const response = await fetch(`http://localhost:3001/api/editor/search?term=${encodeURIComponent(searchTerm)}&documentId=${documentId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem("token")}`
                }
            });

            const data = await response.json();
            
            if (response.ok) {
                setSearchResults(data);
                if (data.length === 0) {
                    setError('No users found');
                }
            } else {
                setError(data.message || 'Failed to search users');
            }
        } catch (error) {
            console.error('Search error:', error);
            setError('Failed to search users');
        } finally {
            setLoading(false);
        }
    };

    // Add collaborator to document
    const addCollaborator = async (userId) => {
        setError('');
        setSuccess('');
        
        try {
            setLoading(true);
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
                setSuccess('Collaborator added successfully');
                setSearchResults(results => results.filter(user => user._id !== userId));
                setTimeout(() => setSuccess(''), 3000);
            } else {
                setError(data.message || 'Failed to add collaborator');
            }
        } catch (error) {
            console.error('Error adding collaborator:', error);
            setError('Failed to add collaborator');
        } finally {
            setLoading(false);
        }
    };

    // Remove collaborator from document
    const removeCollaborator = async (userId) => {
        setError('');
        setSuccess('');
        
        try {
            setLoading(true);
            const response = await fetch(`http://localhost:3001/api/editor/${documentId}/collaborators/${userId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem("token")}`
                }
            });
            
            if (response.ok) {
                setSuccess('Collaborator removed successfully');
                // Update the collaborators list
                setCollaborators(collaborators.filter(user => user._id !== userId));
                setTimeout(() => setSuccess(''), 3000);
            } else {
                const data = await response.json();
                setError(data.message || 'Failed to remove collaborator');
            }
        } catch (error) {
            console.error('Error removing collaborator:', error);
            setError('Failed to remove collaborator');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="manage-collaborators">
            {/* Tab Navigation */}
            <div className="collaborator-tabs">
                <button 
                    className={`tab-button ${activeTab === 'add' ? 'active' : ''}`} 
                    onClick={() => setActiveTab('add')}
                >
                    <FontAwesomeIcon icon={faUserPlus} /> Add Collaborators
                </button>
                <button 
                    className={`tab-button ${activeTab === 'remove' ? 'active' : ''}`} 
                    onClick={() => {
                        setActiveTab('remove');
                        fetchCollaborators();
                    }}
                >
                    <FontAwesomeIcon icon={faUserMinus} /> Remove Collaborators
                </button>
            </div>

            {/* Status Messages */}
            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            {/* Add Collaborators Panel */}
            {activeTab === 'add' && (
                <div className="collaborator-panel">
                    <form onSubmit={handleSearch} className="search-form">
                        <div className="search-input-container">
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search users by username or email"
                                className="search-input"
                                disabled={loading}
                            />
                            <FontAwesomeIcon icon={faSearch} className="search-icon" />
                        </div>
                        <button type="submit" className="action-button" disabled={loading}>
                            Search
                        </button>
                    </form>

                    <div className="results-list">
                        {searchResults.length > 0 ? (
                            searchResults.map(user => (
                                <div key={user._id} className="user-item">
                                    <div className="user-info">
                                        <span className="username">{user.username}</span>
                                        <span className="email">{user.email}</span>
                                    </div>
                                    <button 
                                        onClick={() => addCollaborator(user._id)}
                                        className="action-button"
                                        disabled={loading}
                                    >
                                        Add
                                    </button>
                                </div>
                            ))
                        ) : (
                            <div className="empty-message">
                                {loading ? 'Searching...' : 'Search for users to add'}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Remove Collaborators Panel */}
            {activeTab === 'remove' && (
                <div className="collaborator-panel">
                    <div className="panel-header">
                        <h4>Current Collaborators</h4>
                    </div>
                    
                    <div className="results-list">
                        {loading ? (
                            <div className="loading-message">Loading collaborators...</div>
                        ) : collaborators.length > 0 ? (
                            collaborators.map(user => (
                                <div key={user._id} className="user-item">
                                    <div className="user-info">
                                        <span className="username">{user.username}</span>
                                        <span className="email">{user.email}</span>
                                    </div>
                                    <button 
                                        onClick={() => removeCollaborator(user._id)}
                                        className="action-button remove"
                                        disabled={loading}
                                    >
                                        <FontAwesomeIcon icon={faTimes} /> Remove
                                    </button>
                                </div>
                            ))
                        ) : (
                            <div className="empty-message">No collaborators yet</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageCollaborators;