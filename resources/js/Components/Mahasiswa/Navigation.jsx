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
    const { url } = usePage();
    const { pathname } = new URL(url, window.location.origin);

    const navigationItems = [
        // {
        //     id: "Lowongan KPM",
        //     icon: MapPinHouse,
        //     label: "Lowongan KPM",
        //     path: "/kpm-vacancies",
        // },
        // {
        //     id: "Lowngan PPL",
        //     icon: School,
        //     label: "Lowngan PPL",
        //     path: "/ppl-vacancies",
        // },
        // {
        //     id: "Lamaranku",
        //     icon: Files,
        //     label: "Lamaranku",
        //     path: "/my-proposal",
        // },
        {
            id: "Classroom",
            icon: SquareLibrary,
            label: "Classroom",
            path: "/classroom",
        },
        { id: "Nilai", icon: Shield, label: "Nilai", path: "/grade" },
        { id: "Profile", icon: User, label: "Profile", path: "/profil" },
    ];

    return (
        <>
            {/* Desktop Navigation - Right Center */}
            <nav className="hidden lg:block fixed right-8 top-1/2 transform -translate-y-1/2 z-50">
                <div className="bg-white rounded-2xl shadow-lg p-2 space-y-2">
                    {navigationItems.map((item) => {
                        const IconComponent = item.icon;
                        return (
                            <button
                                key={item.id}
                                onClick={() => {
                                    router.get(item.path);
                                }}
                                className={`
                  group relative flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-300
                  ${
                      pathname === item.path || pathname.includes(item.path)
                          ? "bg-[#06359f] text-white shadow-lg"
                          : "text-gray-600 hover:bg-gray-100 hover:text-[#06359f]"
                  }
                `}
                            >
                                <IconComponent className="w-5 h-5" />
                                <div className="absolute right-full mr-3 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                                    {item.label}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </nav>

            {/* Mobile Navigation - Bottom */}
            <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
                <div className="flex justify-around items-center py-2">
                    {navigationItems.slice(0, 5).map((item) => {
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
                      pathname === item.path || pathname.includes(item.path)
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
