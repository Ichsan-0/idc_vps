import React, { useEffect, useRef } from "react";
import SidebarLinkGroup from "./SidebarLinkGroup";
import { Link, usePage } from "@inertiajs/react";
import NavLink from "@/Components/NavLink";

// Icons
import {
    LuLayoutDashboard,
    LuDatabase,
    LuGraduationCap,
    LuAward,
    LuUsers,
    LuChevronDown,
    LuChevronLeft,
    LuChevronRight,
} from "react-icons/lu";
import { RiCommunityLine } from "react-icons/ri";
import { SiGoogleclassroom } from "react-icons/si";

const Sidebar = ({
    sidebarOpen,
    setSidebarOpen,
    sidebarCollapsed = false,
    setSidebarCollapsed,
    toggleSidebarCollapsed,
}) => {
    const { url } = usePage();
    const { pathname } = new URL(url, window.location.origin);

    const trigger = useRef(null);
    const sidebar = useRef(null);

    // Close on click outside (mobile)
    useEffect(() => {
        const clickHandler = ({ target }) => {
            if (!sidebar.current || !trigger.current) return;
            if (
                !sidebarOpen ||
                sidebar.current.contains(target) ||
                trigger.current.contains(target)
            )
                return;
            setSidebarOpen(false);
        };
        document.addEventListener("click", clickHandler);
        return () => document.removeEventListener("click", clickHandler);
    }, [sidebarOpen]);

    // Close if ESC key is pressed (mobile)
    useEffect(() => {
        const keyHandler = ({ keyCode }) => {
            if (!sidebarOpen || keyCode !== 27) return;
            setSidebarOpen(false);
        };
        document.addEventListener("keydown", keyHandler);
        return () => document.removeEventListener("keydown", keyHandler);
    }, [sidebarOpen]);

    const handleItemClick = (e, handleClick) => {
        if (sidebarCollapsed) {
            e.preventDefault();
            if (toggleSidebarCollapsed) {
                toggleSidebarCollapsed();
            } else if (setSidebarCollapsed) {
                setSidebarCollapsed(false);
            }
            handleClick();
        } else {
            e.preventDefault();
            handleClick();
        }
    };

    return (
        <aside
            ref={sidebar}
            className={`fixed lg:static top-0 left-0 z-[150] flex h-screen flex-col overflow-hidden bg-[#0c1322] border-r border-slate-800/80 shadow-xl transition-all duration-300 ease-in-out ${
                sidebarCollapsed ? "w-20" : "w-64"
            } ${
                sidebarOpen
                    ? "translate-x-0"
                    : "-translate-x-full lg:translate-x-0"
            }`}
        >
            {/* <!-- SIDEBAR HEADER --> */}
            <div className="flex h-16 shrink-0 items-center justify-between border-b border-slate-800/80 px-4">
                <Link
                    href="/admin/dashboard"
                    className="flex items-center gap-3 overflow-hidden"
                >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-600 to-blue-400 font-extrabold text-white shadow-md shadow-brand-500/20 text-base">
                        IDC
                    </div>
                    {!sidebarCollapsed && (
                        <div className="flex flex-col overflow-hidden">
                            <span className="text-lg font-bold tracking-tight text-white leading-tight">
                                IDC Panel
                            </span>
                            <span className="text-[10px] font-medium tracking-widest text-slate-400 uppercase">
                                PPL & KPM SYSTEM
                            </span>
                        </div>
                    )}
                </Link>

                {/* Mobile close button */}
                <button
                    ref={trigger}
                    onClick={() => setSidebarOpen(false)}
                    aria-controls="sidebar"
                    aria-expanded={sidebarOpen}
                    className="block lg:hidden rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
                >
                    <svg
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                        />
                    </svg>
                </button>
            </div>
            {/* <!-- SIDEBAR HEADER END --> */}

            {/* <!-- SIDEBAR NAVIGATION --> */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar px-3 py-4">
                {!sidebarCollapsed && (
                    <div className="mb-2 px-3 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
                        Menu Utama
                    </div>
                )}

                <ul className="flex flex-col gap-1">
                    {/* 1. Dashboard */}
                    <SidebarLinkGroup
                        activeCondition={
                            pathname === "/" || pathname.includes("dashboard")
                        }
                    >
                        {(handleClick, open) => {
                            const isGroupActive =
                                pathname === "/" ||
                                pathname.includes("dashboard");
                            return (
                                <React.Fragment>
                                    <button
                                        type="button"
                                        title="Dashboard"
                                        onClick={(e) =>
                                            handleItemClick(e, handleClick)
                                        }
                                        className={`group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
                                            sidebarCollapsed
                                                ? "justify-center"
                                                : "justify-between"
                                        } ${
                                            isGroupActive
                                                ? "bg-brand-500/15 text-brand-300 font-semibold border border-brand-500/30"
                                                : "text-slate-300 hover:bg-slate-800/70 hover:text-white"
                                        }`}
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <LuLayoutDashboard className="h-5 w-5 shrink-0 text-slate-400 group-hover:text-white" />
                                            {!sidebarCollapsed && (
                                                <span className="truncate">
                                                    Dashboard
                                                </span>
                                            )}
                                        </div>
                                        {!sidebarCollapsed && (
                                            <LuChevronDown
                                                className={`h-4 w-4 shrink-0 transition-transform duration-200 text-slate-400 ${
                                                    open ? "rotate-180" : ""
                                                }`}
                                            />
                                        )}
                                    </button>

                                    {!sidebarCollapsed && open && (
                                        <ul className="my-1 ml-4 flex flex-col gap-1 border-l border-slate-800/80 pl-3">
                                            <li>
                                                <NavLink
                                                    href="/admin/dashboard"
                                                    className={`block rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                                                        pathname ===
                                                            "/admin/dashboard" ||
                                                        pathname.includes(
                                                            "dashboard"
                                                        )
                                                            ? "bg-brand-500/20 text-brand-300 font-semibold"
                                                            : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                                                    }`}
                                                >
                                                    Analytics
                                                </NavLink>
                                            </li>
                                        </ul>
                                    )}
                                </React.Fragment>
                            );
                        }}
                    </SidebarLinkGroup>

                    {/* 2. Data */}
                    <SidebarLinkGroup
                        activeCondition={
                            pathname === "/data" ||
                            pathname.includes("/admin/data")
                        }
                    >
                        {(handleClick, open) => {
                            const isGroupActive =
                                pathname === "/data" ||
                                pathname.includes("/admin/data");
                            return (
                                <React.Fragment>
                                    <button
                                        type="button"
                                        title="Master Data"
                                        onClick={(e) =>
                                            handleItemClick(e, handleClick)
                                        }
                                        className={`group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
                                            sidebarCollapsed
                                                ? "justify-center"
                                                : "justify-between"
                                        } ${
                                            isGroupActive
                                                ? "bg-brand-500/15 text-brand-300 font-semibold border border-brand-500/30"
                                                : "text-slate-300 hover:bg-slate-800/70 hover:text-white"
                                        }`}
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <LuDatabase className="h-5 w-5 shrink-0 text-slate-400 group-hover:text-white" />
                                            {!sidebarCollapsed && (
                                                <span className="truncate">
                                                    Data Master
                                                </span>
                                            )}
                                        </div>
                                        {!sidebarCollapsed && (
                                            <LuChevronDown
                                                className={`h-4 w-4 shrink-0 transition-transform duration-200 text-slate-400 ${
                                                    open ? "rotate-180" : ""
                                                }`}
                                            />
                                        )}
                                    </button>

                                    {!sidebarCollapsed && open && (
                                        <ul className="my-1 ml-4 flex flex-col gap-1 border-l border-slate-800/80 pl-3">
                                            <li>
                                                <NavLink
                                                    href="/admin/data/settings"
                                                    className={`block rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                                                        pathname.includes(
                                                            "settings"
                                                        )
                                                            ? "bg-brand-500/20 text-brand-300 font-semibold"
                                                            : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                                                    }`}
                                                >
                                                    Settings
                                                </NavLink>
                                            </li>
                                            <li>
                                                <NavLink
                                                    href="/admin/data/camat-keuchik"
                                                    className={`block rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                                                        pathname.includes(
                                                            "camat-keuchik"
                                                        )
                                                            ? "bg-brand-500/20 text-brand-300 font-semibold"
                                                            : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                                                    }`}
                                                >
                                                    Camat & Keuchik
                                                </NavLink>
                                            </li>
                                            <li>
                                                <NavLink
                                                    href="/admin/data/kepsek-pamong"
                                                    className={`block rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                                                        pathname.includes(
                                                            "kepsek-pamong"
                                                        )
                                                            ? "bg-brand-500/20 text-brand-300 font-semibold"
                                                            : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                                                    }`}
                                                >
                                                    Pamong & Kepsek
                                                </NavLink>
                                            </li>
                                            <li>
                                                <NavLink
                                                    href="/admin/data/master-sekolah"
                                                    className={`block rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                                                        pathname.includes(
                                                            "master-sekolah"
                                                        )
                                                            ? "bg-brand-500/20 text-brand-300 font-semibold"
                                                            : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                                                    }`}
                                                >
                                                    Master Sekolah
                                                </NavLink>
                                            </li>
                                            <li>
                                                <NavLink
                                                    href="/admin/data/master-desa"
                                                    className={`block rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                                                        pathname.includes(
                                                            "master-desa"
                                                        )
                                                            ? "bg-brand-500/20 text-brand-300 font-semibold"
                                                            : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                                                    }`}
                                                >
                                                    Master Desa
                                                </NavLink>
                                            </li>
                                        </ul>
                                    )}
                                </React.Fragment>
                            );
                        }}
                    </SidebarLinkGroup>

                    {/* 3. KPM */}
                    <SidebarLinkGroup
                        activeCondition={
                            pathname.includes("/admin/tempatkpm") ||
                            pathname.includes("/admin/kpm")
                        }
                    >
                        {(handleClick, open) => {
                            const isGroupActive =
                                pathname.includes("/admin/tempatkpm") ||
                                pathname.includes("/admin/kpm");
                            return (
                                <React.Fragment>
                                    <button
                                        type="button"
                                        title="KPM"
                                        onClick={(e) =>
                                            handleItemClick(e, handleClick)
                                        }
                                        className={`group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
                                            sidebarCollapsed
                                                ? "justify-center"
                                                : "justify-between"
                                        } ${
                                            isGroupActive
                                                ? "bg-brand-500/15 text-brand-300 font-semibold border border-brand-500/30"
                                                : "text-slate-300 hover:bg-slate-800/70 hover:text-white"
                                        }`}
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <RiCommunityLine className="h-5 w-5 shrink-0 text-slate-400 group-hover:text-white" />
                                            {!sidebarCollapsed && (
                                                <span className="truncate">
                                                    KPM
                                                </span>
                                            )}
                                        </div>
                                        {!sidebarCollapsed && (
                                            <LuChevronDown
                                                className={`h-4 w-4 shrink-0 transition-transform duration-200 text-slate-400 ${
                                                    open ? "rotate-180" : ""
                                                }`}
                                            />
                                        )}
                                    </button>

                                    {!sidebarCollapsed && open && (
                                        <ul className="my-1 ml-4 flex flex-col gap-1 border-l border-slate-800/80 pl-3">
                                            <li>
                                                <NavLink
                                                    href="/admin/kpm/tempatkpm"
                                                    className={`block rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                                                        pathname.includes(
                                                            "tempatkpm"
                                                        )
                                                            ? "bg-brand-500/20 text-brand-300 font-semibold"
                                                            : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                                                    }`}
                                                >
                                                    Tempat KPM
                                                </NavLink>
                                            </li>
                                            <li>
                                                <NavLink
                                                    href="/admin/kpm/kpm-alocations"
                                                    className={`block rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                                                        pathname.includes(
                                                            "kpm-alocations"
                                                        )
                                                            ? "bg-brand-500/20 text-brand-300 font-semibold"
                                                            : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                                                    }`}
                                                >
                                                    Alokasi KPM
                                                </NavLink>
                                            </li>
                                        </ul>
                                    )}
                                </React.Fragment>
                            );
                        }}
                    </SidebarLinkGroup>

                    {/* 4. PPL */}
                    <SidebarLinkGroup
                        activeCondition={
                            pathname.includes("/admin/ppl")
                        }
                    >
                        {(handleClick, open) => {
                            const isGroupActive =
                                pathname.includes("/admin/ppl");
                            return (
                                <React.Fragment>
                                    <button
                                        type="button"
                                        title="PPL"
                                        onClick={(e) =>
                                            handleItemClick(e, handleClick)
                                        }
                                        className={`group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
                                            sidebarCollapsed
                                                ? "justify-center"
                                                : "justify-between"
                                        } ${
                                            isGroupActive
                                                ? "bg-brand-500/15 text-brand-300 font-semibold border border-brand-500/30"
                                                : "text-slate-300 hover:bg-slate-800/70 hover:text-white"
                                        }`}
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <LuGraduationCap className="h-5 w-5 shrink-0 text-slate-400 group-hover:text-white" />
                                            {!sidebarCollapsed && (
                                                <span className="truncate">
                                                    PPL
                                                </span>
                                            )}
                                        </div>
                                        {!sidebarCollapsed && (
                                            <LuChevronDown
                                                className={`h-4 w-4 shrink-0 transition-transform duration-200 text-slate-400 ${
                                                    open ? "rotate-180" : ""
                                                }`}
                                            />
                                        )}
                                    </button>

                                    {!sidebarCollapsed && open && (
                                        <ul className="my-1 ml-4 flex flex-col gap-1 border-l border-slate-800/80 pl-3">
                                            <li>
                                                <NavLink
                                                    href="/admin/ppl/sekolah"
                                                    className={`block rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                                                        pathname.includes(
                                                            "/admin/ppl/sekolah"
                                                        )
                                                            ? "bg-brand-500/20 text-brand-300 font-semibold"
                                                            : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                                                    }`}
                                                >
                                                    Tempat PPL
                                                </NavLink>
                                            </li>
                                        </ul>
                                    )}
                                </React.Fragment>
                            );
                        }}
                    </SidebarLinkGroup>

                    {/* 5. Classroom */}
                    <SidebarLinkGroup
                        activeCondition={
                            pathname.includes("classroom-kpm") ||
                            pathname.includes("classroom-ppl")
                        }
                    >
                        {(handleClick, open) => {
                            const isGroupActive =
                                pathname.includes("classroom-kpm") ||
                                pathname.includes("classroom-ppl");
                            return (
                                <React.Fragment>
                                    <button
                                        type="button"
                                        title="Classroom"
                                        onClick={(e) =>
                                            handleItemClick(e, handleClick)
                                        }
                                        className={`group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
                                            sidebarCollapsed
                                                ? "justify-center"
                                                : "justify-between"
                                        } ${
                                            isGroupActive
                                                ? "bg-brand-500/15 text-brand-300 font-semibold border border-brand-500/30"
                                                : "text-slate-300 hover:bg-slate-800/70 hover:text-white"
                                        }`}
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <SiGoogleclassroom className="h-5 w-5 shrink-0 text-slate-400 group-hover:text-white" />
                                            {!sidebarCollapsed && (
                                                <span className="truncate">
                                                    Classroom
                                                </span>
                                            )}
                                        </div>
                                        {!sidebarCollapsed && (
                                            <LuChevronDown
                                                className={`h-4 w-4 shrink-0 transition-transform duration-200 text-slate-400 ${
                                                    open ? "rotate-180" : ""
                                                }`}
                                            />
                                        )}
                                    </button>

                                    {!sidebarCollapsed && open && (
                                        <ul className="my-1 ml-4 flex flex-col gap-1 border-l border-slate-800/80 pl-3">
                                            <li>
                                                <NavLink
                                                    href="/admin/classroom-kpm/tugas"
                                                    className={`block rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                                                        pathname.includes(
                                                            "tugas"
                                                        )
                                                            ? "bg-brand-500/20 text-brand-300 font-semibold"
                                                            : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                                                    }`}
                                                >
                                                    Tugas KPM
                                                </NavLink>
                                            </li>
                                            <li>
                                                <NavLink
                                                    href="/admin/classroom-kpm/student-score"
                                                    className={`block rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                                                        pathname.includes(
                                                            "classroom-kpm/student-score"
                                                        )
                                                            ? "bg-brand-500/20 text-brand-300 font-semibold"
                                                            : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                                                    }`}
                                                >
                                                    Nilai KPM
                                                </NavLink>
                                            </li>
                                            <li>
                                                <NavLink
                                                    href="/admin/classroom-ppl/student-score"
                                                    className={`block rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                                                        pathname.includes(
                                                            "classroom-ppl/student-score"
                                                        )
                                                            ? "bg-brand-500/20 text-brand-300 font-semibold"
                                                            : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                                                    }`}
                                                >
                                                    Nilai PPL
                                                </NavLink>
                                            </li>
                                        </ul>
                                    )}
                                </React.Fragment>
                            );
                        }}
                    </SidebarLinkGroup>

                    {/* 6. Certificate */}
                    <SidebarLinkGroup
                        activeCondition={
                            pathname.includes("certificate")
                        }
                    >
                        {(handleClick, open) => {
                            const isGroupActive =
                                pathname.includes("certificate");
                            return (
                                <React.Fragment>
                                    <button
                                        type="button"
                                        title="Sertifikat"
                                        onClick={(e) =>
                                            handleItemClick(e, handleClick)
                                        }
                                        className={`group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
                                            sidebarCollapsed
                                                ? "justify-center"
                                                : "justify-between"
                                        } ${
                                            isGroupActive
                                                ? "bg-brand-500/15 text-brand-300 font-semibold border border-brand-500/30"
                                                : "text-slate-300 hover:bg-slate-800/70 hover:text-white"
                                        }`}
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <LuAward className="h-5 w-5 shrink-0 text-slate-400 group-hover:text-white" />
                                            {!sidebarCollapsed && (
                                                <span className="truncate">
                                                    Certificate
                                                </span>
                                            )}
                                        </div>
                                        {!sidebarCollapsed && (
                                            <LuChevronDown
                                                className={`h-4 w-4 shrink-0 transition-transform duration-200 text-slate-400 ${
                                                    open ? "rotate-180" : ""
                                                }`}
                                            />
                                        )}
                                    </button>

                                    {!sidebarCollapsed && open && (
                                        <ul className="my-1 ml-4 flex flex-col gap-1 border-l border-slate-800/80 pl-3">
                                            <li>
                                                <NavLink
                                                    href="/admin/certificate/nilai-ppkpm"
                                                    className={`block rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                                                        pathname.includes(
                                                            "nilai-ppkpm"
                                                        )
                                                            ? "bg-brand-500/20 text-brand-300 font-semibold"
                                                            : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                                                    }`}
                                                >
                                                    Nilai PPKPM
                                                </NavLink>
                                            </li>
                                            <li>
                                                <NavLink
                                                    href="/admin/certificate/settings"
                                                    className={`block rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                                                        pathname.includes(
                                                            "settings"
                                                        )
                                                            ? "bg-brand-500/20 text-brand-300 font-semibold"
                                                            : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                                                    }`}
                                                >
                                                    Certificate Settings
                                                </NavLink>
                                            </li>
                                        </ul>
                                    )}
                                </React.Fragment>
                            );
                        }}
                    </SidebarLinkGroup>

                    {/* 7. Users */}
                    <SidebarLinkGroup
                        activeCondition={
                            pathname.includes("/admin/users")
                        }
                    >
                        {(handleClick, open) => {
                            const isGroupActive =
                                pathname.includes("/admin/users");
                            return (
                                <React.Fragment>
                                    <button
                                        type="button"
                                        title="Manajemen Pengguna"
                                        onClick={(e) =>
                                            handleItemClick(e, handleClick)
                                        }
                                        className={`group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
                                            sidebarCollapsed
                                                ? "justify-center"
                                                : "justify-between"
                                        } ${
                                            isGroupActive
                                                ? "bg-brand-500/15 text-brand-300 font-semibold border border-brand-500/30"
                                                : "text-slate-300 hover:bg-slate-800/70 hover:text-white"
                                        }`}
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <LuUsers className="h-5 w-5 shrink-0 text-slate-400 group-hover:text-white" />
                                            {!sidebarCollapsed && (
                                                <span className="truncate">
                                                    Users
                                                </span>
                                            )}
                                        </div>
                                        {!sidebarCollapsed && (
                                            <LuChevronDown
                                                className={`h-4 w-4 shrink-0 transition-transform duration-200 text-slate-400 ${
                                                    open ? "rotate-180" : ""
                                                }`}
                                            />
                                        )}
                                    </button>

                                    {!sidebarCollapsed && open && (
                                        <ul className="my-1 ml-4 flex flex-col gap-1 border-l border-slate-800/80 pl-3">
                                            <li>
                                                <NavLink
                                                    href="/admin/users/admin/list"
                                                    className={`block rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                                                        pathname.includes(
                                                            "/admin/users/admin/list"
                                                        )
                                                            ? "bg-brand-500/20 text-brand-300 font-semibold"
                                                            : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                                                    }`}
                                                >
                                                    Admin
                                                </NavLink>
                                            </li>
                                            <li>
                                                <NavLink
                                                    href="/admin/users/student"
                                                    className={`block rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                                                        pathname.includes(
                                                            "/admin/users/student"
                                                        )
                                                            ? "bg-brand-500/20 text-brand-300 font-semibold"
                                                            : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                                                    }`}
                                                >
                                                    Mahasiswa
                                                </NavLink>
                                            </li>
                                            <li>
                                                <NavLink
                                                    href="/admin/users/dispensasi-syarat"
                                                    className={`block rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                                                        pathname.includes(
                                                            "dispensasi-syarat"
                                                        )
                                                            ? "bg-brand-500/20 text-brand-300 font-semibold"
                                                            : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                                                    }`}
                                                >
                                                    Dispensasi Syarat
                                                </NavLink>
                                            </li>
                                            <li>
                                                <NavLink
                                                    href="/admin/users/admin-sekolah/list"
                                                    className={`block rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                                                        pathname.includes(
                                                            "admin-sekolah"
                                                        )
                                                            ? "bg-brand-500/20 text-brand-300 font-semibold"
                                                            : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                                                    }`}
                                                >
                                                    Admin Sekolah
                                                </NavLink>
                                            </li>
                                            <li>
                                                <NavLink
                                                    href="/admin/users/admin-kecamatan/list"
                                                    className={`block rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                                                        pathname.includes(
                                                            "admin-kecamatan"
                                                        )
                                                            ? "bg-brand-500/20 text-brand-300 font-semibold"
                                                            : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                                                    }`}
                                                >
                                                    Admin Kecamatan
                                                </NavLink>
                                            </li>
                                            <li>
                                                <NavLink
                                                    href="/admin/users/supervisor-kpm"
                                                    className={`block rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                                                        pathname.includes(
                                                            "supervisor-kpm"
                                                        )
                                                            ? "bg-brand-500/20 text-brand-300 font-semibold"
                                                            : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                                                    }`}
                                                >
                                                    Supervisor
                                                </NavLink>
                                            </li>
                                        </ul>
                                    )}
                                </React.Fragment>
                            );
                        }}
                    </SidebarLinkGroup>
                </ul>
            </div>
            {/* <!-- SIDEBAR NAVIGATION END --> */}

            {/* <!-- SIDEBAR FOOTER (DESKTOP COLLAPSE BUTTON) --> */}
            <div className="hidden lg:flex shrink-0 items-center justify-between border-t border-slate-800/80 p-3 bg-slate-950/40">
                <button
                    type="button"
                    onClick={toggleSidebarCollapsed}
                    title={sidebarCollapsed ? "Buka Sidebar Penuh" : "Kecilkan Sidebar"}
                    className={`flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-all duration-150 w-full ${
                        sidebarCollapsed ? "justify-center" : "justify-between"
                    }`}
                >
                    {!sidebarCollapsed && <span>Kecilkan Sidebar</span>}
                    {sidebarCollapsed ? (
                        <LuChevronRight className="h-4 w-4" />
                    ) : (
                        <LuChevronLeft className="h-4 w-4" />
                    )}
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
