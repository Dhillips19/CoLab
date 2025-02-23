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
    }]
    // lastUpdated: {
    //     type: Date,
    //     default: Date.now
    // },
});

const Document = mongoose.model('Document', DocumentSchema);

export default Document;