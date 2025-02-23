// src/pages/DocumentPage.jsx
import React from 'react';
import NavBar from '../components/NavBar/NavBar';
import Editor from '../components/Editor/Editor';
import { SocketProvider } from '../socket/SocketContext'; // Import the SocketProvider

export default function DocumentPage() {

    return (
        <SocketProvider> {/* Wrap with SocketProvider */}
            <div>
                <NavBar />
                <Editor />
            </div>
        </SocketProvider>
    );
}
