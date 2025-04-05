import React, { useState, useEffect, useRef } from 'react';
import socket from '../../socket/socket';
import '../../styles/DocumentTitle.css';

const DocumentTitle = ({ documentId, titleRef }) => {
    const [title, setTitle] = useState('Untitled Document');
    const [isEditing, setIsEditing] = useState(false);
    const [previousTitle, setPreviousTitle] = useState('Untitled Document');
    const inputRef = useRef(null);

    // Initialize the titleRef when component mounts
    useEffect(() => {
        if (titleRef) {
            titleRef.current = 'Untitled Document';
        }
    }, [titleRef]);

    useEffect(() => {
        if (!socket) return;

        socket.on('updateTitle', (newTitle) => {
            console.log(`Received title update: ${newTitle}`);
            setTitle(newTitle);
            setPreviousTitle(newTitle);
            if (titleRef) {
                titleRef.current = newTitle; // Update the titleRef with the new title
            }
        });

        return () => {
            socket.off('updateTitle');
        };
    }, [titleRef]);

    // Start editing - save previous title in case we need to revert
    const startEditing = () => {
        setPreviousTitle(title);
        setIsEditing(true);
    };
    
    const handleChange = (e) => {
        setTitle(e.target.value);
    };

    const handleBlur = () => {
        finishEditing();
    };
    
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            finishEditing();
        } else if (e.key === 'Escape') {
            // Restore previous title on escape
            setTitle(previousTitle);
            setIsEditing(false);
        }
    };

    // Common function to handle validation and submission
    const finishEditing = () => {
        const trimmedTitle = title.trim();
        
        // If empty, revert to previous title
        if (trimmedTitle === '') {
            setTitle(previousTitle);
            setIsEditing(false);
            return;
        }
        
        // Only emit if title has changed
        if (trimmedTitle !== previousTitle) {
            socket.emit('updateTitle', { documentId, title: trimmedTitle });
            if (titleRef) {
                titleRef.current = trimmedTitle;
            }
        }
        
        setTitle(trimmedTitle); // Ensure we use the trimmed version
        setIsEditing(false);
    };

    return (
        <div className="document-title-container">
            {isEditing ? (
                <input 
                    type="text" 
                    value={title} 
                    onChange={handleChange} 
                    onBlur={handleBlur} 
                    onKeyDown={handleKeyDown} 
                    className="title-input" 
                    autoFocus
                    ref={inputRef}
                    placeholder="Enter document title"
                />
            ) : (
                <h1 className="title-display" onClick={startEditing}>{title}</h1>
            )}
        </div>
    );
};

export default DocumentTitle;