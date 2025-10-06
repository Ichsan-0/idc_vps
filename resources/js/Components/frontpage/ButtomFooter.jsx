import { Link } from "@inertiajs/react";
import { TwitterIcon, InstagramIcon, MapIcon, MapPin, Mail } from "lucide-react";
import React from "react";
import { FiLinkedin } from "react-icons/fi";
import { BsTelephone } from "react-icons/bs";

const socialMedia = [
    { name: "Twitter", link: "https://x.com/", icon: TwitterIcon },
    {
        name: "LinkedIn",
        link: "https://www.linkedin.com",
        icon: FiLinkedin,
    },
    { name: "Instagram", link: "http://instagram.com/", icon: InstagramIcon },
];

const contactKami = [
    {
        name: "address",
        icon: MapPin,
        content:
            "Jl. Syaikh Abdul Rauf, Kopelma Darussalam, Syiah Kuala, Banda Aceh",
    },
    { name: "kontak", icon: BsTelephone, content: "+6281290709010" },
    { name: "email", icon: Mail, content: "idc_ftk.ar-raniry.ac.id" },
];

const menu = [
    {name : "Lowongan KPM", link:"/kpm-vacancies"},
    {name : "Lowongan PPL", link:"/ppl-vacancies"}
]

const ButtomFooter = () => {
    return (
        <footer className="flex flex-col w-full mt-13">
            <div className="flex bg-[#06359f] justify-center items-center w-full px-5 h-fit py-6 lg:px-20 md:px-10 ">
                <div className="flex max-w-7xl w-full  flex-col md:flex-row gap-3 ">
                    <div className="flex w-full gap-5">
                        <div className="flex flex-col gap-3">
                            <Link
                                href="/"
                                className="text-2xl font-semibold flex items-center gap-2 text-white cursor-pointer"
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
                            <ul className="text-gray-200 flex gap-2">
                                {socialMedia.map((item) => {
                                    const Icon = item.icon;

                                    return (
                                        <li key={item.name} className="bg-white/15 hover:bg-white/40 hover:text-white p-3 rounded-full">
                                            <Link href={item.link} target="_blank">
                                                <Icon size={20} />
                                            </Link>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                        <div className="flex flex-col gap-10 lg:flex-row">
                            <div>
                                <ul className="flex flex-col gap-y-2">
                                    <li className="text-white mb-3 font-semibold">
                                        KONTAK KAMI
                                    </li>
                                    {contactKami.map((item) => {
                                        const Icon = item.icon;
                                        return (
                                            <li key={item.name} className="text-gray-200 flex gap-3">
                                                <Icon size={20} />
                                                <p className="">
                                                    {item.content}
                                                </p>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                            <div>
                                <ul className="flex flex-col gap-y-2">
                                    <li className="text-white mb-3 font-semibold">
                                        MENU
                                    </li>
                                    {menu.map((item) => {
                                        return (
                                            <li className="text-gray-200 flex gap-3">
                                                <Link className="hover:text-white" href={item.link}>
                                                    {item.name}
                                                </Link>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="bg-white flex justify-center items-center">
                <div className="text-gray-400 p-4">
                    <p>Copyright @ 2025 IDC UIN Ar-raniry Banda Aceh</p>
                </div>
            </div>
            <div className="lg:hidden h-18"></div>
        </footer>
    );
};

export default ButtomFooter;
