// components/LowonganKPMSkeleton.jsx
import React from "react";

const LowonganKPMSkeleton = () => {
    return (
        <div className="flex w-full bg-gray-100 animate-pulse ring-1 ring-gray-200 rounded-md py-5 px-3">
            <div className="flex w-full justify-between items-end">
                <div className="flex w-full flex-col gap-y-2">
                    <div className="w-1/3 h-5 bg-gray-300 rounded"></div>
                    <div className="w-1/4 h-4 bg-gray-300 rounded"></div>
                    <div className="flex gap-x-2 mt-2">
                        <div className="w-20 h-6 bg-gray-300 rounded-md"></div>
                        <div className="w-20 h-6 bg-gray-300 rounded-md"></div>
                    </div>
                </div>
                <div>
                    <div className="w-16 h-8 bg-gray-300 rounded-md"></div>
                </div>
            </div>
        </div>
    );
};

export default LowonganKPMSkeleton;
