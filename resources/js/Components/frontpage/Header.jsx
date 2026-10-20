import {
    Box,
    IconButton,
    Menu,
    MenuItem,
    Typography,
} from "@mui/material";
import React from "react";
import { Link, router, usePage } from "@inertiajs/react";
import { IoNotificationsOutline } from "react-icons/io5";
import NotificationDropdown from "../Mahasiswa/NotificationDropdown";
import {
    School,
    Files,
    SquareLibrary,
    Shield,
    User,
    MapPinHouse,
    Menu as MenuIcon,
    LogOut
} from "lucide-react";

const navigationItemsMahasiswa = [
    {
        id: "Lowongan KPM",
        icon: MapPinHouse,
        label: "Lowongan KPM",
        path: "/kpm-vacancies",
    },
    {
        id: "Lowongan PPL",
        icon: School,
        label: "Lowongan PPL",
        path: "/ppl-vacancies",
    },
    {
        id: "Lamaranku",
        icon: Files,
        label: "Lamaranku",
        path: "/my-proposal",
    },
    {
        id: "Classroom",
        icon: SquareLibrary,
        label: "Classroom",
        path: "/classroom",
    },
    { id: "Nilai", icon: Shield, label: "Nilai", path: "/grade" },
    { id: "Profile", icon: User, label: "Profile", path: "/profil" },
];

const navigationItemsSupervisorKPM = [
    {
        id: "Classroom",
        icon: SquareLibrary,
        label: "Kelas Bimbingan",
        path: "/supervisor/classroom/home",
    },
];

const navigationItemsSupervisorPPL = [
    {
        id: "Dashboard",
        icon: SquareLibrary,
        label: "Dashboard",
        path: "/supervisor/dashboard",
    },
    {
        id: "MahasiswaPPL",
        icon: School,
        label: "Mahasiswa PPL",
        path: "/supervisor/daftarmahasiswappl",
    },
    {
        id: "Classroom",
        icon: SquareLibrary,
        label: "Kelas Bimbingan",
        path: "/supervisor/classroom/home",
    },
];

const navigationItemsOptKecamatan = [
    {
        id: "ClassroomKPM",
        icon: MapPinHouse,
        label: "Kelas KPM",
        path: "/operator-kecamatan/dashboard",
    },
    {
        id: "CamatKeuchik",
        icon: User,
        label: "Data Camat & Keuchik",
        path: "/operator-kecamatan/data/camat-keuchik",
    },
];

const navigationItemsOptSekolah = [
    {
        id: "ClassroomPPL",
        icon: School,
        label: "Kelas PPL",
        path: "/operator-sekolah/dashboard",
    },
    {
        id: "KepsekPamong",
        icon: User,
        label: "Data Kepsek & Pamong",
        path: "/operator-sekolah/data/kepsek-pamong",
    },
];

