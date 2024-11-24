import React, { useEffect, useRef, useCallback } from 'react';
import Quill from 'quill';
import * as Y from 'yjs';
import { QuillBinding } from 'y-quill';
import { io } from 'socket.io-client';
import 'quill/dist/quill.snow.css';
import { useParams } from 'react-router-dom';

// function to create and manage updates within editor
export default function Editor() {

    const { documentId } = useParams();

    // create quill editor
    const wrapperRef = useCallback((wrapper) => {

        if (wrapper == null) return

        //empty wrapper element before creating new one
        wrapper.innerHTML = ""

        // create div to store the quill editor and append it to wrapper
        const editor = document.createElement("div")
        wrapper.append(editor)

        // create quill editor instance
        const quill = new Quill(editor, { 
            theme: "snow" 
        })

        // create connection to socket
        const socket = io('http://localhost:3001');

        //join room for document id
        socket.emit('joinDocumentRoom', documentId);

        // create y.js document, get text from this doc, and bind the text to the quill editor
        const ydoc = new Y.Doc();
        const ytext = ydoc.getText('quill');
        new QuillBinding(ytext, quill);

        // retrieve initial doc state from server and apply the update to local ydoc
        socket.on('initialState', (update) => {
            Y.applyUpdate(ydoc, new Uint8Array(update));
        });

        // listen for updates from server and apply the update to local ydoc
        socket.on('update', (update) => {
            Y.applyUpdate(ydoc, new Uint8Array(update));
        });

        // when the local ydoc is updated, the update is broadcast to the server
        ydoc.on('update', (update) => {
            socket.emit('update', update);
        });

        return() => {
            socket.disconnect()
        }
    }, [])
    // editor is created inside this div
    return <div className="container" ref= { wrapperRef }></div>
}