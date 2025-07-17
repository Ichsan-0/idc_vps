import React, { useState } from "react";
import Button from "@mui/material/Button";
import { MdOutlineDashboard } from "react-icons/md";
import { FaAngleRight } from "react-icons/fa6";

import { AiOutlineDatabase } from "react-icons/ai";
import { Link, router } from "@inertiajs/react";

const Sidebar = ({ tabId }) => {
    const [activeTab, setActiveTab] = useState(tabId);
    const [isToggleSubmenu, setIsToggleSubmenu] = useState(false);

    const isOpenSubmenu = (index) => {
        setActiveTab(index);
        setIsToggleSubmenu(!isToggleSubmenu);
    };
    return (
        <>
            <div className="sidebar z-[100] fixed w-72 shadow-md overflow-y-hidden">
                <div className="logoWrapper py-3 pl-14 flex items-center gap-2">
                    <Link href="/admin/dashboard">
                        <span className="font-semibold text-white text-4xl">
                            IDC
                        </span>
                    </Link>
                </div>
                <div className="sidebarTabs px-3 mt-4">
                    <ul className="flex gap-4 flex-col">
                        <li>
                            <Link href="/admin/dashboard">
                                <Button
                                    className={`w-full ${
                                        activeTab === 0 ? "active" : ""
                                    }`}
                                    onClick={() => isOpenSubmenu(0)}
                                >
                                    <span className="icon w-[30px] h-[30px] flex items-center justify-center rounded-md">
                                        <MdOutlineDashboard />
                                    </span>
                                    Dashboard
                                </Button>
                            </Link>
                        </li>

                        <li>
                            <Button
                                className={`w-full flex items-center justify-center ${
                                    activeTab === 1 ? "active" : ""
                                }`}
                                onClick={() => isOpenSubmenu(1)}
                            >
                                <span className="icon w-[30px] h-[30px] flex items-center justify-center rounded-md">
                                    <AiOutlineDatabase />
                                </span>
                                PPL
                                <span
                                    className={`arrow ml-auto w-[25px]  h-[25px] flex items-center justify-center ${
                                        activeTab === 1 &&
                                        isToggleSubmenu === true
                                            ? "rotate"
                                            : ""
                                    }`}
                                >
                                    <FaAngleRight />
                                </span>
                            </Button>
                            <div
                                className={`submenuWrapper ${
                                    activeTab === 1 && isToggleSubmenu === true
                                        ? "colapse"
                                        : "colapsed"
                                }`}
                            >
                                <div className="submenu">
                                    <Button
                                        className="w-full"
                                        onClick={() => {
                                            router.visit(
                                                "/supervisor/daftarmahasiswappl"
                                            );
                                        }}
                                    >
                                        Daftar Mahasiswa PPL
                                    </Button>
                                </div>
                            </div>
                        </li>

                        {/* <div className="bg-black h-[1000px]"></div> */}
                    </ul>
                </div>
            </div>
        </>
    );
};

export default Sidebar;