const Header = () => {
    const { props, url } = usePage();
    const hasUser = props.auth && props.auth.user;
    const role = props.auth?.user?.role;
    const isMahasiswa = hasUser && role === "user";
    const isSupervisorKPM = hasUser && role === "supervisor_kpm";
    const isSupervisor = hasUser && role === "supervisor";
    const isOptKecamatan = hasUser && role === "opt-kecamatan";
    const isOptSekolah = hasUser && role === "opt-sekolah";
    const pathname = url ? new URL(url, window.location.origin).pathname : "";

    // Cek apakah mahasiswa sudah memiliki data lokasi KPM atau PPL
    const hasLokasiFromPage = Boolean(
        (props.data?.classroom_kpm && props.data.classroom_kpm.length > 0) ||
        (props.data?.classroom_ppl && props.data.classroom_ppl.length > 0)
    );
    const hasLokasi = Boolean(
        props.auth?.has_lokasi ||
        props.auth?.has_lokasi_kpm ||
        props.auth?.has_lokasi_ppl ||
        hasLokasiFromPage
    );

    const filteredNavigationItems = React.useMemo(() => {
        if (isOptKecamatan) {
            return navigationItemsOptKecamatan;
        }
        if (isOptSekolah) {
            return navigationItemsOptSekolah;
        }
        if (isSupervisorKPM) {
            return navigationItemsSupervisorKPM;
        }
        if (isSupervisor) {
            return navigationItemsSupervisorPPL;
        }
        return navigationItemsMahasiswa.filter((item) => {
            if (isMahasiswa && hasLokasi) {
                // Hilangkan menu: Lowongan KPM, Lowongan PPL, Lamaranku
                if (["Lowongan KPM", "Lowongan PPL", "Lamaranku"].includes(item.id)) {
                    return false;
                }
            }
            return true;
        });
    }, [isMahasiswa, hasLokasi, isSupervisorKPM, isSupervisor, isOptKecamatan, isOptSekolah]);

    const homeUrl = isOptKecamatan
        ? "/operator-kecamatan/dashboard"
        : isOptSekolah
        ? "/operator-sekolah/dashboard"
        : isSupervisorKPM
        ? "/supervisor/classroom/home"
        : isSupervisor
        ? "/supervisor/dashboard"
        : "/";

    const [anchorElNav, setAnchorElNav] = React.useState(null);
    return (
        <header className="flex z-[100] w-full sticky top-0 shadow-md bg-[#06359f] justify-center items-center">
            <div className="flex w-full px-5 max-w-7xl h-fit py-2 lg:px-20 md:px-10 justify-between items-center">
                {/* Left Section */}
                <div className="flex items-center">
                    <Link
                        href={homeUrl}
                        className="ml-3 text-2xl font-semibold flex items-center gap-2 text-white cursor-pointer"
                    >
                        <img
                            src="/Lambang_UIN_Ar-Raniry.png"
                            className="w-14 h-14"
                        />
                        <div className="flex flex-col">
                            <span>IDC</span>
                            <span className="md:block hidden font-normal text-sm">
                                Instructional Development Center
                            </span>
                        </div>
                    </Link>
                </div>

                {/* Right Section */}
                <div className="flex justify-end items-center gap-4">
                    {hasUser && (
                        <>
                            {/* Mobile Hamburger Menu */}
                            <Box sx={{ display: { xs: "flex", lg: "none" } }}>
                                <IconButton
                                    size="large"
                                    onClick={(e) => setAnchorElNav(e.currentTarget)}
                                    color="inherit"
                                    sx={{ color: "white", p: 1 }}
                                >
                                    <MenuIcon className="w-6 h-6" />
                                </IconButton>
                                <Menu
                                    id="menu-appbar-nav"
                                    anchorEl={anchorElNav}
                                    anchorOrigin={{
                                        vertical: "bottom",
                                        horizontal: "left",
                                    }}
                                    keepMounted
                                    transformOrigin={{
                                        vertical: "top",
                                        horizontal: "left",
                                    }}
                                    open={Boolean(anchorElNav)}
                                    onClose={() => setAnchorElNav(null)}
                                    sx={{
                                        display: { xs: "block", lg: "none" },
                                        mt: "10px",
                                    }}
                                >
                                    {filteredNavigationItems.map((item) => {
                                        const IconComponent = item.icon;
                                        const isClassroomActive = item.id.includes('Classroom') && (
                                            pathname.startsWith('/student/classroom') ||
                                            pathname.startsWith('/classroom') ||
                                            pathname.startsWith('/supervisor/classroom') ||
                                            pathname.startsWith('/supervisor-kpm') ||
                                            pathname.startsWith('/supervisor-ppl') ||
                                            pathname.startsWith('/operator-kecamatan/classroom') ||
                                            pathname.startsWith('/operator-sekolah/classroom')
                                        );
                                        const isActive = pathname === item.path || pathname.startsWith(item.path + '/') || (item.path === '/kpm-vacancies' && pathname === '/') || isClassroomActive;
                                        return (
                                            <MenuItem
                                                key={item.id}
                                                onClick={() => {
                                                    setAnchorElNav(null);
                                                    router.get(item.path);
                                                }}
                                                sx={{
                                                    backgroundColor: isActive ? "action.selected" : "transparent",
                                                    fontWeight: isActive ? "bold" : "normal",
                                                    color: isActive ? "#06359f" : "inherit",
                                                    display: "flex",
                                                    gap: 1.5,
                                                    py: 1.25,
                                                    px: 2.5,
                                                }}
                                            >
                                                <IconComponent className="w-4 h-4" />
                                                <Typography variant="body2">{item.label}</Typography>
                                            </MenuItem>
                                        );
                                    })}
                                </Menu>
                            </Box>

                            {/* Desktop Navigation */}
                            <nav className="hidden lg:flex items-center gap-1.5 mr-2">
                            {filteredNavigationItems.map((item) => {
                                const IconComponent = item.icon;
                                const isClassroomActive = item.id.includes('Classroom') && (
                                    pathname.startsWith('/student/classroom') ||
                                    pathname.startsWith('/classroom') ||
                                    pathname.startsWith('/supervisor/classroom') ||
                                    pathname.startsWith('/supervisor-kpm') ||
                                    pathname.startsWith('/supervisor-ppl') ||
                                    pathname.startsWith('/operator-kecamatan/classroom') ||
                                    pathname.startsWith('/operator-sekolah/classroom')
                                );
                                const isActive = pathname === item.path || pathname.startsWith(item.path + '/') || (item.path === '/kpm-vacancies' && pathname === '/') || isClassroomActive;
                                return (
                                    <Link
                                        key={item.id}
                                        href={item.path}
                                        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 ${
                                            isActive
                                                ? "bg-white text-[#06359f] shadow-sm font-bold"
                                                : "text-white/80 hover:text-white hover:bg-white/10"
                                        }`}
                                    >
                                        <IconComponent className="w-4 h-4" />
                                        <span>{item.label}</span>
                                    </Link>
                                );
                            })}
                        </nav>
                        
                        {/* User Info Badge */}
                        <div className="hidden sm:flex flex-col text-right mr-1">
                            <span className="text-white text-xs font-semibold leading-tight max-w-[170px] truncate">
                                {props.auth?.user?.name}
                            </span>
                            <span className="text-emerald-300 text-[10px] font-medium tracking-wider uppercase">
                                {isOptKecamatan
                                    ? "Admin Kecamatan"
                                    : isOptSekolah
                                    ? "Admin Sekolah"
                                    : isSupervisorKPM
                                    ? "Dosen Supervisor"
                                    : isSupervisor
                                    ? "Supervisor PPL"
                                    : "Mahasiswa"}
                            </span>
                        </div>

                        {/* Logout Button */}
                        <button
                            onClick={() => router.post("/logout")}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 text-red-200 hover:text-white hover:bg-red-600/30 border border-red-500/20"
                        >
                            <LogOut className="w-4 h-4" />
                            <span className="sm:inline hidden">Logout</span>
                        </button>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;
