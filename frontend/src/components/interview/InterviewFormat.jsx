const formats = ["Panel", "1-on-1", "MMI"];

function InterviewFormat({ value, onChange }) {
    return (
        <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
                Interview Format
            </label>

            <div className="flex gap-3">
                {formats.map((format) => (
                    <button
                        key={format}
                        type="button"
                        onClick={() => onChange(format)}
                        className={`px-5 py-2 rounded-xl border transition ${value === format
                                ? "bg-blue-600 text-white border-blue-600"
                                : "border-gray-300 hover:border-blue-400"
                            }`}
                    >
                        {format}
                    </button>
                ))}
            </div>
        </div>
    );
}

export default InterviewFormat;