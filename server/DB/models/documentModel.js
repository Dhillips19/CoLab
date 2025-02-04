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
    // lastUpdated: {
    //     type: Date,
    //     default: Date.now
    // },
});

const Document = mongoose.model('Document', DocumentSchema);

export default Document;