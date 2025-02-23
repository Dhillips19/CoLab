import express from 'express';
import { createDocument, listDocuments } from '../controllers/documentController.js';
import authenticateUser from '../middleware/authMiddleware.js';

const documentRouter = express.Router();

// create document
documentRouter.post('/create', authenticateUser, createDocument);

// list documents
documentRouter.get('/list', authenticateUser, listDocuments);

// // Save document version
// documentRouter.post('/saveVersion/:documentId', documentController.saveVersion);

// // Retrieve all document versions
// documentRouter.get('/versions/:documentId', documentController.getVersions);

// // Restore document version
// documentRouter.post('/restore/:documentId/:versionId', documentController.restoreVersion);

export default documentRouter;