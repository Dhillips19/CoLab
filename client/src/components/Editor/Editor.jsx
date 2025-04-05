import React, { useEffect, useRef } from "react";
import Quill from "quill";
import * as Y from "yjs";
import { QuillBinding } from "y-quill";
import QuillCursors from "quill-cursors";
import * as awarenessProtocol from 'y-protocols/awareness';
import { Awareness } from 'y-protocols/awareness';
import "quill/dist/quill.snow.css";
import socket from "../../socket/socket.js";
import "../../styles/Editor.css";

Quill.register('modules/cursors', QuillCursors)

const Editor = ({ documentId, username, colour, quillRef }) => {
    const wrapperRef = useRef(null);

    useEffect(() => {
        if (!socket || !wrapperRef.current) return;

        wrapperRef.current.innerHTML = "";
        const editor = document.createElement("div");
        wrapperRef.current.append(editor);

        var icons = Quill.import("ui/icons");
            icons["undo"] = `<svg viewbox="0 0 18 18">
                <polygon class="ql-fill ql-stroke" points="6 10 4 12 2 10 6 10"></polygon>
                <path class="ql-stroke" d="M8.09,13.91A4.6,4.6,0,0,0,9,14,5,5,0,1,0,4,9"></path>
            </svg>`;
            icons["redo"] = `<svg viewbox="0 0 18 18">
                <polygon class="ql-fill ql-stroke" points="12 10 14 12 16 10 12 10"></polygon>
                <path class="ql-stroke" d="M9.91,13.91A4.6,4.6,0,0,1,9,14a5,5,0,1,1,5-5"></path>
            </svg>`;

        // Create quill editor instance with history module
        const quill = new Quill(editor, {
            theme: "snow",
            modules: {
                cursors: true,
                toolbar: {
                    container: [
                        // Text formatting
                        ['bold', 'italic', 'underline', 'strike'],
                        
                        // Text alignment
                        [{ 'align': [] }],
                        
                        // Lists and indentation
                        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                        [{ 'indent': '-1'}, { 'indent': '+1' }],
                        
                        // Headers (H1, H2, etc)
                        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                        
                        // Font styling
                        [{ 'font': [] }],
                        [{ 'size': ['small', false, 'large', 'huge'] }],
                        
                        // Text color and background
                        [{ 'color': [] }, { 'background': [] }],
                        
                        // Other formatting
                        ['blockquote', 'code-block'],
                        
                        // Special characters and media
                        ['link', 'image', 'formula'],

                        ['undo', 'redo'], // Undo and redo buttons
                        
                        // Clear formatting
                        ['clean']
                    ],
                    handlers: {
                        // Add handlers for undo and redo
                        'undo': function() {
                            console.log("Undo button clicked");
                            quill.history.undo();
                        },
                        'redo': function() {
                            console.log("Redo button clicked");
                            quill.history.redo();
                        }
                    }
                },
                history: {
                    userOnly: true
                }
            }
        });

        quillRef.current = quill; // store quill instance in ref
        
        const ydoc = new Y.Doc(); // create y.js document 

        const awareness = new Awareness(ydoc); // create awareness instance for user presence
        awareness.setLocalStateField('user', {
            name: username,
            color: colour
        }); // set local user state

        const ytext = ydoc.getText('quill'); // get text from this doc

        // bind the quill editor to the ydoc
        new QuillBinding(ytext, quill, awareness);

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

        awareness.on('update', ({ added, updated, removed }) => {
            const update = awarenessProtocol.encodeAwarenessUpdate(
                awareness,
                added.concat(updated).concat(removed)
            );
            socket.emit('awareness-update', { documentId, update });
        });
        
        socket.on('awareness-update', ({ update }) => {
            awarenessProtocol.applyAwarenessUpdate(awareness, new Uint8Array(update));
        });
        
        // cleanup 
        return() => {
            socket.off('initialState');
            socket.off('update');
            ydoc.destroy();
        }
    }, [documentId]);

    return <div className="editor-container" ref={wrapperRef}></div>;
};

export default Editor;