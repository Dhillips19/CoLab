import mongoose from 'mongoose';

const DocumentSchema = new mongoose.Schema({
    documentId: { 
        type: String, 
        required: true, 
        unique: true 
    },
    state: { 
        type: Buffer, 
        required: true
    },
    documentTitle: {
        type: String,
        required: true,
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    collaborators: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    }],
    versions: [{
        versionNum: { type: Number, required: true },
        snapshot: { type: Buffer, required: true },
        name: { type: String, required: true },
        timestamp: { type: Date, default: Date.now }
    }],
    createdAt: {
        type: Date,
        default: Date.now,
        immutable: true
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true }); // This automatically manages updatedAt and createdAt

const Document = mongoose.model('Document', DocumentSchema);

export default Document;