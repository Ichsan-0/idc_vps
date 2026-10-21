import ClickOutside from "@/Components/ClickOutside";
import { router, usePage } from "@inertiajs/react";
import React, { useState } from "react";
import { LogOut } from "lucide-react";

import UserOne from "../../../../../public/images/user/user.png";

const DropdownUser = () => {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const user = usePage().props.auth.user;

    const handleLogout = () => {
        setDropdownOpen(false);
        router.post(route("logout"));
    };

    return (
        <ClickOutside onClick={() => setDropdownOpen(false)} className="relative">
            <button
                type="button"
                onClick={() => setDropdownOpen((open) => !open)}
                aria-haspopup="menu"
                aria-expanded={dropdownOpen}
                className="flex items-center gap-3 rounded-full py-1 pl-2 pr-1 transition hover:bg-slate-50 sm:gap-4 sm:pl-3"
            >
                <span className="hidden text-right lg:block">
                    <span className="block text-sm font-semibold text-slate-800">
                        {user?.name ?? "-"}
                    </span>
                    <span className="block text-[11px] font-medium text-slate-400">
                        Admin
                    </span>
                </span>

                <span className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-brand-50 ring-2 ring-brand-100 sm:h-11 sm:w-11">
                    <img
                        src={UserOne}
                        alt={user?.name ?? "User"}
                        className="h-full w-full object-cover"
                    />
                </span>

                <svg
                    className={`hidden transition-transform duration-200 sm:block ${
                        dropdownOpen ? "rotate-180" : ""
                    }`}
                    width="12"
                    height="8"
                    viewBox="0 0 12 8"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M0.410765 0.910734C0.736202 0.585297 1.26384 0.585297 1.58928 0.910734L6.00002 5.32148L10.4108 0.910734C10.7362 0.585297 11.2638 0.585297 11.5893 0.910734C11.9147 1.23617 11.9147 1.76381 11.5893 2.08924L6.58928 7.08924C6.26384 7.41468 5.7362 7.41468 5.41077 7.08924L0.410765 2.08924C0.0853277 1.76381 0.0853277 1.23617 0.410765 0.910734Z"
                        fill="currentColor"
                    />
                </svg>
            </button>

            {dropdownOpen && (
                <div
                    role="menu"
                    className="absolute right-0 z-[150] mt-3 w-64 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-900/10"
                >
                    <div className="border-b border-slate-100 px-4 py-3.5">
                        <p className="truncate text-sm font-semibold text-slate-900">
                            {user?.name ?? "-"}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-500">
                            Masuk sebagai Admin
                        </p>
                    </div>

                    <div className="p-2">
                        <button
                            type="button"
                            role="menuitem"
                            onClick={handleLogout}
                            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-rose-600 transition hover:bg-rose-50"
                        >
                            <LogOut className="h-4 w-4" />
                            Log Out
                        </button>
                    </div>
                </div>
            )}
        </ClickOutside>
    );
};

export default DropdownUser;
