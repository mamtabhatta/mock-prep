import { FileText } from "lucide-react";

function UploadedFile({ file }) {
    if (!file) return null;

    return (
        <div className="mt-4 border rounded-xl p-4 flex items-center gap-3">
            <FileText className="text-blue-600" />

            <div>
                <p className="font-medium">{file.name}</p>

                <p className="text-sm text-gray-500">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
            </div>
        </div>
    );
}

export default UploadedFile;