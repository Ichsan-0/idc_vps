import React from "react";
import {
    Avatar,
    Box,
    IconButton,
    Menu,
    MenuItem,
    Tooltip,
    Typography,
} from "@mui/material";
import { deepOrange } from "@mui/material/colors";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
import { router, usePage } from "@inertiajs/react";

const Header = ({ user: propUser }) => {
    const [anchorElUser, setAnchorElUser] = React.useState(null);
    const pageUser = usePage().props.auth?.user;
    const user = pageUser || propUser?.user || propUser;
    const roleLabel = user?.role === "supervisor_kpm" ? "Supervisor KPM" : "Supervisor PPL";
    const initials = user?.name
        ? user.name
              .split(" ")
              .filter(Boolean)
              .map((word) => word[0])
              .slice(0, 2)
              .join("")
              .toUpperCase()
        : "U";

    const handleOpenUserMenu = (event) => {
        setAnchorElUser(event.currentTarget);
    };

    const handleCloseUserMenu = () => {
        setAnchorElUser(null);
    };

    return (
        <header className="header flex bg-white py-2 z-[100] w-full sticky top-0 shadow-md px-5">
            <div className="flex-grow"></div>
            <Box sx={{ flexGrow: 0, display: "flex", alignItems: "center", gap: 1.5 }}>
                <Box
                    onClick={handleOpenUserMenu}
                    sx={{
                        display: { xs: "none", sm: "block" },
                        textAlign: "right",
                        cursor: "pointer",
                    }}
                >
                    <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                        {user?.name || "Pengguna"}
                    </Typography>
                    <Typography variant="caption" sx={{ color: "text.secondary" }}>
                        {roleLabel}
                    </Typography>
                </Box>

                <Tooltip title="Pengaturan Akun">
                    <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                        <Avatar sx={{ bgcolor: deepOrange[500] }}>{initials}</Avatar>
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
                    <MenuItem
                        onClick={() => {
                            handleCloseUserMenu();
                            router.get("/pengaturan-akun");
                        }}
                    >
                        <SettingsIcon fontSize="small" sx={{ mr: 1 }} />
                        <Typography textAlign="center">Pengaturan Akun</Typography>
                    </MenuItem>
                    <MenuItem
                        onClick={() => {
                            handleCloseUserMenu();
                            router.post("/logout");
                        }}
                    >
                        <LogoutIcon fontSize="small" sx={{ mr: 1 }} />
                        <Typography textAlign="center">Logout</Typography>
                    </MenuItem>
                </Menu>
            </Box>
        </header>
    );
};

export default Header;
