import { UploadCloud } from "lucide-react";

function DocumentUpload({ onFileChange }) {
    return (
        <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
                Upload Documents
            </label>

            <label className="border-2 border-dashed border-gray-300 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition">
                <UploadCloud size={38} className="text-gray-400 mb-3" />

                <p className="font-medium text-gray-700">
                    Drop your file here
                </p>

                <span className="text-sm text-gray-500 mt-1">
                    PDF, DOCX (Max 10 MB)
                </span>

                <input
                    type="file"
                    className="hidden"
                    onChange={(e) => onFileChange(e.target.files[0])}
                />
            </label>
        </div>
    );
}
export default DocumentUpload;