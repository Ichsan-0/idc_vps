import Header from "@/Components/SupervisorKPM/Classroom/Header/Header";
import { usePage } from "@inertiajs/react";
import React, { useState } from "react";

const ClassroomLayout = ({ children }) => {
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
                <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
                    {/* <!-- ===== Header Start ===== --> */}
                    <Header
                        sidebarOpen={sidebarOpen}
                        setSidebarOpen={setSidebarOpen}
                    />

                    {/* <!-- ===== Header End ===== --> */}

                    {/* <!-- ===== Main Content Start ===== --> */}
                    <main>
                        <div className="mx-auto  p-4 md:p-6 2xl:p-10 justify-center flex">
                            {children}
                        </div>
                    </main>
                    {/* <!-- ===== Main Content End ===== --> */}
                </div>
                {/* <!-- ===== Content Area End ===== --> */}
            </div>
            {/* <!-- ===== Page Wrapper End ===== --> */}
        </div>
    );
};

export default ClassroomLayout;
