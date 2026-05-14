import React from "react";
import { Head, router } from "@inertiajs/react";
import { Alert, AlertTitle, Button, Chip } from "@mui/material";

import { useState } from "react";
import { useEffect } from "react";
import { ThreeDot } from "react-loading-indicators";
import { useRef } from "react";
import axios from "axios";
import SupervisorPPLLayout from "@/Layouts/SupervisorKPM/ClassroomPPL/SupervisorPPLLayout";
import { createContext } from "react";
import SekolahProvider from "@/Context/SekolahContext";
import { MdOpenInNew } from "react-icons/md";

const ListMahasiswa = ({
    daftarmahasiswa,
    message,
    base_url,
    flash,
    data_opt,
    data,
}) => {
    const [openDialog, setOpenDialog] = useState(false);
    const [idObjToDelete, setIdObjToDelete] = useState(null);
    const [notify, setNotify] = useState(flash.message !== null ? true : false);
    const [notifyStatus, setNotifyStatus] = useState("default");
    const [dropdownOpen, setDropdownOpen] = useState(null);
    const dropdownRef = useRef(null);
    const [loading, setLoading] = useState(false);
    const [dataMahasiswa, setDataMahasiswa] = useState([]);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [searchKey, setSearchKey] = useState("");
    const [visiblePages, setVisiblePages] = useState([]);
    const [prevPage, setPrevPage] = useState(null);

    const getVisiblePages = (page, dataRuang) => {
        let totalPages = Math.ceil(dataRuang.total / dataRuang?.data?.length);

        const vvisiblePages = [];
        if (totalPages <= 5) {
            for (let i = 1; i <= totalPages; i++) {
                vvisiblePages.push(i);
            }
        } else {
            vvisiblePages.push(1);

            if (page > 4) vvisiblePages.push("...");

            for (
                let i = Math.max(2, page - 1);
                i <= Math.min(totalPages - 1, page + 1);
                i++
            ) {
                vvisiblePages.push(i);
            }

            if (page < totalPages - 3) vvisiblePages.push("...");

            vvisiblePages.push(totalPages);
        }
        setVisiblePages(vvisiblePages);
    };

    const fetchData = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await axios.get(
                `${base_url}/api/classroom/supervisor-ppl/mahasiswa?search_key=${searchKey}&id_sekolah=${data.id_sekolah}`
            );
            if (response?.data.success === true) {
                setDataMahasiswa(response.data.data);
            }
            console.log(response);
        } catch (err) {
            console.log(err);
            setError(err.response?.data?.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    const deleteRecords = async (id) => {
        setLoading(true);
        setError(null);

        try {
            const response = await axios.post(
                `${base_url}/api/operator-sekolah/data/kepsek-pamong/delete/${id}`
            );
            fetchData();
            console.log(response);
        } catch (err) {
            setError(err.response?.data?.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (currentPage !== prevPage || message !== null) {
            fetchData(); // Only fetch if currentPage is different from prevPage
            setPrevPage(currentPage); // Update prevPage
        }
    }, [currentPage, prevPage]);

    const handlePageChange = (page) => {
        if (page >= 1 && page <= lastPage) {
            setCurrentPage(page);
        }
    };

    const toggleDropdown = (id) => {
        setDropdownOpen((prevOpen) => (prevOpen === id ? null : id));
    };

    // Handle clicks outside the dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target)
            ) {
                setDropdownOpen(null);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const onDialogClose = () => {
        setOpenDialog(false);
        setIdObjToDelete(null);
    };

    const handleConfirmClick = (e) => {
        e.preventDefault();
        // router.post(
        //     `/admin/supervisor/${idObjToDelete}`,
        //     { _method: "delete" },
        //     { preserveScroll: true }
        // );
        onDialogClose();
    };

    useEffect(() => {
        if (flash.message) {
            console.log("notify");
            if (flash.message.success) {
                setNotifyStatus("success");
            } else {
                setNotifyStatus("error");
            }
        }
        setNotify(true);
    }, [flash.message]);

    const handleCloseNotify = (event, reason) => {
        if (reason === "clickaway") {
            return;
        }
        setNotify(false);
    };

    const SekolahContect = createContext();
    return (
        <SekolahProvider data={data}>
            <SupervisorPPLLayout>
                <Head title="Mahasiswa PPL" />
                <div className="px-3">
                    <div className="flex w-full justify-start gap-x-2 py-2">
                        {/* <Button
                            variant="contained"
                            disableElevation
                            sx={{ textTransform: "capitalize" }}
                            onClick={(e) => {
                                e.preventDefault();
                                // router.visit("/admin/addmahasiswa");
                            }}
                        >
                            Import
                        </Button> */}
                        {/* <Button
                        variant="contained"
                        disableElevation
                        disabled={loading}
                        sx={{ textTransform: "capitalize" }}
                        onClick={(e) => {
                            // e.preventDefault();
                            router.visit(
                                "/operator-sekolah/data/kepsek_pamong/add"
                            );
                        }}
                    >
                        Tambah
                    </Button> */}
                    </div>

                    <p>{error}</p>
                    <div className="bg-white dark:bg-gray-800 gap-y-2 flex flex-col p-3 relative shadow-md sm:rounded-lg overflow-hidden">
                        <Alert severity="info">
                            <AlertTitle>Petunjuk</AlertTitle>
                            <ol class="!list-decimal pl-5 space-y-2">
                                <li>
                                    Isi nilai mahasiswa dengan status belum
                                    dinilai
                                </li>
                                <li>
                                    Siapkan berkas instrument setiap mahasiswa
                                    dalam format file pdf, dengan ukuran
                                    maksimal 500kb
                                </li>
                            </ol>
                        </Alert>
                        {/* <Alert severity="warning">
                            <AlertTitle>Warning</AlertTitle>
                            Masih terdapat mahasiswa yang belum diisi nilainya
                            🙏
                        </Alert> */}
                        {/* <div className="flex flex-col md:flex-row items-center justify-between space-y-3 md:space-y-0 md:space-x-4 p-4">
                            <div className="flex items-center w-full">
                                <label for="simple-search" className="sr-only">
                                    Search
                                </label>
                                <div className="relative w-full">
                                    <input
                                        type="text"
                                        onChange={(e) => {
                                            setSearchKey(e.target.value);
                                        }}
                                        id="simple-search"
                                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full ps-5 p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                        placeholder="Search"
                                        required
                                    />
                                </div>
                                <button
                                    onClick={() => {
                                        setCurrentPage(1);
                                        fetchData();
                                    }}
                                    className="p-2.5 ms-2 text-sm font-medium text-white bg-blue-700 rounded-lg border border-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                                >
                                    <svg
                                        className="w-4 h-4"
                                        aria-hidden="true"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 20 20"
                                    >
                                        <path
                                            stroke="currentColor"
                                            stroke-linecap="round"
                                            stroke-linejoin="round"
                                            stroke-width="2"
                                            d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                                        />
                                    </svg>
                                    <span className="sr-only">Search</span>
                                </button>
                            </div>
                        </div> */}
                        <div className="relative overflow-x-auto min-h-50 py-3">
                            {loading && (
                                <div className="absolute z-10 w-full h-full flex items-center justify-center bg-white/70">
                                    <ThreeDot color="#4F61E3" size="medium" />
                                </div>
                            )}

                            <table className="w-full relative text-sm text-left text-gray-500 dark:text-gray-400 ">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                    <tr>
                                        <th scope="col" className="px-4 py-3">
                                            No
                                        </th>
                                        <th scope="col" className="px-4 py-3">
                                            Nama
                                        </th>
                                        <th scope="col" className="px-4 py-3">
                                            NIM
                                        </th>

                                        <th scope="col" className="px-4 py-3">
                                            Prodi
                                        </th>

                                        <th scope="col" className="px-4 py-3">
                                            Tempat PPL
                                        </th>
                                        <th scope="col" className="px-4 py-3">
                                            Nilai Pamong
                                        </th>
                                        <th scope="col" className="px-4 py-3">
                                            Nilai Supervisor
                                        </th>
                                        <th scope="col" className="px-4 py-3">
                                            Status
                                        </th>

                                        <th scope="col" className="px-4 py-3">
                                            <span className="sr-only">
                                                Actions
                                            </span>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {dataMahasiswa?.map((item, index) => (
                                        <tr
                                            key={index}
                                            className="border-b dark:border-gray-700"
                                        >
                                            <th
                                                scope="row"
                                                className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                                            >
                                                {item.number}
                                            </th>
                                            <td className="px-4 py-3">
                                                {item?.nama_mahasiswa}
                                            </td>
                                            <td className="px-4 py-3">
                                                {item?.nim}
                                            </td>
                                            <td className="px-4 py-3">
                                                {item?.nama_prodi}
                                            </td>
                                            <td className="px-4 py-3">
                                                {item?.nama_sekolah}
                                            </td>
                                            <td className="px-4 py-3">
                                                {item?.nilai_pamong}
                                            </td>
                                            <td className="px-4 py-3">
                                                {item?.nilai_supervisor_ppl}
                                            </td>

                                            <td className="px-4 py-3">
                                                {item?.status ===
                                                    "Belum Dinilai" && (
                                                    <Chip
                                                        label={item?.status}
                                                        color="error"
                                                    />
                                                )}
                                                {item?.status ===
                                                    "Sudah Dinilai" && (
                                                    <Chip
                                                        label={item?.status}
                                                        color="success"
                                                    />
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                {item?.keterangan}
                                            </td>

                                            <td className="px-4 py-3 flex items-center justify-center">
                                                <button
                                                    // onClick={() =>
                                                    //     toggleDropdown(index)
                                                    // }
                                                    className="inline-flex items-center bg-blue-500 p-1 text-lg font-medium text-center text-white hover:bg-blue-700 rounded-lg focus:outline-none dark:text-gray-400 dark:hover:text-gray-100"
                                                    type="button"
                                                    onClick={() =>
                                                        router.visit(
                                                            `/supervisor-ppl/classroom/mahasiswa/${data?.id_sekolah}/${item?.nim}`
                                                        )
                                                    }
                                                >
                                                    {/* <svg
                                                        className="w-5 h-5 rotate-90"
                                                        aria-hidden="true"
                                                        fill="currentColor"
                                                        viewBox="0 0 20 20"
                                                        xmlns="http://www.w3.org/2000/svg"
                                                    >
                                                        <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
                                                    </svg> */}
                                                    <MdOpenInNew />
                                                </button>
                                                {dropdownOpen === index && (
                                                    <div
                                                        ref={dropdownRef}
                                                        className="z-999999 w-44 bg-white rounded divide-y divide-gray-100 shadow-4 dark:bg-gray-700 dark:divide-gray-600 absolute mt-2"
                                                    >
                                                        <ul className="py-1 text-sm text-gray-700 dark:text-gray-200">
                                                            <li>
                                                                <a
                                                                    onClick={() => {
                                                                        router.get(
                                                                            `/operator-sekolah/data/kepsek_pamong/detail/${item.id}`
                                                                        );
                                                                        setDropdownOpen(
                                                                            null
                                                                        );
                                                                    }}
                                                                    className="cursor-pointer block py-2 px-4 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                                                                >
                                                                    Show
                                                                </a>
                                                            </li>
                                                            {/* <li>
                                                                <a
                                                                    onClick={() => {
                                                                        router.get(
                                                                            `/admin/users/student/edit/${item.nim}`
                                                                        );
                                                                        setDropdownOpen(
                                                                            null
                                                                        );
                                                                    }}
                                                                    className="cursor-pointer block py-2 px-4 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                                                                >
                                                                    Edit
                                                                </a>
                                                            </li> */}
                                                        </ul>
                                                        <div className="py-1">
                                                            <a
                                                                onClick={() => {
                                                                    deleteRecords(
                                                                        item.id
                                                                    );

                                                                    setDropdownOpen(
                                                                        null
                                                                    );
                                                                }}
                                                                className="cursor-pointer block py-2 px-4 text-sm text-red-600 bg-red-400/10 hover:bg-red-500/20 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white"
                                                            >
                                                                Delete
                                                            </a>
                                                        </div>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <div className="h-16"></div>
                            </table>
                        </div>
                        {/* <nav
                        className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-3 md:space-y-0 p-4"
                        aria-label="Table navigation"
                    >
                        <span className="flex gap-x-2 text-sm font-normal text-gray-500 dark:text-gray-400">
                            Showing
                            <span className="font-semibold text-gray-900 dark:text-white">
                                {`${
                                    dataRuang.to - dataRuang?.data?.length + 1
                                }-${dataRuang.to}`}
                            </span>
                            of
                            <span className="font-semibold text-gray-900 dark:text-white">
                                {dataRuang.total}
                            </span>
                        </span>

                        <ul className="inline-flex items-stretch -space-x-px">
                            <li>
                                <a
                                    onClick={() =>
                                        handlePageChange(currentPage - 1)
                                    }
                                    disabled={currentPage === 1}
                                    className="flex items-center cursor-pointer justify-center h-full py-1.5 px-3 ml-0 text-gray-500 bg-white rounded-l-lg border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                                >
                                    <span className="sr-only">Previous</span>
                                    <svg
                                        className="w-5 h-5"
                                        aria-hidden="true"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            fill-rule="evenodd"
                                            d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                                            clip-rule="evenodd"
                                        />
                                    </svg>
                                </a>
                            </li>
                            {visiblePages.map((item, index) =>
                                item === "..." ? (
                                    <li key={index + 1}>
                                        <button
                                            className={`flex items-center justify-center py-2 px-3 border leading-tight text-gray-500 bg-white border-gray-300 hover:bg-gray-100 hover:text-gray-700`}
                                        >
                                            {item}
                                        </button>
                                    </li>
                                ) : (
                                    <li key={index + 1}>
                                        <button
                                            className={`flex items-center justify-center py-2 px-3 border leading-tight ${
                                                currentPage === item
                                                    ? "text-blue-600 bg-blue-50 border-blue-300"
                                                    : "text-gray-500 bg-white border-gray-300 hover:bg-gray-100 hover:text-gray-700"
                                            }`}
                                            onClick={() =>
                                                handlePageChange(item)
                                            }
                                        >
                                            {item}
                                        </button>
                                    </li>
                                )
                            )}

                            <li>
                                <a
                                    onClick={() =>
                                        handlePageChange(currentPage + 1)
                                    }
                                    disabled={currentPage === lastPage}
                                    className="flex items-center justify-center h-full py-1.5 px-3 leading-tight text-gray-500 bg-white rounded-r-lg border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                                >
                                    <span className="sr-only">Next</span>
                                    <svg
                                        className="w-5 h-5"
                                        aria-hidden="true"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            fill-rule="evenodd"
                                            d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                                            clip-rule="evenodd"
                                        />
                                    </svg>
                                </a>
                            </li>
                        </ul>
                    </nav> */}
                    </div>
                </div>
            </SupervisorPPLLayout>
        </SekolahProvider>
    );
};

export default ListMahasiswa;
