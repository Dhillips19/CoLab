import React, { useEffect, useRef, useCallback } from 'react';
import Quill from 'quill';
import * as Y from 'yjs';
import { QuillBinding } from 'y-quill';
import { io } from 'socket.io-client';
import 'quill/dist/quill.snow.css';

// function to create and manage updates within editor
export default function Editor() {

    const wrapperRef = useCallback((wrapper) => {

        if (wrapper == null) return

        wrapper.innerHTML = ""
        const editor = document.createElement("div")
        wrapper.append(editor)
        const quill = new Quill(editor, { theme: "snow" })

        const socket = io('http://localhost:3001');

        const ydoc = new Y.Doc();
        const ytext = ydoc.getText('quill');
        new QuillBinding(ytext, quill);

        // listen to inital doc state
        socket.on('initialState', (update) => {
            Y.applyUpdate(ydoc, new Uint8Array(update));
        });

        // listen for updates from server
        socket.on('update', (update) => {
            Y.applyUpdate(ydoc, new Uint8Array(update));
        });

        // send client updates to the server
        ydoc.on('update', (update) => {
            socket.emit('update', update);
        });

        return() => {
            socket.disconnect()
        }
    }, [])

    return <div id="container" ref= { wrapperRef }></div>
}