import React from "react";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import {
    Bar,
    BarChart,
    CartesianGrid,
    Legend,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import AdminLayout from "@/Layouts/Admin/AdminLayout";
import CountCard from "@/Components/AdminNew/Dashboard/CountCard";
import { useState } from "react";
import axios from "axios";
import { config } from "@/config/config";
import { useEffect } from "react";
import CountCardSkeleton from "@/Components/AdminNew/Dashboard/CountCardSkeleton";
import ChartSkeleton from "@/Components/AdminNew/Dashboard/ChartSekeleton";

const Dashboard = ({ auth }) => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState([]);

    const getData = async () => {
        try {
            setLoading(true);
            const res = await axios.get('/admin/dashboard/get-data');
            setData(res.data.data);
        } catch (error) {
            setLoading(false);
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getData();
    }, []);
    return (
        <AdminLayout title="Analytic">
            <section className="main flex">
                <div className="sidebarWrapper flex bg-[#1c2434]"></div>
                <div className="flex-grow">
                    <div className="space"></div>
                    <div className="px-3">
                        <div className="flex w-full  h-full gap-y-2 flex-col">
                            <h1 className="font-semibold text-2xl">
                                Dashboard
                            </h1>
                            <p className="text-md text-gray-700 mb-4">
                                {`Welcome back, ${auth.user.name} We've missed you. 🥰👋`}
                            </p>
                            <hr />
                            <div className="mt-6">
                                {/* <CountCard /> */}

                                <div className="flex flex-col gap-4 md:gap-6">
                                    {/* Top Count Card */}
                                    <div>
                                        {loading ? (
                                            <CountCardSkeleton />
                                        ) : (
                                            <CountCard data={data} />
                                        )}
                                    </div>

                                    {/* Charts Side-by-Side */}
                                    <div className="flex flex-col md:flex-row gap-4 md:gap-6 w-full">
                                        {loading ? (
                                            <>
                                                <ChartSkeleton />
                                                <ChartSkeleton />
                                            </>
                                        ) : (
                                            <>
                                                {/* Chart: Mahasiswa Mendaftar */}

                                                <div className="flex-1">
                                                    <div className="flex flex-col h-[600px] bg-white p-4 rounded-2xl border border-gray-200 ">
                                                        <h3 className="text-lg mb-2">
                                                            Jumlah Mahasiswa
                                                            Yang Mendaftar
                                                        </h3>
                                                        <ResponsiveContainer
                                                            width="100%"
                                                            height="100%"
                                                        >
                                                            <BarChart
                                                                data={
                                                                    data.recapperprodi_pendaftar
                                                                }
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
                                                                    height={120}
                                                                    padding={{
                                                                        left: 10,
                                                                        right: 10,
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

                                                {/* Chart: Mahasiswa Diterima */}
                                                <div className="flex-1">
                                                    <div className="flex flex-col h-[600px] bg-white p-4 rounded-2xl border border-gray-200 ">
                                                        <h3 className="text-lg mb-2">
                                                            Jumlah Mahasiswa
                                                            Diterima
                                                        </h3>
                                                        <ResponsiveContainer
                                                            width="100%"
                                                            height="100%"
                                                        >
                                                            <BarChart
                                                                data={
                                                                    data.recapperprodi_lulus
                                                                }
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
                                                                    height={120}
                                                                    padding={{
                                                                        left: 10,
                                                                        right: 10,
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
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* <div className="h-80"></div> */}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </AdminLayout>
    );
};

export default Dashboard;
