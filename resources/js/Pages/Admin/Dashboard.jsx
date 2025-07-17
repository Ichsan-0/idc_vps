import React from "react";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Legend,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import Sidebar from "../../Components/admin/Sidebar/Sidebar";
import Header from "@/Components/admin/Header/Header";
import { TrendingDownOutlined } from "@mui/icons-material";
import { Head } from "@inertiajs/react";

const datapengunjung = [
    {
        name: "15 jun",
        pengunjung: 400,
    },
    {
        name: "16 jun",
        pengunjung: 300,
    },
    {
        name: "17 jun",
        pengunjung: 200,
    },
    {
        name: "18 jun",
        pengunjung: 278,
    },
    {
        name: "19 jun",
        pengunjung: 189,
    },
    {
        name: "20 jun",
        pengunjung: 239,
    },
    {
        name: "21 jun",
        pengunjung: 349,
    },
];

const Dashboard = ({ auth, data }) => {
    return (
        <section className="main flex">
            <div className="sidebarWrapper flex bg-[#1c2434]">
                <Sidebar tabId={0} />
                <Head title="Dashboard" />
            </div>
            <div className="flex-grow ml-72">
                <Header user={auth}></Header>
                <div className="space"></div>
                <div className="px-3">
                    <div className="flex w-full  h-full gap-y-2 flex-col">
                        <h1 className="font-semibold text-2xl">Dashboard</h1>
                        <p className="text-md text-gray-700 mb-4">
                            {`Welcome back, ${auth.user.name} We've missed you. 🥰👋`}
                        </p>
                        <hr />
                        <div className="mt-6">
                            <div className="flex gap-5 flex-wrap">
                                <div className="flex bg-white w-64 h-32 rounded-md p-3 shadow-sm gap-y-2">
                                    <div className="flex flex-col w-[70%] gap-2">
                                        <p className="text-secondary">
                                            Pengguna
                                        </p>
                                        <p className="text-secondary text-xl">
                                            {data.pengguna}
                                        </p>
                                        <div className="flex text-xs gap-2 items-center text-gray-600">
                                            <span className="text-xs p-1 rounded-md text-green-600 bg-green-300/20">
                                                +20%
                                            </span>
                                            since last week
                                        </div>
                                    </div>
                                    <div className="flex justify-center items-center w-[30%]">
                                        <TrendingUpIcon className="text-green-600" />
                                    </div>
                                </div>
                                <div className="flex bg-white w-64 h-32 rounded-md p-3 shadow-sm gap-y-2">
                                    <div className="flex flex-col w-[70%] gap-2">
                                        <p className="text-secondary">
                                            Sekolah
                                        </p>
                                        <p className="text-secondary text-xl">
                                            {data.sekolah}
                                        </p>
                                        <div className="flex text-xs gap-2 items-center text-gray-600">
                                            <span className="text-xs p-1 rounded-md text-green-600 bg-green-300/20">
                                                +30%
                                            </span>
                                            since last week
                                        </div>
                                    </div>

                                    <div className="flex justify-center items-center w-[30%]">
                                        <TrendingUpIcon className="text-green-600" />
                                    </div>
                                </div>
                                <div className="flex bg-white w-64 h-32 rounded-md p-3 shadow-sm gap-y-2">
                                    <div className="flex flex-col w-[70%] gap-2">
                                        <p className="text-secondary">Desa</p>
                                        <p className="text-secondary text-xl">
                                            {data.jumlah_desa}
                                        </p>
                                        <div className="flex text-xs gap-2 items-center text-gray-600">
                                            <span className="text-xs p-1 rounded-md text-green-600 bg-green-300/20">
                                                +30%
                                            </span>
                                            since last week
                                        </div>
                                    </div>

                                    <div className="flex justify-center items-center w-[30%]">
                                        <TrendingUpIcon className="text-green-600" />
                                    </div>
                                </div>
                                <div className="flex bg-white w-64 h-32 rounded-md p-3 shadow-sm gap-y-2">
                                    <div className="flex flex-col w-[70%] gap-2">
                                        <p className="text-secondary">
                                            Lowongan PPL
                                        </p>
                                        <p className="text-secondary text-xl">
                                            {data.lowongan}
                                        </p>
                                        <div className="flex text-xs gap-2 items-center text-gray-600">
                                            <span className="text-xs p-1 rounded-md text-green-600 bg-green-300/20">
                                                +1%
                                            </span>
                                            since last week
                                        </div>
                                    </div>
                                    <div className="flex justify-center items-center w-[30%]">
                                        <TrendingUpIcon className="text-green-600" />
                                    </div>
                                </div>

                                <div className="flex bg-white w-64 h-32 rounded-md p-3 shadow-sm gap-y-2">
                                    <div className="flex flex-col w-[70%] gap-2">
                                        <p className="text-secondary">
                                            Jumlah Supervisor
                                        </p>
                                        <p className="text-secondary text-xl">
                                            {data.supervisor}
                                        </p>
                                    </div>
                                    <div className="flex justify-center items-center w-[30%]">
                                        <TrendingUpIcon className="text-green-600" />
                                    </div>
                                </div>
                                {/* <div className="flex bg-white w-64 h-32 rounded-md p-3 shadow-sm gap-y-2">
                                    <div className="flex flex-col w-[70%] gap-2">
                                        <p className="text-secondary">
                                            Jumlah Mahasiswa Belum Dinput nilai
                                        </p>
                                        <p className="text-secondary text-xl">
                                            {data.nilaikosong}
                                        </p>
                                    </div>
                                    <div className="flex justify-center items-center w-[30%]">
                                        <TrendingDownOutlined className="text-red-500" />
                                    </div>
                                </div> */}
                                <div className="flex bg-white w-64 h-32 rounded-md p-3 shadow-sm gap-y-2">
                                    <div className="flex flex-col w-[70%] gap-2">
                                        <p className="text-secondary">
                                            Jumlah Mahasiswa Mendaftar
                                        </p>
                                        <p className="text-secondary text-xl">
                                            {data.mahasiswappl}
                                        </p>
                                    </div>
                                    <div className="flex justify-center items-center w-[30%]">
                                        <TrendingUpIcon className="text-green-600" />
                                    </div>
                                </div>
                                <div className="flex bg-white w-64 h-32 rounded-md p-3 shadow-sm gap-y-2">
                                    <div className="flex flex-col w-[70%] gap-2">
                                        <p className="text-secondary">
                                            Jumlah Mahasiswa Lulus Biodata
                                        </p>
                                        <p className="text-secondary text-xl">
                                            {data?.mahasiswa_lulus_biodata}
                                        </p>
                                    </div>
                                    <div className="flex justify-center items-center w-[30%]">
                                        <TrendingUpIcon className="text-green-600" />
                                    </div>
                                </div>
                                <div className="flex bg-white w-64 h-32 rounded-md p-3 shadow-sm gap-y-2">
                                    <div className="flex flex-col w-[70%] gap-2">
                                        <p className="text-secondary">
                                            Jumlah Mahasiswa Perempuan
                                        </p>
                                        <p className="text-secondary text-xl">
                                            {data?.jumlah_wanita}
                                        </p>
                                    </div>
                                    <div className="flex justify-center items-center w-[30%]">
                                        <TrendingUpIcon className="text-green-600" />
                                    </div>
                                </div>
                                <div className="flex bg-white w-64 h-32 rounded-md p-3 shadow-sm gap-y-2">
                                    <div className="flex flex-col w-[70%] gap-2">
                                        <p className="text-secondary">
                                            Jumlah Mahasiswa Laki-Laki
                                        </p>
                                        <p className="text-secondary text-xl">
                                            {data?.jumlah_pria}
                                        </p>
                                    </div>
                                    <div className="flex justify-center items-center w-[30%]">
                                        <TrendingUpIcon className="text-green-600" />
                                    </div>
                                </div>
                                <div className="flex bg-white w-64 h-32 rounded-md p-3 shadow-sm gap-y-2">
                                    <div className="flex flex-col w-[70%] gap-2">
                                        <p className="text-secondary">
                                            Jumlah Mahasiswa Tidak Lulus Biodata
                                        </p>
                                        <p className="text-secondary text-xl">
                                            {data?.mahasiswa_ditolak}
                                        </p>
                                    </div>
                                    <div className="flex justify-center items-center w-[30%]">
                                        <TrendingUpIcon className="text-green-600" />
                                    </div>
                                </div>
                                <div className="flex bg-white w-64 h-32 rounded-md p-3 shadow-sm gap-y-2">
                                    <div className="flex flex-col w-[70%] gap-2">
                                        <p className="text-secondary">
                                            Jumlah Mahasiswa Belum Melengkapi
                                            Biodata
                                        </p>
                                        <p className="text-secondary text-xl">
                                            {
                                                data?.mahasiswa_belum_lengkap_biodata
                                            }
                                        </p>
                                    </div>
                                    <div className="flex justify-center items-center w-[30%]">
                                        <TrendingUpIcon className="text-green-600" />
                                    </div>
                                </div>
                                <div className="flex bg-white w-64 h-32 rounded-md p-3 shadow-sm gap-y-2">
                                    <div className="flex flex-col w-[70%] gap-2">
                                        <p className="text-secondary">
                                            Jumlah Mahasiswa Yang Perlu Direview
                                            Biodata
                                        </p>
                                        <p className="text-secondary text-xl">
                                            {data?.mahasiswa_review}
                                        </p>
                                    </div>
                                    <div className="flex justify-center items-center w-[30%]">
                                        <TrendingUpIcon className="text-green-600" />
                                    </div>
                                </div>
                                <div className="flex bg-white w-64 h-32 rounded-md p-3 shadow-sm gap-y-2">
                                    <div className="flex flex-col w-[70%] gap-2">
                                        <p className="text-secondary">
                                            Jumlah Lamaran PPL Masuk
                                        </p>
                                        <p className="text-secondary text-xl">
                                            {data?.jumlah_lamaran_ppl_masuk}
                                        </p>
                                    </div>
                                    <div className="flex justify-center items-center w-[30%]">
                                        <TrendingUpIcon className="text-green-600" />
                                    </div>
                                </div>
                                <div className="flex bg-white w-64 h-32 rounded-md p-3 shadow-sm gap-y-2">
                                    <div className="flex flex-col w-[70%] gap-2">
                                        <p className="text-secondary">
                                            Jumlah Lamaran KPM Masuk
                                        </p>
                                        <p className="text-secondary text-xl">
                                            {data?.jumlah_lamaran_kpm_masuk}
                                        </p>
                                    </div>
                                    <div className="flex justify-center items-center w-[30%]">
                                        <TrendingUpIcon className="text-green-600" />
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 mt-6">
                                <div className="flex flex-col gap-y-3 w-full bg-white h-[600px] rounded-md shadow-sm p-4">
                                    <h3 className="font-bold text-lg">
                                        Jumlah Mahasiswa Yang Mendaftar
                                    </h3>
                                    <ResponsiveContainer>
                                        <BarChart
                                            data={data.recapperprodi_pendaftar}
                                            margin={{
                                                top: 5,
                                                right: 30,
                                                left: 20,
                                                bottom: 10,
                                            }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis
                                                dataKey="nama_prodi"
                                                angle={-30}
                                                textAnchor="end"
                                                height={120} // Increase the height to accommodate rotated text
                                                padding={{
                                                    top: 5,
                                                    right: 30,
                                                    left: 20,
                                                    bottom: 10,
                                                }}
                                            />
                                            <YAxis />
                                            <Tooltip />
                                            <Legend />
                                            <Bar
                                                dataKey="total"
                                                fill="#009dad"
                                            />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                            <div className="flex gap-3 mt-6 flex-col">
                                <div className="flex flex-col w-full gap-y-3 bg-white h-[600px] rounded-md shadow-sm p-4">
                                    <h3 className="font-bold text-lg">
                                        Jumlah Mahasiswa Diterima
                                    </h3>
                                    <ResponsiveContainer>
                                        <BarChart
                                            data={data.recapperprodi_lulus}
                                            margin={{
                                                top: 5,
                                                right: 30,
                                                left: 20,
                                                bottom: 10,
                                            }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis
                                                dataKey="nama_prodi"
                                                angle={-30}
                                                textAnchor="end"
                                                height={120} // Increase the height to accommodate rotated text
                                                padding={{
                                                    top: 5,
                                                    right: 30,
                                                    left: 20,
                                                    bottom: 10,
                                                }}
                                            />
                                            <YAxis />
                                            <Tooltip />
                                            <Legend />
                                            <Bar
                                                dataKey="total"
                                                fill="#00c29d"
                                            />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                            <div className="h-80"></div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Dashboard;
