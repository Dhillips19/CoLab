import express from 'express';
import { createDocument, listDocuments, deleteDocument, leaveDocument } from '../controllers/documentController.js';
import authenticateUser from '../middleware/authMiddleware.js';
import { verifyDocumentExists } from '../middleware/documentMiddleware.js';

const documentRouter = express.Router();

// create document
documentRouter.post('/create', authenticateUser, createDocument);

// list documents
documentRouter.get('/list', authenticateUser, listDocuments);

// verify document exists middleware
documentRouter.get('/verify/:documentId', authenticateUser, verifyDocumentExists, (req, res) => {
    return res.status(200).json({ 
        exists: true,
        documentId: req.document.documentId,
        owner: req.document.owner.toString() === req.user.id
    });
});

documentRouter.post('/delete/:documentId', authenticateUser, deleteDocument);

documentRouter.post('/:documentId/leave', authenticateUser, leaveDocument);

// Save document version
// documentRouter.post('/:documentId/save-version', authenticateUser, saveVersion);

// // Retrieve all document versions
// documentRouter.get('/:documentId/get-versions', authenticateUser, getVersions);

// // Restore document version
// documentRouter.post('/:documentId/versions/:versionNum/restore', authenticateUser, restoreVersion);

export default documentRouter;