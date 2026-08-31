function CourseInput({ value, onChange }) {
    return (
        <div className="space-y-2">
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                Course
            </label>

            <input
                type="text"
                placeholder="e.g. MSc Computer Science"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="
                    w-full
                    rounded-lg
                    border
                    border-slate-200
                    bg-white
                    px-3
                    py-2.5
                    text-sm
                    text-slate-900
                    placeholder:text-slate-400
                    outline-none
                    transition
                    duration-200
                    focus:border-blue-500
                    focus:ring-2
                    focus:ring-blue-100
                    dark:border-slate-700
                    dark:bg-slate-950
                    dark:text-white
                    dark:placeholder:text-slate-500
                    dark:focus:border-blue-500
                    dark:focus:ring-blue-900/40
                "
            />
        </div>
    );
}

export default CourseInput;