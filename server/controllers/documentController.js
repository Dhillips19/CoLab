import * as Y from 'yjs';
import Document from '../DB/models/documentModel.js';
import User from '../DB/models/userModel.js';
import { v4 } from 'uuid';

// function to create documentz
export async function createDocument(req, res) {
    try {
        // let document ID be request body
        let { documentId } = req.body;
        // retrieve and verify user id from authentication middleware
        const owner = req.user?.id;

        // if user not logged in
        if (!owner) {
            return res.status(401).json({ error: "Unauthorized. No user logged in." });
        }

        // generate documentId 
        if (!documentId) {
            documentId = v4();
        }

        // check if document exists
        const existingDocument = await Document.findOne({ documentId });
        if (existingDocument) {
            return res.status(400).json({ error: "Document with this ID already exists." });
        }

        // initialise ydoc, enpty state, and default document title
        const ydoc = new Y.Doc();
        const state = Buffer.from(Y.encodeStateAsUpdate(ydoc));
        const documentTitle = "Untitled Document"
        
        // create new document in DB
        const newDocument = await Document.create({ documentId, state, documentTitle, owner });

        // add new document to ownedDocuments in user model
        await User.findByIdAndUpdate(
            owner,
            { $push: { ownedDocuments: newDocument._id } },
            { new: true }
        );

        // display success messages
        console.log(`New document ${documentId} created and linked to owner ${owner}.`);
        res.status(201).json({ message: "Document created successfully.", documentId });
    
    // display errors
    } catch (error) {
        console.error(`Error creating document:`, error.message);
        res.status(500).json({ error: "Server error. Could not create document." });
    }
}

// function to retrieve owned documents for user
export async function listDocuments (req, res) {
    try {
        // retrieve and verify user id from authentication middleware
        const userId = req.user?.id; 
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        // find user in db
        // uses populate to retrieve all document info
        const user = await User.findById(userId)
            .populate("ownedDocuments")
            .populate("sharedDocuments");

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // respond with ownedDocuments and sharedDocuments for user
        res.status(200).json({
            ownedDocuments: user.ownedDocuments || [],
            sharedDocuments: user.sharedDocuments || []
        });
    
        // display errors
    } catch (error) {
        console.error("Error fetching documents:", error.message);
        res.status(500).json({ error: "Server error. Could not fetch documents." });
    }
};

//load document if it exists or create document if it doesn't
export async function loadDocument(documentId) {
    try {
        //does doc exist
        //const exists = await isDocumentInDB(documentId);
        const docData = await Document.findOne({ documentId }); //find document by id and assign to docData
        
        //document not found in DB
        if (!docData) {
            console.log(`Document ${documentId} not found in the database.`);
            throw new Error("Document not found");
        }

        //create ydoc
        const ydoc = new Y.Doc();

        //apply doc state to ydoc
        Y.applyUpdate(ydoc, new Uint8Array(docData.state));
        console.log(`Document ${documentId} loaded from database.`);

        //create doc name varaiable
        const documentTitle = docData.documentTitle || "Untitled Document";
        
        return { ydoc, documentTitle }; //return ydoc to server

    } catch (error) {
        console.error(`Error handling document ${documentId}:`, error.message);
        //return ydoc to prevent crashing and title to prevent crashing
        return { ydoc: new Y.Doc(), documentTitle: "Untitled Document"} 
    }
}

