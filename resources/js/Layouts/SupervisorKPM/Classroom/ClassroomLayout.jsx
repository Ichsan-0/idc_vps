import ButtomFooter from "@/Components/frontpage/ButtomFooter";
import Header from "@/Components/SupervisorKPM/Classroom/Header/Header";
import { Head, usePage } from "@inertiajs/react";
import React, { useState } from "react";

const ClassroomLayout = ({ children, title, disableScroll=false }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { url, component } = usePage();
    const { pathname, search } = new URL(url, window.location.origin);

    return (
        <div className={`dark:bg-boxdark-2 dark:text-bodydark ${disableScroll ? "overflow-hidden" : ""}   font-satoshi bg-white`}>
            <Head title={title}/>
            {/* <!-- ===== Page Wrapper Start ===== --> */}
            <div className="flex h-fit">
                {/* <!-- ===== Sidebar Start ===== --> */}
                {/* <Sidebar
                    sidebarOpen={sidebarOpen}
                    setSidebarOpen={setSidebarOpen}
                /> */}
                {/* <!-- ===== Sidebar End ===== --> */}

                {/* <!-- ===== Content Area Start ===== --> */}
                <div className="relative flex-1 flex-col">
                    {/* <!-- ===== Header Start ===== --> */}
                    <Header
                        sidebarOpen={sidebarOpen}
                        setSidebarOpen={setSidebarOpen}
                    />

                    {/* <!-- ===== Header End ===== --> */}

                    {/* <!-- ===== Main Content Start ===== --> */}
                    <main className="flex-1 ">
                        <div className="justify-center w-full flex">
                            {children}
                        </div>
                    </main>
                    {/* <ButtomFooter/> */}
                    {/* <!-- ===== Main Content End ===== --> */}
                </div>
                {/* <!-- ===== Content Area End ===== --> */}
            </div>
            {/* <!-- ===== Page Wrapper End ===== --> */}
        </div>
    );
};

export default ClassroomLayout;
