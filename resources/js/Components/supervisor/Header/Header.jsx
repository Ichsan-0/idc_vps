import React from "react";

import Dropdown from "@/Components/Dropdown";
import { deepOrange } from "@mui/material/colors";
import {
    Avatar,
    Box,
    IconButton,
    Menu,
    MenuItem,
    Tooltip,
    Typography,
} from "@mui/material";
import { router } from "@inertiajs/react";

const settings = ["Profile", "Logout"];

const Header = ({ user }) => {
    const [anchorElUser, setAnchorElUser] = React.useState(null);

    const handleOpenUserMenu = (event) => {
        setAnchorElUser(event.currentTarget);
    };
    const handleCloseUserMenu = (e, value) => {
        setAnchorElUser(null);
        if (value === 0) {
        } else if (value === 1) {
            router.post("/logout");
        }
    };

    return (
        <header className="header flex bg-white py-2 z-[100] w-full sticky top-0 shadow-md px-5">
            <div className="flex-grow"></div>
            <Box sx={{ flexGrow: 0 }}>
                <Tooltip title="Open settings">
                    <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                        <Avatar sx={{ bgcolor: deepOrange[500] }}>RU</Avatar>
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
        </header>
    );
};

export default Header;
