import ClickOutside from "@/Components/ClickOutside";
import { Link, router, usePage } from "@inertiajs/react";
import React, { useState } from "react";
import { SlOptionsVertical } from "react-icons/sl";

const DropdownMenu = ({ children }) => {
    const [dropdownOpen, setDropdownOpen] = useState(false);

    return (
        <ClickOutside
            onClick={() => setDropdownOpen(false)}
            className="relative"
        >
            <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center text-gray-400 hover:text-gray-600 gap-4"
                href="#"
            >
                <SlOptionsVertical />
            </button>

            {/* <!-- Dropdown Start --> */}
            {dropdownOpen && (
                <div
                    className={`absolute z-99999 right-0 mt-4 flex w-62.5 flex-col rounded-xl border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark`}
                >
                    <ul className="flex flex-col gap-5 border-b border-stroke px-6 py-7.5 dark:border-strokedark">
                        {typeof children === "function"
                            ? children({
                                  closeDropdown: () => setDropdownOpen(false),
                              })
                            : children}
                    </ul>
                </div>
            )}
            {/* <!-- Dropdown End --> */}
        </ClickOutside>
    );
};

export default DropdownMenu;
