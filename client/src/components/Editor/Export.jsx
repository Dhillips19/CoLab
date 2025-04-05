import { useRef, useState, useEffect } from "react";
import { saveAs } from "file-saver";
import { pdfExporter } from "quill-to-pdf";
import * as quillToWord from "quill-to-word";
import "../../styles/Export.css";

const Export = ({ quillRef, titleRef }) => {

    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const toggleDropdown = () => {
        setShowDropdown(!showDropdown);
    };

    const exportPDF = async () => {
        if (!quillRef.current) {
            alert("Editor not ready");
            return;
        }
        
        try {
            const delta = quillRef.current.getContents();
            const pdfBlob = await pdfExporter.generatePdf(delta);
            const pdfFileName = titleRef.current ? `${titleRef.current}.pdf` : "document.pdf";
            saveAs(pdfBlob, pdfFileName);
        } catch (error) {
            console.error("Error exporting PDF:", error);
            alert("Failed to export PDF. Please try again.");
        }
    };

    const exportDOCX = async () => {
        if (!quillRef.current) {
            alert("Editor not ready");
            return;
        }

        try {
            const delta = quillRef.current.getContents();
            const docxBlob = await quillToWord.generateWord(delta, { exportAs: "blob" });
            const docxFileName = titleRef.current ? `${titleRef.current}.docx` : "document.docx";
            saveAs(docxBlob, docxFileName);
        } catch (error) {
            console.error("Error exporting DOCX:", error);
            alert("Failed to export DOCX. Please try again.");
        }
    };

    return (
        <div className="export-dropdown-container" ref={dropdownRef}>

            <button className="export-main-button" onClick={toggleDropdown}>Export</button>
            
            {showDropdown && (
                <div className="export-dropdown-menu">
                    <button className="export-option" onClick={exportPDF}>Export to PDF</button>
                    <button className="export-option" onClick={exportDOCX}>Export to Word</button>
                </div>
            )}
        </div>
    );
};

export default Export;