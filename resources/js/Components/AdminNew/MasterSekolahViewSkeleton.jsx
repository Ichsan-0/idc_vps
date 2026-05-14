import React from "react";

const MasterSekolahViewSkeleton = () => {
    return (
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between animate-pulse">
            <div>
                <h4 className="h-5 w-40 rounded bg-gray-200 dark:bg-gray-700 lg:mb-6"></h4>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
                    {/* Nama Sekolah */}
                    <div>
                        <div className="mb-2 h-3 w-24 rounded bg-gray-200 dark:bg-gray-700"></div>
                        <div className="h-4 w-32 rounded bg-gray-200 dark:bg-gray-700"></div>
                    </div>

                    {/* Kabupaten */}
                    <div>
                        <div className="mb-2 h-3 w-20 rounded bg-gray-200 dark:bg-gray-700"></div>
                        <div className="h-4 w-28 rounded bg-gray-200 dark:bg-gray-700"></div>
                    </div>

                    {/* Kecamatan */}
                    <div>
                        <div className="mb-2 h-3 w-24 rounded bg-gray-200 dark:bg-gray-700"></div>
                        <div className="h-4 w-40 rounded bg-gray-200 dark:bg-gray-700"></div>
                    </div>

                    {/* Desa */}
                    <div>
                        <div className="mb-2 h-3 w-16 rounded bg-gray-200 dark:bg-gray-700"></div>
                        <div className="h-4 w-32 rounded bg-gray-200 dark:bg-gray-700"></div>
                    </div>
                </div>
            </div>

            {/* Button Skeleton */}
            <div className="h-10 w-24 rounded-full bg-gray-200 dark:bg-gray-700"></div>
        </div>
    );
};

export default MasterSekolahViewSkeleton;
