import * as Y from 'yjs';
import Document from '../DB/document_schema.js';

// checks if documentId is in DB and returns true or false
export async function isDocumentInDB(documentId) {
    try {
        const doc = await Document.findOne({ documentId });
        if (doc) {
            console.log(`Document ${documentId} exists`);
            return true;
        }
        else {
            console.log(`Document ${documentId} does not exist`);
            return false
        }
    } catch (error) {
        console.error(`Error checking for document ${documentId}:`, error.message);
        return false;
    }
}

//load document if it exists or create document if it doesn't
export async function loadOrCreateDocument(documentId) {
    try {

        //does doc exist
        const exists = await isDocumentInDB(documentId);

        //create ydoc
        const ydoc = new Y.Doc();

        //if doc exists else doc does not exist
        if (exists) {
            const docData = await Document.findOne({ documentId }); //find document by id and assign to docData
            Y.applyUpdate(ydoc, new Uint8Array(docData.state)); //assign state of doc to ydoc
            console.log(`Document ${documentId} loaded from database.`);
        } else {
            console.log(`Document ${documentId} does not exist. Creating a new one.`);
            const state = Buffer.from(Y.encodeStateAsUpdate(ydoc)); //assign state variable to an empty Buffer value
            Document.create({ documentId, state }); //add new blank document to DB
        }

        return ydoc; //return ydoc to server

    } catch (error) {
        console.error(`Error handling document ${documentId}:`, error.message);
        return new Y.Doc(); //return ydoc to prevent crashing
    }
}

// function to save ydoc to document schema
export async function saveDocument(documentId, ydoc) {
    try {
        //assign state value to a an empty Buffer value
        const state = Buffer.from(Y.encodeStateAsUpdate(ydoc));

        //update document
        await Document.updateOne(
            { documentId }, //find doc id
            { state } // update state field
        );

        console.log(`Document ${documentId} updated in DB`);

    } catch (error) {
        console.error(`Error saving document ${documentId}:`, error);
    }
}