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
        
        // Find the document
        const document = await Document.findOne({ documentId });
        if (!document) {
            return res.status(404).json({ error: "Document not found" });
        }
        
        // Check if user is the owner
        if (document.owner.toString() !== userId) {
            return res.status(403).json({ error: "Only the document owner can delete it" });
        }

        // Get all collaborator user IDs before deleting the document
        const collaboratorIds = document.collaborators.map(collab => collab.user);
        
        // Delete the document
        await Document.deleteOne({ documentId });
        
        // Remove document from owner's ownedDocuments array
        await User.findByIdAndUpdate(
            userId,
            { $pull: { ownedDocuments: document._id } }
        );
        
        // IMPORTANT: Remove document from all collaborators' sharedDocuments arrays
        if (collaboratorIds.length > 0) {
            await User.updateMany(
                { _id: { $in: collaboratorIds } },
                { $pull: { sharedDocuments: document._id } }
            );
        }
        
        res.status(200).json({ message: "Document deleted successfully" });
        
    } catch (error) {
        console.error("Error deleting document:", error);
        res.status(500).json({ error: "Server error" });
    }
}

// Function to leave a shared document
export async function leaveDocument(req, res) {
    try {
        const { documentId } = req.params;
        const userId = req.user?.id;
        
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        
        // Find the document
        const document = await Document.findOne({ documentId });
        if (!document) {
            return res.status(404).json({ error: "Document not found" });
        }
        
        // Check if the user is the owner (owners can't leave their own documents)
        if (document.owner.toString() === userId) {
            return res.status(400).json({ error: "You can't leave a document you own. Try deleting it instead." });
        }
        
        // Check if the user is a collaborator
        const isCollaborator = document.collaborators.some(
            collab => collab.user.toString() === userId
        );
        
        if (!isCollaborator) {
            return res.status(400).json({ error: "You're not a collaborator on this document" });
        }
        
        // Remove the user from collaborators
        await Document.updateOne(
            { documentId },
            { $pull: { collaborators: { user: userId } } }
        );
        
        // Remove the document from user's sharedDocuments
        await User.findByIdAndUpdate(
            userId,
            { $pull: { sharedDocuments: document._id } }
        );
        
        res.status(200).json({ message: "Successfully left the document" });
    } catch (error) {
        console.error("Error leaving document:", error);
        res.status(500).json({ error: "Server error" });
    }
}

// // Create a snapshot of the current document state
// export async function saveVersion(req, res) {
//     try {
//         const { documentId } = req.params;
//         const { name } = req.body; 
        
//         // Find document
//         const docData = await Document.findOne({ documentId });
//         if (!docData) {
//             return res.status(404).json({ error: "Document not found" });
//         }
        
//         // Generate version number (increment highest existing version)
//         const currentHighestVersion = docData.versions.length > 0
//             ? Math.max(...docData.versions.map(v => v.versionNum))
//             : 0;
//         const newVersionNum = currentHighestVersion + 1;
        
//         const ydoc = new Y.Doc();
//         const ytext = ydoc.getText('quill');
//     if (!ytext) ydoc.getText('quill'); // force initialize if missing

//         Y.applyUpdate(ydoc, new Uint8Array(docData.state)); // Apply the current state to the Y.Doc instance

//         if (!ydoc.get('quill')) {
//             console.warn("No 'quill' type found before snapshot.");
//         }

//         const snapshot = Y.encodeSnapshot(Y.snapshot(ydoc))
        
//         // Add the new version to the document
//         docData.versions.push({
//             versionNum: newVersionNum,
//             snapshot: Buffer.from(snapshot),
//             name: name || `Version ${newVersionNum}`,
//             timestamp: new Date()
//         });
        
//         await docData.save();
        
//         res.status(201).json({
//             message: "Version saved successfully",
//             versionNum: newVersionNum
//         });
        
//     } catch (error) {
//         console.error("Error saving version:", error);
//         res.status(500).json({ error: "Failed to save version" });
//     }
// }

// // Retrieve list of versions for a document
// export async function getVersions(req, res) {
//     try {
//         const { documentId } = req.params;
        
//         // Find document
//         const docData = await Document.findOne({ documentId })
        
//         if (!docData) {
//             return res.status(404).json({ error: "Document not found" });
//         }
        
//         const versions = docData.versions.map((v) => ({
//             versionNum: v.versionNum,
//             name: v.name || `Version ${v.versionNum}`,
//             timestamp: v.timestamp,
//         }));
        
//         res.status(200).json({ versions });
        
//     } catch (error) {
//         console.error("Error retrieving versions:", error);
//         res.status(500).json({ error: "Failed to retrieve versions" });
//     }
// }

// // Restore document to a specific version
// export async function restoreVersion(req, res) {
//     try {
//         const { documentId, versionNum } = req.params;
//         const versionNumInt = parseInt(versionNum, 10);

//         // Fetch document and version
//         const docData = await Document.findOne({ documentId });
//         if (!docData) return res.status(404).json({ error: "Document not found" });

//         const version = docData.versions.find(v => v.versionNum === versionNumInt);
//         if (!version) return res.status(404).json({ error: "Version not found" });

//         // ✅ STEP 1: Save current state as a version before restoring
//         const currentYdoc = new Y.Doc();
//         Y.applyUpdate(currentYdoc, new Uint8Array(docData.state));
//         const currentSnapshot = Y.encodeSnapshot(Y.snapshot(currentYdoc));

//         const currentHighestVersion = docData.versions.length > 0
//             ? Math.max(...docData.versions.map(v => v.versionNum))
//             : 0;
//         const nextVersionNum = currentHighestVersion + 1;

//         docData.versions.push({
//             versionNum: nextVersionNum,
//             snapshot: Buffer.from(currentSnapshot),
//             name: `Auto-saved before restore`,
//             timestamp: new Date()
//         });

//         // ✅ STEP 2: Decode snapshot and rebuild document
//         const snapshotBytes = new Uint8Array(version.snapshot);
//         const baseYdoc = new Y.Doc({ gc: false });
//         Y.applyUpdate(baseYdoc, new Uint8Array(docData.state)); // for structure

//         const snapshot = Y.decodeSnapshot(snapshotBytes);
//         const restoredDoc = Y.createDocFromSnapshot(baseYdoc, snapshot);

//         let ytext = restoredDoc.getText('quill');

//         if (!ytext || !ytext instanceof Y.Text) {
//             console.log("No 'quill' type found before snapshot.");
//             ytext = restoredDoc.getText('quill'); // create a new Y.Text if not found
//             ytext.insert(0, ""); // insert empty string to initialize
//         } 

//         // ✅ STEP 3: Serialize full update from restored doc
//         const restoredUpdate = Y.encodeStateAsUpdate(restoredDoc);

//         // ✅ STEP 4: Save to DB
//         docData.state = Buffer.from(restoredUpdate);
//         await docData.save();

//         res.status(200).json({
//             message: "Document restored successfully",
//             restoredTo: versionNumInt,
//             previousSavedAs: nextVersionNum
//         });

//     } catch (error) {
//         console.error("Error restoring version:", error);
//         res.status(500).json({ error: "Failed to restore version" });
//     }
// }

