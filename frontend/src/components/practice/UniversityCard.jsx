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
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                    onClick();
                }
            }}
            className={`
                cursor-pointer
                rounded-xl
                border
                bg-white
                p-4
                transition-all
                duration-200
                dark:bg-slate-900
                ${
                    selected
                        ? `
                            border-blue-600
                            ring-2
                            ring-blue-100
                            dark:border-blue-500
                            dark:ring-blue-500/20
                        `
                        : `
                            border-slate-200
                            hover:border-blue-400
                            hover:shadow-sm
                            dark:border-slate-800
                            dark:hover:border-blue-500
                        `
                }
            `}
        >
            {/* University Code */}
            <div
                className={`
                    flex
                    h-10
                    w-10
                    items-center
                    justify-center
                    rounded-lg
                    text-xs
                    font-semibold
                    transition-colors
                    ${
                        selected
                            ? `
                                bg-blue-600
                                text-white
                                dark:bg-blue-600
                            `
                            : `
                                bg-slate-100
                                text-slate-600
                                dark:bg-slate-800
                                dark:text-slate-300
                            `
                    }
                `}
            >
                {code}
            </div>

            {/* University Name */}
            <h3 className="mt-4 text-sm font-semibold leading-5 text-slate-900 dark:text-white">
                {name}
            </h3>

            {/* City */}
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {city}
            </p>
        </div>
    );
}

export default UniversityCard;