import React, { useState, useEffect } from 'react';
import socket from '../../socket/socket';
import '../../css/DocumentTitle.css';

const DocumentTitle = ({ documentId }) => {
    const [title, setTitle] = useState('Untitled Document');
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        if (!socket) return;

        socket.on('updateTitle', (newTitle) => {
            console.log(`Received title update: ${newTitle}`);
            setTitle(newTitle);
        });

        return () => {
            socket.off('updateTitle');
        };
    }, []);

    const handleChange = (e) => {
        setTitle(e.target.value);
    };

    const handleBlur = () => {
        setIsEditing(false);
            socket.emit('updateTitle', { documentId, title });
    };
    
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleBlur();
        };
    };

    return (
        <div className="document-title-container">
            {isEditing ? (
                <input type="text" value={title} onChange={handleChange} onBlur={handleBlur} 
                       onKeyDown={handleKeyDown} className="title-input" autoFocus/>
            ) : (
                <h1 className="title-display" onClick={() => setIsEditing(true)}>{title}</h1>
            )}
        </div>
    );
};

export default DocumentTitle;
