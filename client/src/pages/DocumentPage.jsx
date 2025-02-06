import React from 'react';
import NavBar from '../components/NavBar/NavBar';
import Editor from '../components/Editor/Editor';
import { useParams } from 'react-router-dom';

export default function DocumentPage() {
    const { documentId } = useParams();

    return  (
        <div>
            <NavBar/>
            <h1>editing doc with id: {documentId}</h1>
            <Editor/>
        </div>
    )
}