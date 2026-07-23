function UniversityCard({
    code,
    name,
    city,
    selected,
    onClick,
}) {
    return (
        <div
            onClick={onClick}
            className={`cursor-pointer rounded-2xl border p-5 transition-all duration-200
      ${selected
                    ? "border-blue-600 ring-2 ring-blue-100"
                    : "border-gray-200 hover:border-blue-400"
                }`}
        >
            <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center font-semibold text-gray-600">
                {code}
            </div>

            <h3 className="mt-5 text-lg font-semibold text-gray-900">
                {name}
            </h3>

            <p className="text-gray-500">{city}</p>
        </div>
    );
}

export default UniversityCard;