import React from 'react';
import NavBar from '../components/NavBar/NavBar';
import CreateDocument from '../components/Documents/CreateDocument';
import ListUserDocuments from '../components/Documents/ListUserDocuments';

export default function HomePage() {

    return (
        <div>
            <NavBar/>
            <CreateDocument/>
            <ListUserDocuments/>
        </div>
    )
}