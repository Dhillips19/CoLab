import React, { useEffect, useRef } from "react";
import Quill from "quill";
import * as Y from "yjs";
import { QuillBinding } from "y-quill";
import { useSocket } from "../../socket/SocketContext";
import "quill/dist/quill.snow.css";
import "./Editor.css";

export default function Editor() {
    const socket = useSocket(); // access shared socket
    const wrapperRef = useRef(null);

    // useEffect for setting up the editor
    useEffect(() => {

        // ensure socket is available and wrapperRef is set
        if (!socket || !wrapperRef.current) return; // ensure socket is available and wrapperRef is set

        // clear existing editor content
        wrapperRef.current.innerHTML = ""; 

        // create div to store editor
        const editor = document.createElement("div");
        wrapperRef.current.append(editor);

        // create quill editor instance
        const quill = new Quill(editor, { theme: "snow" });

        const ydoc = new Y.Doc(); // create y.js document 
        const ytext = ydoc.getText('quill'); // get text from this doc
        new QuillBinding(ytext, quill); // bind the text to the quill editor

        // retrieve initial doc state from server and apply the update to local ydoc
        socket.on("initialState", (update) => {
            Y.applyUpdate(ydoc, new Uint8Array(update));
        });

        // listen for updates from server and apply the update to local ydoc
        socket.on("update", (update) => {
            Y.applyUpdate(ydoc, new Uint8Array(update));
        });

        // when the local ydoc is updated, the update is broadcast to the server
        ydoc.on("update", (update) => {
            socket.emit("update", update);
        });

        // cleanup 
        return () => {
            socket.off("initialState");
            socket.off("update");
        };
    }, [socket]); // rerun useEffect only when socket instance changes

    // render editor container
    return <div className="editor-container" ref={wrapperRef}></div>;
}