// function to update document title
export async function updateDocumentTitle(documentId, newTitle) {
    try {
        await Document.updateOne({ documentId }, { documentTitle: newTitle });
        console.log(`Document title updated in DB: ${newTitle}`);
    } catch (error) {
        console.error(`Error updating document title:`, error.message);
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

// function to verify if document exists and user is the owner
export async function getDocumentById(req, res) {
    try {
        const { documentId } = req.params;
        const userId = req.user?.id;
        
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        
        const document = await Document.findOne({ documentId });
        
        if (!document) {
            return res.status(404).json({ error: "Document not found" });
        }
        
        // check if user has access to the document
        const isOwner = document.owner.toString() === userId;
        const isCollaborator = document.collaborators.some(
            collab => collab.user.toString() === userId
        );
        
        if (!isOwner && !isCollaborator) {
            return res.status(403).json({ error: "You don't have access to this document" });
        }
        
        res.status(200).json({
            documentId: document.documentId,
            isOwner,
        });
        
    } catch (error) {
        console.error("Error fetching document:", error.message);
        res.status(500).json({ error: "Server error" });
    }
}

export async function deleteDocument(req, res) {
    try {
        const { documentId } = req.params;
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        // find the document
        const document = await Document.findOne({ documentId });

        if (!document) {
            return res.status(404).json({ error: "Document not found" });
        }

        // check if user is the owner
        if (document.owner.toString() !== userId) {
            return res.status(403).json({ error: "You don't have permission to delete this document" });
        }

        // delete the document from DB
        await Document.deleteOne({ documentId });

        // remove the document from user's ownedDocuments array
        await User.findByIdAndUpdate(
            userId,
            { $pull: { ownedDocuments: document._id } },
            { new: true }
        );

        res.status(200).json({ message: "Document deleted successfully" });
        
    } catch (error) {
        console.error("Error deleting document:", error.message);
        res.status(500).json({ error: "Server error" });
    }
}

// Create a snapshot of the current document state
export async function saveVersion(req, res) {
    try {
        const { documentId } = req.params;
        const { name } = req.body; 
        
        // Find document
        const docData = await Document.findOne({ documentId });
        if (!docData) {
            return res.status(404).json({ error: "Document not found" });
        }
        
        // Generate version number (increment highest existing version)
        const currentHighestVersion = docData.versions.length > 0
            ? Math.max(...docData.versions.map(v => v.version))
            : 0;
        const newVersion = currentHighestVersion + 1;
        
        const ydoc = new Y.Doc();
        Y.applyUpdate(ydoc, new Uint8Array(docData.state)); // Apply the current state to the Y.Doc instance
        const snapshot = Y.encodeSnapshot(Y.snapshot(ydoc))
        
        // Add the new version to the document
        docData.versions.push({
            version: newVersion,
            snapshot: Buffer.from(snapshot),
            name: name || `Version ${newVersion}`,
            timestamp: new Date()
        });
        
        await docData.save();
        
        res.status(201).json({
            message: "Version saved successfully",
            version: newVersion
        });
        
    } catch (error) {
        console.error("Error saving version:", error);
        res.status(500).json({ error: "Failed to save version" });
    }
}

// Retrieve list of versions for a document
export async function getVersions(req, res) {
    try {
        const { documentId } = req.params;
        
        // Find document
        const docData = await Document.findOne({ documentId })
        
        if (!docData) {
            return res.status(404).json({ error: "Document not found" });
        }
        
        const versions = docData.versions.map((v, i) => ({
            id: i,
            version: v.version,
            name: v.name || `Version ${v.version}`,
            timestamp: v.timestamp,
        }));
        
        res.status(200).json({ versions });
        
    } catch (error) {
        console.error("Error retrieving versions:", error);
        res.status(500).json({ error: "Failed to retrieve versions" });
    }
}

// Restore document to a specific version
export async function restoreVersion(req, res) {
    try {
        const { documentId, versionNumber } = req.params;
        
        // Find document
        const docData = await Document.findOne({ documentId });
        
        if (!docData) {
            return res.status(404).json({ error: "Document not found" });
        }
        
        // Find the version to restore
        const version = docData.versions.find(v => v.version === parseInt(versionNumber));
        
        if (!version) {
            return res.status(404).json({ error: "Version not found" });
        }
        
        // Then restore the document state to the selected version
        const snapshotBytes = new Uint8Array(docData.versions[versionNumber].snapshot);
        const latestYdoc = new Y.doc();

        Y.applyUpdate(latestYdoc, new Uint8Array(docData.state))

        const snapshot = Y.decodeSnapshot(snapshotBytes);
        const snapshotDoc = Y.createDocFromSnapshot(latestYdoc, snapshot);
        const restoredUpdate = Y.encodeStateAsUpdate(snapshotDoc);
        
        docData.state = Buffer.from(restoredUpdate);

        await docData.save();
        
        res.status(200).json({ 
            message: "Document restored successfully",
            version: parseInt(versionId)
        });
        
    } catch (error) {
        console.error("Error restoring version:", error);
        res.status(500).json({ error: "Failed to restore version" });
    }
}
