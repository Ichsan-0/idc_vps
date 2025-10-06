export default function CountCardSkeleton() {
    const skeletonItems = Array.from({ length: 14 });

    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6">
            {skeletonItems.map((_, index) => (
                <div
                    key={index}
                    className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 animate-pulse"
                >
                    <div className="flex items-center justify-center w-12 h-12 bg-gray-200 rounded-xl dark:bg-gray-700" />

                    <div className="flex items-end justify-between mt-5">
                        <div className="w-full">
                            <div className="h-3 w-24 bg-gray-200 rounded dark:bg-gray-700" />
                            <div className="h-5 w-16 mt-2 bg-gray-300 rounded dark:bg-gray-600" />
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-5 h-5 bg-gray-200 rounded-full dark:bg-gray-700" />
                            <div className="h-3 w-10 bg-gray-200 rounded dark:bg-gray-700" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
