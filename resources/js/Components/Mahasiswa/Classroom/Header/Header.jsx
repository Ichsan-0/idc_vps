import React from "react";
import DropdownUser from "./DropdownUser";
import { Link, usePage } from "@inertiajs/react";
import LogoIcon from "../../../../../../public/images/logo/Lambang_UIN_Ar-Raniry.png";
import NavLink from "./NavLink";

const Header = ({ sidebarOpen, setSidebarOpen, auth }) => {
    const { url, component } = usePage();
    const { pathname, search } = new URL(url, window.location.origin);
    const user = usePage().props.auth;
    const {data} = usePage().props;
    return (
        <header className="sticky top-0 z-999 flex w-full bg-white  dark:bg-boxdark dark:drop-shadow-none flex-col">
            <div className="flex flex-grow items-center justify-between px-4 py-4 border md:px-6 2xl:px-11">
                <div className="flex items-center gap-2 sm:gap-4 ">
                    {/* <!-- Hamburger Toggle BTN --> */}
                    <button
                        aria-controls="sidebar"
                        onClick={(e) => {
                            e.stopPropagation();
                            setSidebarOpen(!sidebarOpen);
                        }}
                        className="z-99999 block rounded-sm border border-stroke bg-white p-1.5 shadow-sm dark:border-strokedark dark:bg-boxdark "
                    >
                        <span className="relative block h-5.5 w-5.5 cursor-pointer">
                            <span className="du-block absolute right-0 h-full w-full">
                                <span
                                    className={`relative left-0 top-0 my-1 block h-0.5 w-0 rounded-sm bg-black delay-[0] duration-200 ease-in-out dark:bg-white ${
                                        !sidebarOpen && "!w-full delay-300"
                                    }`}
                                ></span>
                                <span
                                    className={`relative left-0 top-0 my-1 block h-0.5 w-0 rounded-sm bg-black delay-150 duration-200 ease-in-out dark:bg-white ${
                                        !sidebarOpen && "delay-400 !w-full"
                                    }`}
                                ></span>
                                <span
                                    className={`relative left-0 top-0 my-1 block h-0.5 w-0 rounded-sm bg-black delay-200 duration-200 ease-in-out dark:bg-white ${
                                        !sidebarOpen && "!w-full delay-500"
                                    }`}
                                ></span>
                            </span>
                            <span className="absolute right-0 h-full w-full rotate-45">
                                <span
                                    className={`absolute left-2.5 top-0 block h-full w-0.5 rounded-sm bg-black delay-300 duration-200 ease-in-out dark:bg-white ${
                                        !sidebarOpen && "!h-0 !delay-[0]"
                                    }`}
                                ></span>
                                <span
                                    className={`delay-400 absolute left-0 top-2.5 block h-0.5 w-full rounded-sm bg-black duration-200 ease-in-out dark:bg-white ${
                                        !sidebarOpen && "!h-0 !delay-200"
                                    }`}
                                ></span>
                            </span>
                        </span>
                    </button>
                    {/* <!-- Hamburger Toggle BTN --> */}

                    <Link className="block flex-shrink-0" href="/classroom">
                        <img className="w-18" src={LogoIcon} alt="Logo" />
                    </Link>
                </div>

                <div className="flex items-center gap-3 2xsm:gap-7">
                    {/* <!-- User Area --> */}
                    <DropdownUser />
                    {/* <!-- User Area --> */}
                </div>
            </div>
            <div className="bg-white border flex justify-center ">
                <div
                    className={`w-fit h-fit border-primary/0 border-b-2 hover:border-primary `}
                >
                    <NavLink
                        href={`/student/classroom/${data?.id_kelas}/task`}
                        className={`group relative flex h-10 items-center gap-2.5 text-[#3c4043] px-4 font-medium duration-100 ease-in-out hover:bg-black/5 border-primary ${
                            (pathname === "/mahasiswa/classroom" ||
                                pathname.includes("task")) &&
                            "!bg-black/5 !text-primary"
                        }`}
                    >
                        Tugas Kelas
                    </NavLink>
                </div>
                <div className="w-fit h-fit border-primary/0 border-b-2 hover:border-primary">
                    <NavLink
                        href="#"
                        className={`group relative flex h-10 items-center gap-2.5 text-[#3c4043] px-4 font-medium duration-100 ease-in-out hover:bg-primary/10 border-primary ${
                            (pathname ===
                                "/operator-kecamatan/data/camat-keuchik" ||
                                pathname.includes("camat-keuchik")) &&
                            "!text-white"
                        }`}
                    >
                        Orang
                    </NavLink>
                </div>
            </div>
        </header>
    );
};

export default Header;
