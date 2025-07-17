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
import { deepOrange } from "@mui/material/colors";
import { router } from "@inertiajs/react";
import avatar from "../../../../public/assets/user.png";
import { FaLinkedin } from "react-icons/fa";

const settings = ["Profile", "Logout"];

const Header = () => {
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
        <header className="flex z-[100] w-full sticky top-0 shadow-md ">
            <div className="flex-grow"></div>

            <div className="flex w-full px-5 h-fit py-2 lg:px-20 md:px-10 bg-[#1C2434] items-center">
                {/* Left Section */}
                <div className="flex items-center w-1/3">
                    <span className="ml-3 text-2xl font-semibold text-white">
                        IDC
                    </span>
                </div>

                {/* Center Section */}
                <div className="flex flex-col justify-center w-1/3 items-center text-white">
                    <a
                        href="https://www.linkedin.com/in/rifa-ulkhairi-94b0982a9/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-white hover:text-blue-400"
                    >
                        <FaLinkedin size={24} />
                    </a>
                    <p className="text-center text-sm">
                        Copyright © 2024 by Rifaul Khairi
                    </p>
                </div>

                {/* Right Section */}
                <div className="flex justify-end w-1/3">
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
