import { FileText } from "lucide-react";

function UploadedFile({ file }) {
    if (!file) return null;

    return (
        <div
            className="
                flex
                items-center
                gap-3
                rounded-lg
                border
                border-slate-200
                bg-slate-50
                p-3
                transition-colors
                dark:border-slate-800
                dark:bg-slate-950/50
            "
        >
            {/* File Icon */}
            <div
                className="
                    flex
                    h-9
                    w-9
                    shrink-0
                    items-center
                    justify-center
                    rounded-lg
                    bg-blue-50
                    text-blue-600
                    dark:bg-blue-950/40
                    dark:text-blue-400
                "
            >
                <FileText size={18} strokeWidth={1.8} />
            </div>

            {/* File Information */}
            <div className="min-w-0">
                <p
                    className="
                        truncate
                        text-sm
                        font-medium
                        text-slate-800
                        dark:text-slate-200
                    "
                >
                    {file.name}
                </p>

                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
            </div>
        </div>
    );
}

export default UploadedFile;