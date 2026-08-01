import {
    Avatar,
    Box,
    IconButton,
    Menu,
    MenuItem,
    Tooltip,
    Typography,
} from "@mui/material";
import React from "react";
import { Link, router, usePage } from "@inertiajs/react";
import avatar from "../../../../public/assets/user.png";
import { IoNotificationsOutline } from "react-icons/io5";
import NotificationDropdown from "../Mahasiswa/NotificationDropdown";
import {
    School,
    Files,
    SquareLibrary,
    Shield,
    User,
    MapPinHouse
} from "lucide-react";

const settings = ["Profile", "Logout"];

const navigationItems = [
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

const Header = () => {
    const { props, url } = usePage();
    const hasUser = props.auth && props.auth.user;
    const pathname = url ? new URL(url, window.location.origin).pathname : "";

    const [anchorElUser, setAnchorElUser] = React.useState(null);

    const handleOpenUserMenu = (event) => {
        setAnchorElUser(event.currentTarget);
    };
    const handleCloseUserMenu = (e, value) => {
        setAnchorElUser(null);
        if (value === 0) {
            router.get("/profil");
        } else if (value === 1) {
            router.post("/logout");
        }
    };
    return (
        <header className="flex z-[100] w-full  sticky top-0 shadow-md bg-[#06359f] justify-center items-center ">
            <div className="flex w-full px-5 max-w-7xl h-fit py-2 lg:px-20 md:px-10 justify-between items-center">
                {/* Left Section */}
                <div className="flex items-center">
                    <Link
                        href="/"
                        className="ml-3 text-2xl font-semibold flex items-center gap-2 text-white cursor-pointer"
                    >
                        <img
                            src="/Lambang_UIN_Ar-Raniry.png"
                            className="w-14 h-14"
                        />
                        <div className="flex flex-col ">
                            <span>IDC</span>
                            <span className=" md:block hidden font-normal text-sm">
                                Instructional Development Center
                            </span>
                        </div>
                    </Link>
                </div>

                {/* Right Section */}
                <div className="flex justify-end items-center gap-4">
                    {hasUser && (
                        <nav className="hidden lg:flex items-center gap-1.5 mr-2">
                            {navigationItems.map((item) => {
                                const IconComponent = item.icon;
                                const isActive = pathname === item.path || pathname.startsWith(item.path + '/') || (item.path === '/kpm-vacancies' && pathname === '/');
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
                    )}

                    {/* <NotificationDropdown /> */}
                    <Box sx={{ flexGrow: 0 }}>
                        <Tooltip title="Open settings">
                            <IconButton
                                onClick={handleOpenUserMenu}
                                sx={{ p: 0 }}
                            >
                                <Avatar src={avatar}></Avatar>
                            </IconButton>
                        </Tooltip>
                        <Menu
                            sx={{ mt: "45px" }}
                            id="menu-appbar"
                            anchorEl={anchorElUser}
                            anchorOrigin={{
                                vertical: "top",
                                horizontal: "right",
                            }}
                            keepMounted
                            transformOrigin={{
                                vertical: "top",
                                horizontal: "right",
                            }}
                            open={Boolean(anchorElUser)}
                            onClose={handleCloseUserMenu}
                        >
                            {settings.map((setting, index) => (
                                <MenuItem
                                    key={setting}
                                    onClick={(e) => {
                                        handleCloseUserMenu(e, index);
                                    }}
                                >
                                    <Typography textAlign="center">
                                        {setting}
                                    </Typography>
                                </MenuItem>
                            ))}
                        </Menu>
                    </Box>
                </div>
            </div>
        </header>
    );
};

export default Header;
