import Document from "../DB/models/documentModel.js";

export async function verifyDocumentExists(req, res, next) {
    const { documentId } = req.params;
    
    try {
        const document = await Document.findOne({ documentId });
        
        if (!document) {
            return res.status(404).json({ 
                error: "Document not found",
                code: "DOCUMENT_NOT_FOUND"
            });
        }
        
        // Document exists, add it to the request for later use if needed
        req.document = document;
        next();
    } catch (error) {
        console.error("Error verifying document:", error);
        res.status(500).json({ error: "Server error" });
    }
}