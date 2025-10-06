import React from "react";
import DropdownUser from "./DropdownUser";
import { Link, usePage } from "@inertiajs/react";
import LogoIcon from "../../../../../../public/images/logo/Lambang_UIN_Ar-Raniry.png";
import NavLink from "./NavLink";

const Header = ({ sidebarOpen, setSidebarOpen }) => {
    const { url, component } = usePage();
    const { pathname, search } = new URL(url, window.location.origin);
    return (
        <header className="bg-white border-b border-gray-200 px-4 sticky z-50 top-0 ">
            <div className="flex flex-grow items-center justify-between px-4 py-4  md:px-6 2xl:px-11">
                <div className="flex items-center gap-2 sm:gap-4 ">
                    
                    <Link
                        className="block flex-shrink-0"
                        href="/supervisor/classroom/home"
                    >
                        <img className="w-18" src={LogoIcon} alt="Logo" />
                    </Link>
                </div>

                <div className="flex items-center gap-3 2xsm:gap-7">
                    {/* <!-- User Area --> */}
                    <DropdownUser />
                    {/* <!-- User Area --> */}
                </div>
            </div>
        </header>
    );
};

export default Header;
