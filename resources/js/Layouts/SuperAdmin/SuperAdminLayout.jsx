import axios from "axios";
import { useEffect, useState } from "react";
import Header from "@/Components/SuperAdmin/Header/Header";
import Sidebar from "@/Components/SuperAdmin/Sidebar/Sidebar";
import { Head } from "@inertiajs/react";

const SuperAdminLayout = ({ children, title = "IDC" }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Get base URL from env
        const baseUrl = import.meta.env.VITE_API_BASE_URL || "";

        axios
            .get(`${baseUrl}/sanctum/csrf-cookie`)
            .then(() => {
                setLoading(false);
                console.log("CSRF cookie set.");
            })
            .catch((error) => {
                setLoading(false);
                console.error("Failed to get CSRF cookie:", error);
            });
    }, []);

    if (!loading) {
        return (
            <div className="dark:bg-boxdark-2 dark:text-bodydark font-satoshi">
                <Head title={title} />
                <div className="flex h-screen overflow-hidden">
                    <Sidebar
                        sidebarOpen={sidebarOpen}
                        setSidebarOpen={setSidebarOpen}
                    />
                    <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
                        <Header
                            sidebarOpen={sidebarOpen}
                            setSidebarOpen={setSidebarOpen}
                        />
                        <main>
                            <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
                                {children}
                            </div>
                        </main>
                    </div>
                </div>
            </div>
        );
    }
};

export default SuperAdminLayout;
