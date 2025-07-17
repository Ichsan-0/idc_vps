import React from "react";
import banner from "../../../../../public/assets/img_backtoschool.jpg";
import { BiTask } from "react-icons/bi";
import { Head, router } from "@inertiajs/react";
import HomeClassroomLayout from "@/Layouts/SupervisorKPM/Classroom/HomeClassroomLayout";

const Home = ({ kelas, kelas_ppl }) => {
    return (
        <HomeClassroomLayout>
            <Head title="Classroom" />
            <div className="bg-white w-full flex flex-wrap gap-3">
                {kelas.map((item) => (
                    <div
                        key={item.id}
                        className="flex flex-col bg-white border rounded-lg w-70 cursor-pointer hover:bg-primary/5"
                        onClick={(e) =>
                            router.visit(
                                `/supervisor-kpm/classroom/${item.id}/task`
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
                                    {item.name}
                                </li>
                                <li className="text-sm">
                                    PPKPM Ganjil 2025/2026
                                </li>
                            </ul>
                        </div>
                    </div>
                ))}
                {kelas_ppl.map((item) => (
                    <div
                        key={item.id}
                        className="flex flex-col bg-white border rounded-lg w-70 cursor-pointer hover:bg-primary/5"
                        onClick={(e) =>
                            router.visit(`/supervisor-ppl/classroom/${item.id}`)
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
                                    {item.name}
                                </li>
                                <li className="text-sm">
                                    PPKPM Ganjil 2025/2026
                                </li>
                            </ul>
                        </div>
                    </div>
                ))}
            </div>
        </HomeClassroomLayout>
    );
};

export default Home;
