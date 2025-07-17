import { styled, ThemeProvider, createTheme } from "@mui/material/styles";
import React, { useEffect, useState } from "react";
import { Head, router, useForm, usePage } from "@inertiajs/react";
import Header from "@/Components/frontpage/Header";
import Footer from "@/Components/frontpage/Footer";
import banner from "../../../../public/assets/img_backtoschool.jpg";

const theme = createTheme({
    palette: {
        primary: {
            main: "#008a01",
            light: "#66b967",
            dark: "#006e01",
            contrastText: "fff",
        },
    },
});

const ClassroomKPM = ({ flash, tempat_kpm, data }) => {
    return (
        <ThemeProvider theme={theme}>
            <Head title="Classroom" />
            <Header />

            <main className="flex py-2 justify-center gap-3 flex-wrap items-center w-full px-6  lg:px-10 z-[0]">
                {data?.classroom_kpm && (
                    <div className=" w-full max-w-screen-lg flex flex-wrap gap-3">
                        <div
                            className="flex flex-col bg-white border rounded-lg w-70 cursor-pointer hover:bg-primary/5"
                            onClick={(e) =>
                                router.visit(
                                    `/student/classroom/${data.classroom_kpm.id}/task`
                                )
                            }
                        >
                            <div className="w-full relative">
                                <img
                                    src={banner}
                                    className="w-full relative object-cover rounded-md"
                                ></img>
                            </div>
                            <div className="  flex flex-col justify-end text-textblack rounded-md">
                                <ul className="p-4">
                                    <li className="font-bold text-md ">
                                        {data.classroom_kpm.nama_tempat}
                                    </li>
                                    <li className="text-sm">
                                        PPKPM Ganjil 2025/2026
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                )}
                {data?.classroom_ppl && (
                    <div className=" w-full max-w-screen-lg flex flex-wrap gap-3">
                        <div
                            className="flex flex-col bg-white border rounded-lg w-70 cursor-pointer hover:bg-primary/5"
                            onClick={(e) =>
                                router.visit(`/student/classroom-ppl/tasks`)
                            }
                        >
                            <div className="w-full relative">
                                <img
                                    src={banner}
                                    className="w-full relative object-cover rounded-md"
                                ></img>
                            </div>
                            <div className="  flex flex-col justify-end text-textblack rounded-md">
                                <ul className="p-4">
                                    <li className="font-bold text-md ">
                                        {data.classroom_ppl.nama_tempat}
                                    </li>
                                    <li className="text-sm">
                                        PPKPM Ganjil 2025/2026
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                )}
            </main>
            <Footer currentTab={0} />
        </ThemeProvider>
    );
};

export default ClassroomKPM;
