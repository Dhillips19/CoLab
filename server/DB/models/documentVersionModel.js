import mongoose from "mongoose";

const DocumentVersionSchema = new mongoose.Schema({
    documentId: { 
        type: String, 
        required: true, 
        ref: 'Document'
    },
    snapshot: { 
        type: Buffer, 
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
});

const DocumentVersion = mongoose.model('DocumentVersion', DocumentVersionSchema);

export default DocumentVersion;