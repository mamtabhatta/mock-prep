function CourseInput({ value, onChange }) {
    return (
        <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
                Course
            </label>

            <input
                type="text"
                placeholder="e.g. MSc Computer Science"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
        </div>
    );
}

export default CourseInput;