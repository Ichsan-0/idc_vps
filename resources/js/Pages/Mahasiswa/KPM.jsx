import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
    Alert,
    Snackbar,
    Box,
    ThemeProvider,
    createTheme,
    LinearProgress,
} from "@mui/material";
import { Head } from "@inertiajs/react";
import axios from "axios";
import Header from "@/Components/frontpage/Header";
import { kabupaten, kecamatan, desa } from "daftar-wilayah-indonesia";
import LowonganList from "@/Components/Mahasiswa/LowonganKPM/LowonganList";
import PaginationControls from "@/Components/Mahasiswa/LowonganKPM/PaginationControlls";
import FilterWilayah from "@/Components/Mahasiswa/LowonganKPM/FilterWilayah";
import ButtomFooter from "@/Components/frontpage/ButtomFooter";
import Navigation from "@/Components/Mahasiswa/Navigation";

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

export default function KPM({ flash }) {
    const [notify, setNotify] = useState(!!flash.message);
    const [notifyStatus, setNotifyStatus] = useState("default");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [dataLowongan, setDataLowongan] = useState([]);
    const [rawData, setRawData] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(null);
    const [filters, setFilters] = useState({
        regency: "",
        sub_district: "",
        village: "",
    });

    const [regency, setRegency] = useState(null);
    const [subDistrict, setSubDistrict] = useState(null);
    const [village, setVillage] = useState(null);
    const listOfRegencies = useMemo(() => kabupaten("11"), []);
    const [listOfSubdistricts, setListOfSubdistricts] = useState([]);
    const [listOfVillages, setListOfVillages] = useState([]);

    useEffect(() => {
        if (flash.message) {
            setNotifyStatus(flash.message.success ? "success" : "error");
            setNotify(true);
        }
    }, [flash.message]);

    const fetchData = async (filterParams = filters, page = currentPage) => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get("/api/lowongankpm", {
                params: { page, ...filterParams },
            });
            const { data } = response;
            setDataLowongan(data.data);
            setRawData(data);
            setTotalPages(data?.last_page ?? 0);
        } catch (err) {
            setError(err.response?.data?.message || "An error occurred");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [currentPage]);

    const handleFilter = () => {
        const newFilters = {
            regency: regency?.kode,
            sub_district: subDistrict?.kode,
            village: village?.kode,
        };
        console.log(newFilters);
        setFilters(newFilters);
        setCurrentPage(1);
        fetchData(newFilters, 1);
    };

    const getLocationDetails = useCallback((kpm) => {
        const kab = kabupaten("11").find((i) => i.kode === kpm.regency)?.nama;
        const kec = kecamatan(kpm.regency).find((i) => i.kode === kpm.sub_district)?.nama;
        const des = desa(kpm.sub_district).find((i) => i.kode === kpm.village)?.nama;
        return `${kab}, ${kec}, ${des}`;
    }, []);


    return (
        <ThemeProvider theme={theme}>
            <Head title="Lowongan KPM" />
            <Header />
            {/* {flash.message && (
                <Snackbar open={notify} autoHideDuration={3000} onClose={() => setNotify(false)} anchorOrigin={{ vertical: "top", horizontal: "right" }}>
                    <Alert onClose={() => setNotify(false)} severity={notifyStatus} variant="filled" sx={{ width: "100%" }}>
                        {flash.message[notifyStatus]}
                    </Alert>
                </Snackbar>
            )} */}

            <main className="flex flex-col items-center w-full px-6 lg:px-10 z-[0]">
                <section className="bg-white w-full shadow-xl ring-gray-200 rounded-xl px-4 pt-3 max-w-5xl mt-4">
                    <div className="py-5 flex flex-col gap-y-4">
                        <h2 className="text-neutral-600 font-medium text-lg">
                            Pilihan Tempat KPM
                        </h2>

                        <FilterWilayah
                            regency={regency}
                            subDistrict={subDistrict}
                            village={village}
                            listOfRegencies={listOfRegencies}
                            listOfSubdistricts={listOfSubdistricts}
                            listOfVillages={listOfVillages}
                            onRegencyChange={(val) => {
                                setRegency(val);
                                setSubDistrict(null);
                                setVillage(null);
                                setListOfSubdistricts(kecamatan(val.kode));
                                setListOfVillages([]);
                            }}
                            onSubDistrictChange={(val) => {
                                setSubDistrict(val);
                                setVillage(null);
                                setListOfVillages(desa(val.kode));
                            }}
                            onVillageChange={setVillage}
                            onFilterClick={handleFilter}
                            // onFilterClick={() => console.log("test")}
                        />

                        <hr className="border-gray-200" />

                        <LowonganList
                            data={dataLowongan}
                            loading={loading}

                        />

                        <PaginationControls
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onChange={setCurrentPage}
                        />
                    </div>
                </section>
            </main>
            <ButtomFooter />
            {/* <Footer currentTab={0} /> */}
            <Navigation />
        </ThemeProvider>
    );
}
