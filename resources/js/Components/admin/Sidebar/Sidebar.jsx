import React, { useState } from "react";
import Button from "@mui/material/Button";
import { MdOutlineDashboard } from "react-icons/md";
import { FaAngleRight } from "react-icons/fa6";

import { AiOutlineDatabase } from "react-icons/ai";
import { LuUsers } from "react-icons/lu";
import { Link, router } from "@inertiajs/react";
import { SiGoogleclassroom } from "react-icons/si";
import { BsClipboardData } from "react-icons/bs";

const Sidebar = ({ tabId }) => {
    const [activeTab, setActiveTab] = useState(tabId);
    const [isToggleSubmenu, setIsToggleSubmenu] = useState(true);

    const isOpenSubmenu = (index) => {
        setActiveTab(index);
        setIsToggleSubmenu(true);
    };
    return (
        <>
            <div className="sidebar z-[200] fixed w-72 shadow-md overflow-y-hidden">
                <div className="logoWrapper py-3 pl-14 flex items-center gap-2">
                    <Link href="/admin/dashboard">
                        <span className="font-semibold text-white text-4xl">
                            IDC
                        </span>
                    </Link>
                </div>
                <div className="sidebarTabs px-3 mt-4 h-screen overflow-y-scroll">
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
                                Data
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
                                            router.visit("/admin/daftarprodi");
                                        }}
                                    >
                                        Prodi
                                    </Button>
                                    <Button
                                        className="w-full"
                                        onClick={(e) =>
                                            router.get("/admin/settings")
                                        }
                                    >
                                        Settings
                                    </Button>
                                    <Button
                                        className="w-full"
                                        onClick={(e) =>
                                            router.get("/admin/mahasiswappkpm")
                                        }
                                    >
                                        Mahasiswa PPKPM
                                    </Button>
                                    <Button
                                        className="w-full"
                                        onClick={(e) =>
                                            router.get(
                                                "/admin/data/camat-keuchik"
                                            )
                                        }
                                    >
                                        Camat & keuchik
                                    </Button>
                                    <Button
                                        className="w-full"
                                        onClick={(e) =>
                                            router.get(
                                                "/admin/data/kepsek-pamong"
                                            )
                                        }
                                    >
                                        Kepsek & Pamong
                                    </Button>
                                </div>
                            </div>
                        </li>
                        <li>
                            <Button
                                className={`w-full flex items-center justify-center ${
                                    activeTab === 2 ? "active" : ""
                                }`}
                                onClick={() => isOpenSubmenu(2)}
                            >
                                <span className="icon w-[30px] h-[30px] flex items-center justify-center rounded-md">
                                    <AiOutlineDatabase />
                                </span>
                                KPM
                                <span
                                    className={`arrow ml-auto w-[25px]  h-[25px] flex items-center justify-center ${
                                        activeTab === 2 &&
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
                                    activeTab === 2 && isToggleSubmenu === true
                                        ? "colapse"
                                        : "colapsed"
                                }`}
                            >
                                <div className="submenu">
                                    <Button
                                        className="w-full"
                                        onClick={(e) =>
                                            router.visit("/admin/tempatkpm")
                                        }
                                    >
                                        Tempat KPM
                                    </Button>
                                    <Button
                                        className="w-full"
                                        onClick={(e) => {
                                            router.visit(
                                                "/admin/tempatkpm/pelamar/list"
                                            );
                                        }}
                                    >
                                        List Pelamar
                                    </Button>
                                </div>
                            </div>
                        </li>

                        <li>
                            <Button
                                className={`w-full flex items-center justify-center ${
                                    activeTab === 3 ? "active" : ""
                                }`}
                                onClick={() => isOpenSubmenu(3)}
                            >
                                <span className="icon w-[30px] h-[30px] flex items-center justify-center rounded-md">
                                    <AiOutlineDatabase />
                                </span>
                                PPL
                                <span
                                    className={`arrow ml-auto w-[25px]  h-[25px] flex items-center justify-center ${
                                        activeTab === 3 &&
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
                                    activeTab === 3 && isToggleSubmenu === true
                                        ? "colapse"
                                        : "colapsed"
                                }`}
                            >
                                <div className="submenu">
                                    <Button
                                        className="w-full"
                                        onClick={(e) => {
                                            router.visit(
                                                "/admin/daftartempatppl"
                                            );
                                        }}
                                    >
                                        Tempat PPL
                                    </Button>

                                    <Button
                                        className="w-full"
                                        onClick={(e) => {
                                            router.visit(
                                                "/admin/daftarlowonganppl"
                                            );
                                        }}
                                    >
                                        Lowongan PPL
                                    </Button>
                                    <Button
                                        className="w-full"
                                        onClick={(e) => {
                                            router.visit(
                                                "/admin/lowongan/ppl/pelamar/list"
                                            );
                                        }}
                                    >
                                        List Pelamar
                                    </Button>

                                    <Button
                                        className="w-full"
                                        onClick={(e) => {
                                            router.visit(
                                                "/admin/daftarmahasiswappl"
                                            );
                                        }}
                                    >
                                        Daftar Mahasiswa PPL
                                    </Button>
                                </div>
                            </div>
                        </li>
                        <li>
                            <Button
                                className={`w-full flex items-center justify-center ${
                                    activeTab === 4 ? "active" : ""
                                }`}
                                onClick={() => isOpenSubmenu(4)}
                            >
                                <span className="icon w-[30px] h-[30px] flex items-center justify-center rounded-md">
                                    <LuUsers />
                                </span>
                                Pengguna
                                <span
                                    className={`arrow ml-auto w-[25px]  h-[25px] flex items-center justify-center ${
                                        activeTab === 4 &&
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
                                    activeTab === 4 && isToggleSubmenu === true
                                        ? "colapse"
                                        : "colapsed"
                                }`}
                            >
                                <div className="submenu">
                                    <Button
                                        className="w-full"
                                        onClick={() =>
                                            router.visit("/admin/daftaradmin")
                                        }
                                    >
                                        Admin
                                    </Button>
                                    {/* <Button
                                        className="w-full"
                                        onClick={() => {
                                            router.visit(
                                                "/admin/daftarsupervisor"
                                            );
                                        }}
                                    >
                                        Supervisor
                                    </Button> */}
                                    <Button
                                        className="w-full"
                                        onClick={() => {
                                            router.visit(
                                                "/admin/daftarmahasiswa"
                                            );
                                        }}
                                    >
                                        Mahasiswa
                                    </Button>
                                    <Button
                                        className="w-full"
                                        onClick={() => {
                                            router.visit(
                                                "/admin/admin-sekolah/list"
                                            );
                                        }}
                                    >
                                        Admin Sekolah
                                    </Button>
                                    <Button
                                        className="w-full"
                                        onClick={() => {
                                            router.visit(
                                                "/admin/admin-kecamatan/list"
                                            );
                                        }}
                                    >
                                        Admin Kecamatan
                                    </Button>
                                    <Button
                                        className="w-full"
                                        onClick={() => {
                                            router.visit(
                                                "/admin/users/supervisor-kpm"
                                            );
                                        }}
                                    >
                                        Supervisor
                                    </Button>
                                </div>
                            </div>
                        </li>
                        <li>
                            <Button
                                className={`w-full flex items-center justify-center ${
                                    activeTab === 5 ? "active" : ""
                                }`}
                                onClick={() => isOpenSubmenu(5)}
                            >
                                <span className="icon w-[30px] h-[30px] flex items-center justify-center rounded-md">
                                    <SiGoogleclassroom />
                                </span>
                                Classroom
                                <span
                                    className={`arrow ml-auto w-[25px]  h-[25px] flex items-center justify-center ${
                                        activeTab === 5 &&
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
                                    activeTab === 5 && isToggleSubmenu === true
                                        ? "colapse"
                                        : "colapsed"
                                }`}
                            >
                                <div className="submenu">
                                    <Button
                                        className="w-full"
                                        onClick={() =>
                                            router.visit(
                                                "/admin/classroom-kpm/tugas"
                                            )
                                        }
                                    >
                                        Tugas KPM
                                    </Button>
                                    <Button
                                        className="w-full"
                                        onClick={() => {
                                            router.visit(
                                                "/admin/classroom-kpm/student-score"
                                            );
                                        }}
                                    >
                                        Nilai KPM
                                    </Button>
                                    <Button
                                        className="w-full"
                                        onClick={() => {
                                            router.visit(
                                                "/admin/classroom-ppl/student-score"
                                            );
                                        }}
                                    >
                                        Nilai PPL
                                    </Button>
                                </div>
                            </div>
                        </li>
                        <li>
                            <Button
                                className={`w-full flex items-center justify-center ${
                                    activeTab === 5 ? "active" : ""
                                }`}
                                onClick={() => isOpenSubmenu(6)}
                            >
                                <span className="icon w-[30px] h-[30px] flex items-center justify-center rounded-md">
                                    <BsClipboardData />
                                </span>
                                Certificate
                                <span
                                    className={`arrow ml-auto w-[25px]  h-[25px] flex items-center justify-center ${
                                        activeTab === 6 &&
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
                                    activeTab === 6 && isToggleSubmenu === true
                                        ? "colapse"
                                        : "colapsed"
                                }`}
                            >
                                <div className="submenu">
                                    <Button
                                        className="w-full"
                                        onClick={() =>
                                            router.visit(
                                                "/admin/certificate/nilai-ppkpm"
                                            )
                                        }
                                    >
                                        Nilai PPKPM
                                    </Button>
                                    <Button
                                        className="w-full"
                                        onClick={() =>
                                            router.visit(
                                                "/admin/certificate/settings"
                                            )
                                        }
                                    >
                                        Certificate Settings
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
