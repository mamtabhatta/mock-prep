import { UploadCloud } from "lucide-react";

function DocumentUpload({ onFileChange }) {
    return (
        <div>
            <label className="mb-2 block text-xs font-medium text-slate-700 dark:text-slate-300">
                Upload Documents
            </label>

            <label
                className="
                    flex
                    cursor-pointer
                    flex-col
                    items-center
                    justify-center
                    rounded-lg
                    border
                    border-dashed
                    border-slate-300
                    bg-slate-50
                    px-4
                    py-7
                    transition
                    duration-200
                    hover:border-blue-500
                    hover:bg-blue-50
                    dark:border-slate-700
                    dark:bg-slate-950/50
                    dark:hover:border-blue-500
                    dark:hover:bg-blue-950/30
                "
            >
                <div className="
                    mb-2
                    flex
                    h-10
                    w-10
                    items-center
                    justify-center
                    rounded-lg
                    bg-slate-100
                    text-slate-500
                    dark:bg-slate-800
                    dark:text-slate-400
                ">
                    <UploadCloud size={20} strokeWidth={1.8} />
                </div>

                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                    Drop your file here
                </p>

                <span className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    PDF or DOCX · Maximum 10 MB
                </span>

                <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    className="hidden"
                    onChange={(e) =>
                        onFileChange(e.target.files?.[0] || null)
                    }
                />
            </label>
        </div>
    );
}

export default DocumentUpload;