import React from "react";
import DeveloperCredit from "@/Components/DeveloperCredit";

const AppFooter = ({ className = "" }) => {
    return (
        <footer
            className={`w-full py-3 px-4 text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200/80 dark:border-gray-800 bg-white/80 dark:bg-boxdark/70 backdrop-blur-xs mt-auto ${className}`}
        >
            <div className="mx-auto flex max-w-screen-2xl flex-col sm:flex-row items-center justify-between gap-1.5 px-2">
                <p className="font-normal text-gray-500 dark:text-gray-400">
                    © {new Date().getFullYear()} IDC • FTK UIN Ar-Raniry Banda Aceh
                </p>
                <DeveloperCredit
                    variant="light"
                    className="text-center sm:text-right"
                />
            </div>
        </footer>
    );
};

export default AppFooter;
