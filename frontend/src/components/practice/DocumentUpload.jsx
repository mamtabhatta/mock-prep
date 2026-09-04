import { UploadCloud, FileText, X } from "lucide-react";

function DocumentUpload({ value, onFileChange }) {
    const handleChange = (e) => {
        const file = e.target.files?.[0];

        if (!file) return;

        // 10 MB limit
        if (file.size > 10 * 1024 * 1024) {
            alert("File size must be less than 10 MB.");
            e.target.value = "";
            return;
        }

        const allowedTypes = [
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ];

        if (!allowedTypes.includes(file.type)) {
            alert("Please upload a PDF, DOC, or DOCX file.");
            e.target.value = "";
            return;
        }

        onFileChange(file);
    };

    return (
        <div>
            <label className="mb-2 block text-xs font-medium text-slate-700 dark:text-slate-300">
                Upload CV
            </label>

            {!value ? (
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
                    <div
                        className="
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
                        "
                    >
                        <UploadCloud
                            size={20}
                            strokeWidth={1.8}
                        />
                    </div>

                    <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                        Drop your CV here
                    </p>

                    <span className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        PDF, DOC or DOCX · Maximum 10 MB
                    </span>

                    <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        className="hidden"
                        onChange={handleChange}
                    />
                </label>
            ) : (
                <div
                    className="
                        flex
                        items-center
                        justify-between
                        rounded-lg
                        border
                        border-slate-200
                        bg-slate-50
                        px-4
                        py-3
                        dark:border-slate-700
                        dark:bg-slate-900
                    "
                >
                    <div className="flex min-w-0 items-center gap-3">
                        <div
                            className="
                                flex
                                h-10
                                w-10
                                shrink-0
                                items-center
                                justify-center
                                rounded-lg
                                bg-blue-100
                                text-blue-600
                                dark:bg-blue-950/50
                                dark:text-blue-400
                            "
                        >
                            <FileText size={20} />
                        </div>

                        <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-200">
                                {value.name}
                            </p>

                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                {(value.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={() => onFileChange(null)}
                        className="
                            ml-3
                            rounded-md
                            p-1.5
                            text-slate-400
                            transition
                            hover:bg-slate-200
                            hover:text-red-500
                            dark:hover:bg-slate-800
                        "
                    >
                        <X size={18} />
                    </button>
                </div>
            )}
        </div>
    );
}

export default DocumentUpload;