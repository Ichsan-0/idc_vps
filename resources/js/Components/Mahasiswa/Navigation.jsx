import React from "react";
import {
    Home,
    User,
    Settings,
    Search,
    Heart,
    MessageCircle,
    Shield,
    Files,
    School,
    SquareLibrary,
    MapPinHouse,
} from "lucide-react";
import { useState } from "react";
import { router, usePage } from "@inertiajs/react";

const Navigation = () => {
    const { props, url } = usePage();
    const { pathname } = new URL(url, window.location.origin);
    const hasUser = props.auth && props.auth.user;
    const isMahasiswa = hasUser && props.auth.user.role === "user";

    // Cek apakah mahasiswa sudah memiliki data lokasi KPM atau PPL
    const hasLokasiFromPage = Boolean(
        (props.data?.classroom_kpm && props.data.classroom_kpm.length > 0) ||
        (props.data?.classroom_ppl && props.data.classroom_ppl.length > 0)
    );
    const hasLokasi = Boolean(
        props.auth?.has_lokasi ||
        props.auth?.has_lokasi_kpm ||
        props.auth?.has_lokasi_ppl ||
        hasLokasiFromPage
    );

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

    const filteredItems = React.useMemo(() => {
        return navigationItems.filter((item) => {
            if (isMahasiswa && hasLokasi) {
                if (["Lowongan KPM", "Lowongan PPL", "Lamaranku"].includes(item.id)) {
                    return false;
                }
            }
            return true;
        });
    }, [isMahasiswa, hasLokasi]);

    return (
        <>
            {/* Mobile Navigation - Bottom */}
            <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
                <div className="flex justify-around items-center py-2">
                    {filteredItems.map((item) => {
                        const IconComponent = item.icon;
                        return (
                            <button
                                key={item.id}
                                onClick={() => {
                                    router.get(item.path);
                                }}
                                className={`
                   flex flex-col items-center justify-center p-2 min-w-0 flex-1 transition-colors duration-200
                   ${
                       pathname === item.path || pathname.includes(item.path) || (item.id === "Classroom" && (pathname.startsWith("/student/classroom") || pathname.startsWith("/classroom")))
                           ? "text-[#06359f]"
                           : "text-gray-600"
                   }
                 `}
                            >
                                <IconComponent className="w-5 h-5 mb-1" />
                                <span className="text-xs font-medium truncate">
                                    {item.label}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </nav>
        </>
    );
};

export default Navigation;
