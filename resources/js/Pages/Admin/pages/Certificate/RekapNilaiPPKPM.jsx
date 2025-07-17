import React from "react";

import { Head, Link, router } from "@inertiajs/react";
import { Alert, Button, Chip, Snackbar } from "@mui/material";
import { useState } from "react";
import { useEffect } from "react";
import { useRef } from "react";
import { ThreeDot } from "react-loading-indicators";
import AdminLayout from "@/Layouts/Admin/AdminLayout";
import {

    OpenInNewRounded,

} from "@mui/icons-material";
import Modal from "@/Components/Modal";
import ExportCertificateModal from "@/Components/admin/ExportCertificateModal";

const RekapNilaiPPKPM = ({ flash, base_url }) => {
    const [openDialog, setOpenDialog] = useState(false);
    const [idObjToDelete, setIdObjToDelete] = useState(null);
    const [notify, setNotify] = useState(flash.message !== null ? true : false);
    const [notifyStatus, setNotifyStatus] = useState("default");
    const [dropdownOpen, setDropdownOpen] = useState(null);
    const dropdownRef = useRef(null);
    const [loading, setLoading] = useState(false);
    const [dataRuang, setDataRuang] = useState([]);
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
                `${base_url}/api/admin/certificate/nilai-ppkpm`,
                {
                    params: {
                        page: currentPage,
                        search: searchKey,
                    },
                }
            );
            setDataRuang(response.data);

            setCurrentPage(response.data.current_page);

            setLastPage(response.data.last_page);
            getVisiblePages(
                response.data.current_page,
                response.data
            );
        } catch (err) {
            console.log(err);
            setError(err.response?.data?.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    };
    const exportExcel = async (prodi) => {
        setLoading(true);
        setError(null);

        try {
            const response = await axios.post(
                `${base_url}/api/admin/certificate/nilai-ppkpm/export`,
                {id_prodi : prodi?.id}, // Pass the request body here
                {
                    responseType: "blob", // Set responseType in Axios config
                }
            );

            const blob = new Blob([response.data], {
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            });

            const downloadUrl = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = downloadUrl;

            const contentDisposition = response.headers["content-disposition"];
            const now = new Date();
            const jakartaTime = new Date(now.getTime() + 7 * 60 * 60 * 1000); // Convert to UTC+7
            const formattedDate = jakartaTime
                .toISOString()
                .slice(0, 19)
                .replace("T", "_")
                .replace(/:/g, "-");

            let filename = `Nilai PPKPM_${formattedDate}.xlsx`;

            if (contentDisposition) {
                const match = contentDisposition.match(/filename="?([^"]+)"?/);
                console.log("match ", match);
                if (match) {
                    filename = match[1];
                }
            }

            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(downloadUrl);
            console.log(response);
        } catch (err) {
            setError(err.response?.data?.message || "Something went wrong.");
            if (err.response && err.response.data) {
                const errorText = new TextDecoder().decode(err.response.data);
                console.error("Error response text:", errorText);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (currentPage !== prevPage) {
            fetchData(); // Only fetch if currentPage is different from prevPage
            setPrevPage(currentPage); // Update prevPage
        }
    }, [currentPage, prevPage]);

    const handlePageChange = (page) => {
        if (page >= 1 && page <= lastPage) {
            setCurrentPage(page);
        }
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
        exportExcel(e);
       
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

    

   

    return (
        <AdminLayout className="main flex">
            <ExportCertificateModal show={openDialog} closeable={true} onClose={onDialogClose} onConfirm={handleConfirmClick}/>
            <Head title="Nilai PPKPM" />
            <div className="flex w-full flex-col">
                <div className="px-3">
                    <div className="flex w-full justify-start gap-x-2 py-2">
                        <Button
                            variant="contained"
                            disableElevation
                            // disabled={loading}
                            sx={{ textTransform: "capitalize" }}
                            onClick={(e) => {
                                // exportExcel();
                                setOpenDialog(true);
                            }}
                        >
                            Export
                        </Button>
                    </div>
                </div>

                <div className="px-3 ">
                    <p>{error}</p>
                    <div className="flex w-full  gap-x-3 py-2">
                        <div className="bg-white dark:bg-gray-800 w-full relative shadow-md sm:rounded-lg overflow-hidden">
                            <div className="flex flex-col md:flex-row items-center justify-between space-y-3 md:space-y-0 md:space-x-4 p-4">
                                <div className="flex items-center w-full">
                                    <label
                                        for="simple-search"
                                        className="sr-only"
                                    >
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
                            </div>
                            <div className="relative overflow-x-auto min-h-50">
                                {loading && (
                                    <div className="absolute z-10 w-full h-full flex items-center justify-center bg-white/70">
                                        <ThreeDot
                                            color="#4F61E3"
                                            size="medium"
                                        />
                                    </div>
                                )}

                                <table className="w-full relative table-auto text-sm text-left text-gray-500 dark:text-gray-400 ">
                                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                        <tr className="whitespace-nowrap">
                                            <th
                                                scope="col"
                                                className="px-4 py-3"
                                            >
                                                No
                                            </th>
                                            <th
                                                scope="col"
                                                className="px-4 py-3"
                                            >
                                                Nama
                                            </th>
                                            <th
                                                scope="col"
                                                className="px-4 py-3"
                                            >
                                                NIM
                                            </th>
                                            <th
                                                scope="col"
                                                className="px-4 py-3"
                                            >
                                                Program Studi
                                            </th>
                                            <th
                                                scope="col"
                                                className="px-4 py-3"
                                            >
                                                Cluster Kegiatan
                                            </th>
                                            <th
                                                scope="col"
                                                className="px-4 py-3"
                                            >
                                                Tempat KPM
                                            </th>
                                            <th
                                                scope="col"
                                                className="px-4 py-3"
                                            >
                                                Tempat PPL
                                            </th>
                                      
                                            <th
                                                scope="col"
                                                className="px-4 py-3"
                                            >
                                                Nilai SPV KPM
                                            </th>
                                            <th
                                                scope="col"
                                                className="px-4 py-3"
                                            >
                                                Nilai Keuchik
                                            </th>
                                            <th
                                                scope="col"
                                                className="px-4 py-3"
                                            >
                                                PK KPM (75%)
                                            </th>
                                            <th
                                                scope="col"
                                                className="px-4 py-3"
                                            >
                                                LK KPM (25%)
                                            </th>
                                            <th
                                                scope="col"
                                                className="px-4 py-3"
                                            >
                                                SM KPM
                                            </th>
                                            <th
                                                scope="col"
                                                className="px-4 py-3"
                                            >
                                                Nilai SPV PPL
                                            </th>
                                            <th
                                                scope="col"
                                                className="px-4 py-3"
                                            >
                                                Nilai Pamong
                                            </th>
                                            <th
                                                scope="col"
                                                className="px-4 py-3"
                                            >
                                                {"PK PPL (75%)"}
                                            </th>
                                            <th
                                                scope="col"
                                                className="px-4 py-3"
                                            >
                                                {"LK PPL (25%)"}
                                            </th>
                                            <th
                                                scope="col"
                                                className="px-4 py-3"
                                            >
                                                {"SM PPL"}
                                            </th>
                                            <th
                                                scope="col"
                                                className="px-4 py-3"
                                            >
                                                {"NILAI PPKPM"}
                                            </th>
                                            <th
                                                scope="col"
                                                className="px-4 py-3"
                                            >
                                                {"HURUF"}
                                            </th>
                                            <th
                                                scope="col"
                                                className="px-4 py-3"
                                            >
                                                {"No. Surat"}
                                            </th>

                                            {/* <th
                                                scope="col"
                                                className="px-4 py-3"
                                            >
                                                <span className="sr-only">
                                                    Actions
                                                </span>
                                            </th> */}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {dataRuang?.data?.map((item, index) => (


                                            <tr
                                                key={index}
                                                className="border-b dark:border-gray-700 hover:bg-gray-50"
                                            >
                                                <th
                                                    scope="row"
                                                    className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                                                >
                                                    {item.row_index}
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
                                                    {item?.cluster_kegiatan}
                                                </td>
                                                <td className="px-4 py-3">
                                                    {item?.nama_tempat_kpm}
                                                </td>
                                                <td className="px-4 py-3">
                                                    {item?.nama_tempat_ppl}
                                                </td>
                                                <td className="px-4 py-3">
                                                    {item?.nilai_supervisor_kpm}
                                                </td>
                                                <td className="px-4 py-3">
                                                    {item?.nilai_keuchik}
                                                </td>
                                                <td className="px-4 py-3">
                                                    {item?.PK_KPM}
                                                </td>
                                                <td className="px-4 py-3">
                                                    {item?.LK_KPM}
                                                </td>
                                                <td className="px-4 py-3">
                                                    {item?.SM_KPM}
                                                </td>
                                                <td className="px-4 py-3">
                                                    {item?.nilai_supervisor_ppl}
                                                </td>
                                                <td className="px-4 py-3">
                                                    {item?.nilai_pamong}
                                                </td>
                                                <td className="px-4 py-3">
                                                    {item?.PK_PPL}
                                                </td>
                                                <td className="px-4 py-3">
                                                    {item?.LK_PPL}
                                                </td>
                                                <td className="px-4 py-3">
                                                    {item?.SM_PPL}
                                                </td>
                                                <td className="px-4 py-3">
                                                    {item?.nilai_ppkpm}
                                                </td>
                                                <td className="px-4 py-3">
                                                    {item?.index_nilai_ppkpm}
                                                </td>
                                                <td className="px-4 py-3">
                                                    {item?.no_surat_full}
                                                </td>
                                                

                                                
                                            </tr>
                                        ))}
                                    </tbody>
                                    <div className="h-16"></div>
                                </table>
                            </div>
                            <nav
                                className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-3 md:space-y-0 p-4"
                                aria-label="Table navigation"
                            >
                                <span className="flex gap-x-2 text-sm font-normal text-gray-500 dark:text-gray-400">
                                    Showing
                                    <span className="font-semibold text-gray-900 dark:text-white">
                                        {`${
                                            dataRuang.to -
                                            dataRuang?.data?.length +
                                            1
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
                                                handlePageChange(
                                                    currentPage - 1
                                                )
                                            }
                                            disabled={currentPage === 1}
                                            className="flex items-center cursor-pointer justify-center h-full py-1.5 px-3 ml-0 text-gray-500 bg-white rounded-l-lg border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                                        >
                                            <span className="sr-only">
                                                Previous
                                            </span>
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
                                                handlePageChange(
                                                    currentPage + 1
                                                )
                                            }
                                            disabled={currentPage === lastPage}
                                            className="flex items-center justify-center h-full py-1.5 px-3 leading-tight text-gray-500 bg-white rounded-r-lg border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                                        >
                                            <span className="sr-only">
                                                Next
                                            </span>
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
                            </nav>
                        </div>
                    </div>
                </div>
            </div>
            <Snackbar
                open={notify}
                anchorOrigin={{
                    vertical: "top",
                    horizontal: "right",
                }}
                autoHideDuration={2000}
                onClose={handleCloseNotify}
            >
                <Alert
                    onClose={handleCloseNotify}
                    severity={notifyStatus}
                    variant="filled"
                    sx={{ width: "100%" }}
                >
                    {flash.message && flash.message[notifyStatus]}
                </Alert>
            </Snackbar>
        </AdminLayout>
    );
};

export default RekapNilaiPPKPM;
