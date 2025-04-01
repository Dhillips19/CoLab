import React, { useEffect, useRef } from "react";
import Quill from "quill";
import * as Y from "yjs";
import { QuillBinding } from "y-quill";
import "quill/dist/quill.snow.css";
import socket from "../../socket/socket.js";
import "../../css/Editor.css";


const Editor = ({ documentId , username }) => {
    const wrapperRef = useRef(null);

    useEffect(() => {
        if (!socket || !wrapperRef.current) return;

        wrapperRef.current.innerHTML = "";
        const editor = document.createElement("div");
        wrapperRef.current.append(editor);

        const quill = new Quill(editor, { 
            theme: "snow" 
        }) // create quill editor instance
        
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
            socket.off('initialState');
            socket.off('update');
            ydoc.destroy();
        }
    }, [documentId]);

    return <div className="editor-container" ref={wrapperRef}></div>;
};

export default Editor;