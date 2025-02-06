import React from 'react';
import Navbar from '../components/NavBar';
import Editor from '../components/Editor';
import { useParams } from 'react-router-dom';

export default function DocumentPage() {
    const { documentId } = useParams();

    return  (
        <div>
            <Navbar/>
            <h1>editing doc with id: {documentId}</h1>
            <Editor/>
        </div>
    )
}