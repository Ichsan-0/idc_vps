import AppFooter from "@/Components/Common/AppFooter";
import Header from "@/Components/SupervisorKPM/HomeClassroom/Header/Header";
import { usePage } from "@inertiajs/react";
import React, { useState } from "react";

const HomeClassroomLayout = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { url, component } = usePage();
    const { pathname, search } = new URL(url, window.location.origin);

    return (
        <div className="dark:bg-boxdark-2 dark:text-bodydark font-satoshi bg-white">
            {/* <!-- ===== Page Wrapper Start ===== --> */}
            <div className="flex h-screen overflow-hidden">
                {/* <!-- ===== Sidebar Start ===== --> */}
                {/* <Sidebar
                    sidebarOpen={sidebarOpen}
                    setSidebarOpen={setSidebarOpen}
                /> */}
                {/* <!-- ===== Sidebar End ===== --> */}

                {/* <!-- ===== Content Area Start ===== --> */}
                <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden min-w-0">
                    {/* <!-- ===== Header Start ===== --> */}
                    <Header
                        sidebarOpen={sidebarOpen}
                        setSidebarOpen={setSidebarOpen}
                    />

                    {/* <!-- ===== Header End ===== --> */}

                    {/* <!-- ===== Main Content Start ===== --> */}
                    <main className="flex-1 flex flex-col justify-between">
                        <div className="mx-auto max-w-screen-lg p-4 md:p-6 2xl:p-10 justify-center flex flex-1 w-full">
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

export default HomeClassroomLayout;
