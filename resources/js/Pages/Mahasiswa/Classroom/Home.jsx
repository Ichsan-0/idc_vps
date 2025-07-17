import ClassroomLayout from "@/Layouts/Mahasiswa/Classroom/ClassroomLayout";
import React from "react";
import banner from "../../../../../public/assets/img_backtoschool.jpg";
import { BiTask } from "react-icons/bi";
import { Head, router } from "@inertiajs/react";
import { useState } from "react";
import axios from "axios";
import { useEffect } from "react";
import { ThreeDot } from "react-loading-indicators";

const Home = ({ base_url, id }) => {
    const [data, setData] = useState(null);
    const [responseError, setResponseError] = useState(null);
    const [loading, setLoading] = useState(false);

    const getData = async () => {
        setLoading(true);
        try {
            const response = await axios.get(
                `${base_url}/api/student/classroom/${id}/task`
            );

            if (response?.data?.success === true) {
                setData(response?.data?.data);
            }
        } catch (err) {
            setResponseError(err?.response?.data?.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getData();
    }, []);

    return (
        <ClassroomLayout>
            <Head title="Tugas kelas" />
            {loading && (
                <div className="absolute z-10 w-full h-full flex items-center justify-center bg-white/70">
                    <ThreeDot color="#4F61E3" size="medium" />
                </div>
            )}
            <div className="bg-white w-full  flex flex-col gap-y-3">
                <div className="w-full relative">
                    <img
                        src={banner}
                        className="w-full relative object-cover rounded-md"
                    ></img>
                    <div className="absolute inset-0 flex flex-col justify-end text-white bg-black-2/25 rounded-md">
                        <ul className="p-4">
                            <li className="font-bold text-xl md:text-2xl lg:text-4xl ">
                                {data?.name}
                            </li>
                            <li className="text-md md:text-lg lg:text-xl">
                                PPKPM Ganjil 2025/2026
                            </li>
                        </ul>
                    </div>
                </div>
                {/* #129eaf */}
                <ul className="flex flex-col gap-y-3">
                    {data?.tasks?.map((item) => (
                        <li
                            key={item.id}
                            className="w-full border-2 rounded-lg p-3 flex gap-x-3 bg-white hover:bg-primary/5 cursor-pointer"
                            onClick={(e) =>
                                router.visit(
                                    `/student/classroom/${id}/task/detail/${item.id}`
                                )
                            }
                        >
                            <div className="bg-[#129eaf] w-fit h-fit p-3 rounded-full">
                                <svg
                                    focusable="false"
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    className="fill-white"
                                >
                                    <path d="M7 15h7v2H7zm0-4h10v2H7zm0-4h10v2H7z"></path>
                                    <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-.14 0-.27.01-.4.04a2.008 2.008 0 0 0-1.44 1.19c-.1.23-.16.49-.16.77v14c0 .27.06.54.16.78s.25.45.43.64c.27.27.62.47 1.01.55.13.02.26.03.4.03h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7-.25c.41 0 .75.34.75.75s-.34.75-.75.75-.75-.34-.75-.75.34-.75.75-.75zM19 19H5V5h14v14z"></path>
                                </svg>
                            </div>
                            <div className="">
                                <h3 className="font-bold text-[#3c4043]">
                                    {item?.name}
                                </h3>
                                <p className=" text-[#3c4043]">
                                    {item?.tenggat}
                                </p>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </ClassroomLayout>
    );
};

export default Home;
