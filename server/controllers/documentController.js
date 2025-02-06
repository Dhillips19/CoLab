import * as Y from 'yjs';
import Document from '../DB/models/documentModel.js';
import DocumentVersion from '../DB/models/documentVersionModel.js'

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
        // store the document state sent via the ydoc to state variable
        const state = Buffer.from(Y.encodeStateAsUpdate(ydoc));

        //update document
        await Document.updateOne(
            { documentId }, //find doc id
            { state } // update state field
        );
        console.log(`Document ${documentId} updated in DB`);

    } catch (error) {
        console.error(`Error saving document ${documentId}:`, error.message);
    }
}

// const documentController = {
//     loadOrCreateDocument: async (req, res) => {
//         try {
//             const { documentId } = req.params;
//             const ydoc = new Y.Doc();

//             let docData = await Document.findOne({ documentId }); //find document by id and assign to docData

//             if (docData) {
//                 Y.applyUpdate(ydoc, new Uint8Array(docData.state)); //assign state of doc to ydoc
//                 console.log(`Document ${documentId} loaded from database.`);
//             } else {
//                 console.log(`Document ${documentId} does not exist. Creating a new one.`);
//                 const state = Buffer.from(Y.encodeStateAsUpdate(ydoc)); //assign state variable to an empty Buffer value
//                 docData = await Document.create({ documentId, state }); //add new blank document to DB
//             }

//             res.json({ documentId, state: Array.from(Y.encodeStateAsUpdate(ydoc))})

//         } catch (error) {
//             console.error(`Error handling document ${documentId}:`, error.message);
//             res.status(500).json({ error: 'Server error. Loading/Creating Document' });
//         }
//     },

//     saveDocument: async (req, res) => {
        
//         try {

//             const { documentId } = req.params;
//             const { state } = req.body;
//             const stateBuffer = Buffer.from(state);

//             const docData = await Document.findOne({ documentId });

//             if (!docData) {
//                 return res.status(404).json({ error: "Document not found."});
//             }

//             //update document
//             await Document.updateOne(
//                 { documentId }, //find doc id
//                 { state: stateBuffer, lastUpdated: Date.now() } // update state field
//             );

//             console.log(`Document ${documentId} saved`);
//             res.json({ message: 'Document saved successfully' });
    
//         } catch (error) {
//             console.error(`Error saving document:`, error.message);
//             res.status(500).json({ error: 'Server error. Document could not be saved' });
//         }
//     }        
// }