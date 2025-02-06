import React from 'react';
import NavBar from '../components/NavBar/NavBar';
import { useNavigate } from 'react-router-dom';
import { v4 } from 'uuid';

export default function HomePage() {

    const navigate = useNavigate();

    const createDocument = () => {
        const documentId = v4();
        navigate(`/document/${documentId}`);
    }

    return (
        <div>
            <NavBar/>
            <h1>home</h1>
            <button onClick={createDocument}>Create Document</button>
        </div>
    )
}
