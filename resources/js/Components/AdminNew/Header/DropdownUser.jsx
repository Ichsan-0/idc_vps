import ClickOutside from "@/Components/ClickOutside";
import { router, usePage } from "@inertiajs/react";
import React, { useEffect, useState } from "react";
import { LogOut } from "lucide-react";
import axios from "axios";

import UserOne from "../../../../../public/images/user/user.png";

const DropdownUser = () => {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const page = usePage();
    const user = page.props.auth.user;
    const maintenance = page.props.maintenance;

    const isSuperAdmin = !!user?.is_superadmin;

    const [maintenanceActive, setMaintenanceActive] = useState(!!maintenance);
    const [maintenanceLoading, setMaintenanceLoading] = useState(false);
    const [maintenanceNote, setMaintenanceNote] = useState({
        type: "",
        text: "",
    });

    useEffect(() => {
        setMaintenanceActive(!!maintenance);
    }, [maintenance]);

    useEffect(() => {
        if (!maintenanceNote.text) return;

        const timer = setTimeout(
            () => setMaintenanceNote({ type: "", text: "" }),
            3500
        );

        return () => clearTimeout(timer);
    }, [maintenanceNote.text]);

    const handleLogout = () => {
        setDropdownOpen(false);
        router.post(route("logout"));
    };

    const handleMaintenanceToggle = async () => {
        if (maintenanceLoading) return;

        const next = !maintenanceActive;

        setMaintenanceLoading(true);
        setMaintenanceNote({ type: "", text: "" });

        try {
            const response = await axios.post("/api/admin/maintenance", {
                active: next,
            });

            setMaintenanceActive(!!response.data?.maintenance);
            setMaintenanceNote({
                type: "success",
                text:
                    response.data?.message ||
                    "Pengaturan maintenance berhasil disimpan.",
            });
        } catch (error) {
            setMaintenanceNote({
                type: "error",
                text:
                    error.response?.data?.message ||
                    "Gagal menyimpan pengaturan maintenance.",
            });
        } finally {
            setMaintenanceLoading(false);
        }
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
                        {isSuperAdmin ? "Super Admin" : "Admin"}
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
                    className="absolute right-0 z-[150] mt-3 w-72 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-900/10"
                >
                    <div className="border-b border-slate-100 px-4 py-3.5">
                        <div className="flex items-center gap-2">
                            <p className="truncate text-sm font-semibold text-slate-900">
                                {user?.name ?? "-"}
                            </p>
                            {isSuperAdmin && (
                                <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-700 ring-1 ring-inset ring-amber-200">
                                    Super Admin
                                </span>
                            )}
                        </div>
                        <p className="mt-0.5 text-xs text-slate-500">
                            {isSuperAdmin
                                ? "Masuk sebagai Super Admin"
                                : "Masuk sebagai Admin"}
                        </p>
                    </div>

                    {isSuperAdmin && (
                        <div className="border-b border-slate-100 px-4 py-3.5">
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold text-slate-800">
                                        Web Maintenance
                                    </p>
                                    <p className="mt-0.5 text-[11px] leading-relaxed text-slate-500">
                                        {maintenanceActive
                                            ? "Aktif — pengguna lain diarahkan ke halaman maintenance."
                                            : "Nonaktif — seluruh web dapat diakses."}
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    role="switch"
                                    aria-checked={maintenanceActive}
                                    aria-label="Aktifkan atau nonaktifkan mode maintenance"
                                    onClick={handleMaintenanceToggle}
                                    disabled={maintenanceLoading}
                                    className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-4 focus:ring-amber-100 disabled:cursor-not-allowed disabled:opacity-60 ${
                                        maintenanceActive
                                            ? "bg-amber-500"
                                            : "bg-slate-200"
                                    }`}
                                >
                                    <span
                                        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                                            maintenanceActive
                                                ? "translate-x-[22px]"
                                                : "translate-x-0.5"
                                        }`}
                                    />
                                </button>
                            </div>

                            {maintenanceNote.text && (
                                <p
                                    className={`mt-2 text-[11px] font-medium ${
                                        maintenanceNote.type === "error"
                                            ? "text-rose-600"
                                            : "text-emerald-600"
                                    }`}
                                >
                                    {maintenanceNote.text}
                                </p>
                            )}
                        </div>
                    )}

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
