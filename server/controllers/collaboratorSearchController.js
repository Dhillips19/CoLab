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

        // Search for users excluding the owner
        const users = await User.find({
            $and: [
                {
                    $or: [
                        { username: { $regex: searchTerm, $options: 'i' } },
                        { email: { $regex: searchTerm, $options: 'i' } }
                    ]
                },
                { _id: { $ne: doc.owner } } // Exclude the owner
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
        const doc = await Document.findOne({ documentId: req.params.documentId });
        
        // Check if user is owner
        if (doc.owner.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Only the owner can add collaborators' });
        }

        // Prevent owner from adding themselves
        if (req.body.userId === req.user.id) {
            return res.status(400).json({ message: 'You are already the owner of this document' });
        }

        // Check if user is already a collaborator
        const isCollaborator = doc.collaborators.some(collab => 
            collab.user.toString() === req.body.userId
        );

        if (isCollaborator) {
            return res.status(400).json({ message: 'User is already a collaborator' });
        }

        doc.collaborators.push({ user: req.body.userId });
        await doc.save();

        res.json({ message: 'Collaborator added successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
}