import React from 'react';
import Navbar from '../components/NavBar';
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
            <Navbar/>
            <h1>home</h1>
            <button onClick={createDocument}>Create Document</button>
        </div>
    )
}
