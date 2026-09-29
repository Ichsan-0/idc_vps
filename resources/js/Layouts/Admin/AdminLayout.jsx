import Header from "@/Components/AdminNew/Header/Header";
import Sidebar from "@/Components/AdminNew/Sidebar/Sidebar";
import AppFooter from "@/Components/Common/AppFooter";
import { Head } from "@inertiajs/react";
import React, { useState } from "react";

const AdminLayout = ({ children, title="IDC" }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
        if (typeof window !== "undefined") {
            return localStorage.getItem("idc_sidebar_collapsed") === "true";
        }
        return false;
    });

    const toggleSidebarCollapsed = () => {
        setSidebarCollapsed((prev) => {
            const next = !prev;
            if (typeof window !== "undefined") {
                localStorage.setItem("idc_sidebar_collapsed", next ? "true" : "false");
            }
            return next;
        });
    };

    return (
        <div className="dark:bg-boxdark-2 dark:text-bodydark font-satoshi">
            <Head title={title}/>
            {/* <!-- ===== Page Wrapper Start ===== --> */}
            <div className="flex h-screen overflow-hidden bg-gray-50/50 dark:bg-boxdark-2">
                {/* <!-- ===== Sidebar Start ===== --> */}
                <Sidebar
                    sidebarOpen={sidebarOpen}
                    setSidebarOpen={setSidebarOpen}
                    sidebarCollapsed={sidebarCollapsed}
                    setSidebarCollapsed={setSidebarCollapsed}
                    toggleSidebarCollapsed={toggleSidebarCollapsed}
                />
                {/* <!-- ===== Sidebar End ===== --> */}

                {/* <!-- ===== Content Area Start ===== --> */}
                <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden min-w-0">
                    {/* <!-- ===== Header Start ===== --> */}
                    <Header
                        sidebarOpen={sidebarOpen}
                        setSidebarOpen={setSidebarOpen}
                        sidebarCollapsed={sidebarCollapsed}
                        toggleSidebarCollapsed={toggleSidebarCollapsed}
                    />
                    {/* <!-- ===== Header End ===== --> */}

                    {/* <!-- ===== Main Content Start ===== --> */}
                    <main className="w-full min-w-0 flex-1 flex flex-col justify-between">
                        <div className="mx-auto w-full max-w-screen-2xl p-4 md:p-6 2xl:p-10 flex-1">
                            {children}
                        </div>
                        <AppFooter />
                    </main>
                    {/* <!-- ===== Main Content End ===== --> */}
                </div>
                {/* <!-- ===== Content Area End ===== --> */}
            </div>
            {/* <!-- ===== Page Wrapper End ===== --> */}
        </div>
    );
};

export default AdminLayout;
