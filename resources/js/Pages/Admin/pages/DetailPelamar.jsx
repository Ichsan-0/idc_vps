import Header from "@/Components/admin/Header/Header";
import Sidebar from "@/Components/admin/Sidebar/Sidebar";
import BorderTable from "@/Components/BorderTable";
import MUIDataTable from "mui-datatables";
import React from "react";
import DetailPelamarPPLTable from "./detailpelamar/DetailPelamarPPLTable";
import { router, useForm } from "@inertiajs/react";

const DetailPelamar = ({ pelamarppl }) => {
    

    return (
        <section className="main flex overflow-hidden">
            <div className="sidebarWrapper flex">
                <Sidebar tabId={2} />
            </div>
            <div className="content-right w-full">
                <Header></Header>
                <div className="space"></div>
                <div className="px-3 max-w-3xl">
                    <DetailPelamarPPLTable pelamarppl={pelamarppl} />
                </div>
            </div>
        </section>
    );
};
export default DetailPelamar;
