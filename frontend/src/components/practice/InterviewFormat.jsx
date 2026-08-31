const formats = ["Panel", "1-on-1", "MMI"];

function InterviewFormat({ value, onChange }) {
    return (
        <div className="space-y-2">
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                Interview Format
            </label>

            <div className="flex flex-wrap gap-2">
                {formats.map((format) => (
                    <button
                        key={format}
                        type="button"
                        onClick={() => onChange(format)}
                        className={`
                            rounded-lg
                            border
                            px-3
                            py-2
                            text-xs
                            font-medium
                            transition-all
                            duration-200
                            focus:outline-none
                            focus:ring-2
                            focus:ring-blue-500
                            focus:ring-offset-1
                            dark:focus:ring-offset-slate-900
                            ${
                                value === format
                                    ? `
                                        border-blue-600
                                        bg-blue-600
                                        text-white
                                        shadow-sm
                                        hover:bg-blue-700
                                        dark:border-blue-500
                                        dark:bg-blue-600
                                        dark:hover:bg-blue-500
                                    `
                                    : `
                                        border-slate-200
                                        bg-white
                                        text-slate-600
                                        hover:border-blue-400
                                        hover:bg-blue-50
                                        dark:border-slate-700
                                        dark:bg-slate-950
                                        dark:text-slate-300
                                        dark:hover:border-blue-500
                                        dark:hover:bg-slate-800
                                    `
                            }
                        `}
                    >
                        {format}
                    </button>
                ))}
            </div>
        </div>
    );
}

export default InterviewFormat;