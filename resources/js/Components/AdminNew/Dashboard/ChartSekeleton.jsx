export default function ChartSkeleton({ title = "Loading chart..." }) {
    return (
        <div className="flex-1">
            <div className="flex flex-col h-[600px] bg-white p-4 rounded-2xl border border-gray-200 animate-pulse">
                {/* Title placeholder */}
                <div className="h-6 w-64 mb-4 bg-gray-200 rounded dark:bg-gray-700" />

                {/* Simulated vertical bars */}
                <div className="flex items-end justify-between flex-grow">
                    {[...Array(8)].map((_, index) => (
                        <div key={index} className="flex flex-col items-center space-y-2">
                            {/* Bar */}
                            <div
                                className="w-6 bg-gray-300 dark:bg-gray-600 rounded"
                                style={{
                                    height: `${Math.floor(Math.random() * 150 + 50)}px`,
                                }}
                            />
                            {/* Label */}
                            <div className="w-6 h-3 bg-gray-200 rounded dark:bg-gray-700" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
