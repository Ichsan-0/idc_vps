import Header from "@/Components/OperatorKecamatan/Header/Header";
import Sidebar from "@/Components/OperatorKecamatan/Sidebar/Sidebar";
import React, { useState } from "react";

const OperatorKecamatanLayout = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="dark:bg-boxdark-2 dark:text-bodydark font-satoshi">
            {/* <!-- ===== Page Wrapper Start ===== --> */}
            <div className="flex h-screen overflow-hidden">
                {/* <!-- ===== Sidebar Start ===== --> */}
                <Sidebar
                    sidebarOpen={sidebarOpen}
                    setSidebarOpen={setSidebarOpen}
                />
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
                        <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
                            {children}
                        </div>
                        <footer className="bg-white border-t border-gray-200 py-6 px-4">
                            <div className="max-w-screen-2xl mx-auto">
                                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                                    <div className="text-gray-600">
                                        <p className="font-medium">
                                            © {new Date().getFullYear()} Rifadata
                                        </p>
                                        <p className="text-sm mt-1">
                                            All rights reserved
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-6 text-sm text-gray-500">
                                        <a
                                            href="#"
                                            className="hover:text-primary transition-colors"
                                        >
                                            Privacy Policy
                                        </a>
                                        <a
                                            href="#"
                                            className="hover:text-primary transition-colors"
                                        >
                                            Terms of Service
                                        </a>
                                        <a
                                            href="#"
                                            className="hover:text-primary transition-colors"
                                        >
                                            Contact
                                        </a>
                                    </div>
                                </div>
                                <div className="mt-4 pt-4 border-t border-gray-100 text-center text-xs text-gray-400">
                                    <p>
                                        Version 2.0.0 
                                    </p>
                                </div>
                            </div>
                        </footer>
                    </main>
                    {/* <!-- ===== Main Content End ===== --> */}
                </div>
                {/* <!-- ===== Content Area End ===== --> */}
            </div>
            {/* <!-- ===== Page Wrapper End ===== --> */}
        </div>
    );
};

export default OperatorKecamatanLayout;
