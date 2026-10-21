import { Link } from "@inertiajs/react";
import { Twitter, Instagram, MapPin, Mail, Globe, Facebook } from "lucide-react";
import DeveloperCredit from "@/Components/DeveloperCredit";

const socialMedia = [
    { 
        name: "Twitter", 
        link: "https://x.com/uin_arraniry", 
        icon: Twitter,
        color: "hover:bg-[#1DA1F2]"
    },
    {
        name: "Facebook",
        link: "https://facebook.com/uin.arraniry",
        icon: Facebook,
        color: "hover:bg-[#1877F2]"
    },
    { 
        name: "Instagram", 
        link: "https://instagram.com/uin_arraniry", 
        icon: Instagram,
        color: "hover:bg-gradient-to-r from-[#F58529] via-[#DD2A7B] to-[#8134AF]"
    },
    {
        name: "Website",
        link: "https://ar-raniry.ac.id",
        icon: Globe,
        color: "hover:bg-[#0EA5E9]"
    },
];

const contactKami = [
    {
        name: "address",
        icon: MapPin,
        content: "Jl. Syaikh Abdul Rauf, Kopelma Darussalam, Banda Aceh 23111",
        link: "https://maps.app.goo.gl/example"
    },
    { 
        name: "telepon", 
        icon: "tel", 
        content: "+62 811-6600-900", 
        link: "tel:+628116600900" 
    },
    { 
        name: "email", 
        icon: Mail, 
        content: "idc@ar-raniry.ac.id", 
        link: "mailto:idc@ar-raniry.ac.id" 
    },
];

const menu = [
    { name: "Beranda", link: "/" },
    { name: "Lowongan KPM", link: "/kpm-vacancies" },
    { name: "Lowongan PPL", link: "/ppl-vacancies" },
    { name: "Pengumuman", link: "/announcements" },
    { name: "Panduan", link: "/guides" },
];

const quickLinks = [
    { name: "Siakad", link: "idc-ftk.com" },
   
];

const Footer = () => {
    return (
        <footer className="bg-gray-900 mt-55 text-white mt-auto">
            {/* Main Footer */}
            <div className="container mx-auto px-4 py-8 lg:py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
                    
                    {/* Logo & Description */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-4">
                            <img
                                src="/Lambang_UIN_Ar-Raniry.png"
                                alt="Logo UIN Ar-Raniry"
                                className="w-16 h-16 lg:w-20 lg:h-20"
                            />
                            <div>
                                <h2 className="text-xl lg:text-2xl font-bold text-white">
                                    IDC UIN Ar-Raniry
                                </h2>
                                <p className="text-sm text-gray-300 mt-1">
                                    Instructional Development Center
                                </p>
                            </div>
                        </div>
                        
                        <p className="text-gray-400 text-sm lg:text-base leading-relaxed">
                            Pusat pengembangan instruksional 
                        </p>
                        
                        {/* Social Media */}
                        <div className="space-y-3">
                            <h3 className="font-semibold text-white">Ikuti Kami</h3>
                            <div className="flex gap-3">
                                {socialMedia.map((item) => {
                                    const Icon = item.icon;
                                    return (
                                        <a
                                            key={item.name}
                                            href={item.link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={`p-2.5 rounded-full bg-gray-800 ${item.color} transition-all duration-300 transform hover:scale-110 active:scale-95`}
                                            aria-label={`Kunjungi ${item.name} UIN Ar-Raniry`}
                                        >
                                            <Icon className="w-5 h-5 lg:w-6 lg:h-6" />
                                        </a>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Contact Information */}
                    <div className="space-y-6">
                        <h3 className="text-lg font-semibold text-white pb-2 border-b border-gray-700">
                            Kontak Kami
                        </h3>
                        <div className="space-y-4">
                            {contactKami.map((item) => {
                                const Icon = item.icon === "tel" ? 
                                    () => <span className="text-lg">📞</span> : item.icon;
                                
                                return (
                                    <a
                                        key={item.name}
                                        href={item.link}
                                        target={item.link.startsWith('http') ? '_blank' : '_self'}
                                        rel="noopener noreferrer"
                                        className="flex items-start gap-3 group"
                                    >
                                        <div className="p-2 bg-gray-800 rounded-lg group-hover:bg-blue-600 transition-colors">
                                            <Icon className="w-4 h-4 lg:w-5 lg:h-5" />
                                        </div>
                                        <span className="text-gray-300 group-hover:text-white transition-colors text-sm lg:text-base flex-1">
                                            {item.content}
                                        </span>
                                    </a>
                                );
                            })}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="space-y-6">
                        <h3 className="text-lg font-semibold text-white pb-2 border-b border-gray-700">
                            Tautan Cepat
                        </h3>
                        <ul className="space-y-3">
                            {quickLinks.map((item) => (
                                <li key={item.name}>
                                    <a
                                        href={item.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-gray-300 hover:text-white hover:translate-x-2 transition-all duration-300 flex items-center gap-2 text-sm lg:text-base"
                                    >
                                        <span className="w-1 h-1 bg-gray-500 rounded-full"></span>
                                        {item.name}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Menu */}
                    <div className="space-y-6">
                        <h3 className="text-lg font-semibold text-white pb-2 border-b border-gray-700">
                            Menu
                        </h3>
                        <ul className="space-y-3">
                            {menu.map((item) => (
                                <li key={item.name}>
                                    <Link
                                        href={item.link}
                                        className="text-gray-300 hover:text-white hover:translate-x-2 transition-all duration-300 flex items-center gap-2 text-sm lg:text-base"
                                    >
                                        <span className="w-1 h-1 bg-gray-500 rounded-full"></span>
                                        {item.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-800 my-8 lg:my-12"></div>

                {/* Copyright & Additional Info */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
                    <div className="text-gray-400 text-sm lg:text-base">
                        <p>© {new Date().getFullYear()} IDC UIN Ar-Raniry Banda Aceh. Hak Cipta Dilindungi.</p>
                        <p className="mt-1 text-xs lg:text-sm">
                            Jl. Syaikh Abdul Rauf, Kopelma Darussalam, Kec. Syiah Kuala, Kota Banda Aceh
                        </p>
                        <DeveloperCredit
                            variant="dark"
                            className="mt-2 text-xs"
                        />
                    </div>
                    
                    <div className="flex gap-6 text-sm text-gray-400">
                        <Link href="/privacy-policy" className="hover:text-white transition-colors">
                            Kebijakan Privasi
                        </Link>
                        <Link href="/terms" className="hover:text-white transition-colors">
                            Syarat & Ketentuan
                        </Link>
                        <Link href="/sitemap" className="hover:text-white transition-colors">
                            Peta Situs
                        </Link>
                    </div>
                </div>
            </div>

            {/* Mobile Bottom Navigation Spacer (for fixed navigation) */}
            <div className="h-20 lg:hidden"></div>
        </footer>
    );
};

export default Footer;