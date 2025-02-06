import React, { useCallback } from 'react';
import Quill from 'quill';
import * as Y from 'yjs';
import { QuillBinding } from 'y-quill';
import { io } from 'socket.io-client';
import 'quill/dist/quill.snow.css';
import { useParams } from 'react-router-dom';

// function to create and manage updates within editor
export default function Editor() {

    // extract documentId from URL
    const { documentId } = useParams();

    // create quill editor
    const wrapperRef = useCallback((wrapper) => {

        if (wrapper == null) return
        
        wrapper.innerHTML = "" //empty wrapper element before creating new one
        
        const editor = document.createElement("div") // create div to store the quill editor
        wrapper.append(editor) // append to wrapper
        
        const quill = new Quill(editor, { 
            theme: "snow" 
        }) // create quill editor instance
        
        const socket = io('http://localhost:3001'); // create connection to socket
        
        socket.emit('joinDocumentRoom', documentId); // client joins room for document id
        
        const ydoc = new Y.Doc(); // create y.js document 
        const ytext = ydoc.getText('quill'); // get text from this doc
        new QuillBinding(ytext, quill); // bind the text to the quill editor
        
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

        // cleanup 
        return() => {
            socket.disconnect()
        }
    }, [])
    // editor is created inside this div
    return <div className="container" ref= { wrapperRef }></div>
}