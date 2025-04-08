import React, { useState, useEffect } from 'react';
import socket from "../../socket/socket.js";
import '../../styles/VersionHistory.css';

const VersionHistory = ({ documentId, quillRef }) => {
    const [versions, setVersions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showPanel, setShowPanel] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    // Fetch versions when panel is opened
    useEffect(() => {
        if (showPanel) {
            fetchVersions();
        }
    }, [showPanel]);

    // Fetch all versions for this document
    const fetchVersions = async () => {
        if (!documentId) return;
        
        setLoading(true);
        try {
            const response = await fetch(`http://localhost:3001/api/documents/${documentId}/get-versions`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            if (!response.ok) {
                throw new Error('Failed to load versions');
            }
            
            const data = await response.json();
            setVersions(data.versions || []);
            
        } catch (error) {
            console.error('Error fetching versions:', error);
            setError('Could not load version history');
        } finally {
            setLoading(false);
        }
    };

    // Save current document state as a version
    const saveVersion = async () => {
        const versionName = prompt('Enter a name for this version:');
        if (!versionName) return; // User canceled
        
        try {
            const response = await fetch(`http://localhost:3001/api/documents/${documentId}/save-version`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ name: versionName })
            });
            
            if (!response.ok) {
                throw new Error('Failed to save version');
            }
            
            setSuccess('Version saved successfully');
            
            // Refresh the versions list
            fetchVersions();
            
            // Clear success message after 3 seconds
            setTimeout(() => setSuccess(null), 3000);
            
        } catch (error) {
            console.error('Error saving version:', error);
            setError('Failed to save version');
            setTimeout(() => setError(null), 3000);
        }
    };

    // Restore document to a specific version
    const restoreVersion = async (versionNum) => {
        const confirmRestore = window.confirm(
            'Restoring to a previous version will save your current changes as a new version. Continue?'
        );
        
        if (!confirmRestore) return;
        
        try {
            const response = await fetch(`http://localhost:3001/api/documents/${documentId}/versions/${versionNum}/restore`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            if (!response.ok) {
                throw new Error('Failed to restore version');
            }
            
            socket.emit('requestLatestState', documentId);

            setSuccess('Document restored successfully');
            setShowPanel(false); // Close the panel after restoring
            
            
        } catch (error) {
            console.error('Error restoring version:', error);
            setError('Failed to restore version');
            setTimeout(() => setError(null), 3000);
        }
    };

    return (
        <div className="version-history-container">
            <button 
                className="version-history-button"
                onClick={() => setShowPanel(!showPanel)}
            >
                {showPanel ? "Hide History" : "Version History"}
            </button>
            
            {showPanel && (
                <div className="version-panel">
                    <div className="panel-header">
                        <h3>Version History</h3>
                        <button className="close-btn" onClick={() => setShowPanel(false)}>x</button>
                    </div>
                    
                    {error && <div className="error-message">{error}</div>}
                    {success && <div className="success-message">{success}</div>}
                    
                    <div className="panel-content">
                        <button onClick={saveVersion} className="save-version-btn">
                            Save Current Version
                        </button>
                        
                        {loading ? (
                            <div className="loading">Loading versions...</div>
                        ) : versions.length === 0 ? (
                            <div className="empty-message">No saved versions</div>
                        ) : (
                            <ul className="versions-list">
                                {versions.map(version => (
                                    <li key={version.versionNum} className="version-item">
                                        <div className="version-info">
                                            <span className="version-name">{version.name}</span>
                                            <span className="version-date">
                                                {new Date(version.timestamp).toLocaleString()}
                                            </span>
                                        </div>
                                        <button 
                                            onClick={() => restoreVersion(version.versionNum)}
                                            className="restore-btn"
                                        >
                                            Restore
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default VersionHistory;