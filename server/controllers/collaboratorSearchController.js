import Document from "../DB/models/documentModel.js";
import User from "../DB/models/userModel.js";

export async function searchUser(req, res) {
    try {
        const searchTerm = req.query.term;
        const documentId = req.query.documentId; // Add documentId to query params

        // Validate search term
        if (!searchTerm) {
            return res.status(400).json({ message: 'Search term is required' });
        }

        // Find document to get owner ID
        const doc = await Document.findOne({ documentId });
        if (!doc) {
            return res.status(404).json({ message: 'Document not found' });
        }

        // Get array of collaborator user IDs
        const collaboratorIds = doc.collaborators.map(collab => collab.user);
        
        // Add owner ID to the exclusion list
        const excludedIds = [doc.owner, ...collaboratorIds];

        // Search for users excluding the owner
        const users = await User.find({
            $and: [
                {
                    $or: [
                        { username: { $regex: searchTerm, $options: 'i' } },
                        { email: { $regex: searchTerm, $options: 'i' } }
                    ]
                },
                { _id: { $nin: excludedIds } } // Exclude the owner
            ]
        }).select('username email _id');

        res.json(users);
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ message: 'Error searching for users' });
    }
}

export async function addCollaborator(req, res) {
    try {
        // find document by documentId
        const doc = await Document.findOne({ documentId: req.params.documentId });

        doc.collaborators.push({ user: req.body.userId });
        await doc.save();

        await User.findByIdAndUpdate(
            req.body.userId,
            { $push: { sharedDocuments: doc._id } },
            { new: true }
        );

        res.json({ message: 'Collaborator added successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
}