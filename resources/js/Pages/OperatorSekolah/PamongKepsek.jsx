import OperatorSekolahLayout from "@/Layouts/OperatorSekolahLayout";
import React from "react";
import { Head, router } from "@inertiajs/react";
import {
    Alert,
    AlertTitle,
    Button,
    Chip,
    Autocomplete,
    TextField,
    Box,
    Paper,
    Typography,
} from "@mui/material";

import { useState } from "react";
import { useEffect } from "react";
import { ThreeDot } from "react-loading-indicators";
import { useRef } from "react";
import axios from "axios";
import { config } from "@/config/config";

const PamongKepsek = ({
    daftarmahasiswa,
    message,
    base_url,
    flash,
    data_opt,
}) => {
    const [openDialog, setOpenDialog] = useState(false);
    const [idObjToDelete, setIdObjToDelete] = useState(null);
    const [notify, setNotify] = useState(flash.message !== null ? true : false);
    const [notifyStatus, setNotifyStatus] = useState("default");
    const [dropdownOpen, setDropdownOpen] = useState(null);
    const dropdownRef = useRef(null);
    const [loading, setLoading] = useState(false);
    const [loadingGelombang, setLoadingGelombang] = useState(false);
    const [dataRuang, setDataRuang] = useState([]);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [searchKey, setSearchKey] = useState("");
    const [visiblePages, setVisiblePages] = useState([]);
    const [prevPage, setPrevPage] = useState(null);
    const [gelombangData, setGelombangData] = useState([]);
    const [selectedGelombang, setSelectedGelombang] = useState(null);

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
            const params = {
                page: currentPage,
                search_key: searchKey,
                id_sekolah: data_opt.id_sekolah,
                id_gelombang: selectedGelombang?.id || null,
            };

            const response = await axios.get(
                `${base_url}/api/operator-sekolah/data/kepsek-pamong/query`,
                { params }
            );

            setDataRuang(response.data);
            setCurrentPage(response.data.current_page);
            setLastPage(response.data.last_page);
            getVisiblePages(response.data.current_page, response.data);
        } catch (err) {
            console.log(err);
            setError(err.response?.data?.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    const getGelombang = async () => {
        setLoadingGelombang(true);
        try {
            const res = await axios.get(`${config.base_url}/api/gelombang`);
            const gelombangList = res.data?.data || [];
            setGelombangData(gelombangList);

            // Otomatis pilih gelombang terbaru (terakhir)
            if (gelombangList.length > 0) {
                // Urutkan berdasarkan created_at atau id untuk dapat yang terbaru
                const sortedGelombang = [...gelombangList].sort((a, b) => {
                    // Jika ada tanggal created_at, gunakan itu
                    if (a.created_at && b.created_at) {
                        return new Date(b.created_at) - new Date(a.created_at);
                    }
                    // Jika tidak, gunakan id (asumsi id lebih besar = lebih baru)
                    return b.id - a.id;
                });

                const latestGelombang = sortedGelombang[0];
                setSelectedGelombang(latestGelombang);
            }
        } catch (error) {
            console.error("Error fetching gelombang:", error);
        } finally {
            setLoadingGelombang(false);
        }
    };

    useEffect(() => {
        // Inisialisasi gelombang saat pertama load
        getGelombang();
    }, []);

    useEffect(() => {
        if (selectedGelombang) {
            // Reset ke halaman 1 ketika filter berubah
            setCurrentPage(1);
            fetchData();
        }
    }, [selectedGelombang]);

    useEffect(() => {
        if (currentPage !== prevPage || message !== null) {
            fetchData();
            setPrevPage(currentPage);
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
        onDialogClose();
    };

    useEffect(() => {
        if (flash.message) {
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

    const handleSearch = () => {
        setCurrentPage(1);
        fetchData();
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter") {
            handleSearch();
        }
    };

    return (
        <OperatorSekolahLayout>
            <Head title="Data Pamong & Kepsek" />
            <div className="px-3 py-4">
                {/* Filter Section */}
                <Box sx={{ mb: 3 }}>
                    <Paper
                        elevation={0}
                        variant="outlined"
                        sx={{
                            p: 3,
                            borderRadius: 2,
                        }}
                    >
                        <Typography
                            variant="h6"
                            gutterBottom
                            sx={{
                                fontWeight: 600,
                                mb: 2,
                                color: "text.primary",
                            }}
                        >
                            Filter Data
                        </Typography>

                        <Box
                            sx={{
                                display: "flex",
                                flexDirection: { xs: "column", md: "row" },
                                gap: 2,
                                alignItems: "flex-start",
                            }}
                        >
                            {/* Gelombang Filter */}
                            <Box sx={{ flex: 1, minWidth: { md: 300 } }}>
                                <Autocomplete
                                    loading={loadingGelombang}
                                    options={gelombangData}
                                    value={selectedGelombang}
                                    onChange={(event, newValue) => {
                                        setSelectedGelombang(newValue);
                                    }}
                                    getOptionLabel={(option) =>
                                        option.name || "Pilih Gelombang"
                                    }
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Gelombang"
                                            size="small"
                                            sx={{
                                                "& .MuiOutlinedInput-root.Mui-focused":
                                                    {
                                                        outline: "none",
                                                        boxShadow: "none",
                                                    },
                                                "& .MuiInputBase-input:focus": {
                                                    outline: "none",
                                                    boxShadow: "none",
                                                },
                                            }}
                                         
                                        />
                                    )}
                                    renderOption={(props, option) => (
                                        <li {...props} key={option.id}>
                                            <div>
                                                <Typography variant="body1">
                                                    {option.name}
                                                </Typography>
                                                {option.description && (
                                                    <Typography
                                                        variant="caption"
                                                        color="text.secondary"
                                                    >
                                                        {option.description}
                                                    </Typography>
                                                )}
                                            </div>
                                        </li>
                                    )}
                                />
                            </Box>

                            {/* Search Input */}
                            <Box
                                sx={{
                                    flex: 1,
                                    display: "flex",
                                    gap: 1,
                                    width: "100%",
                                }}
                            >
                                <TextField
                                    placeholder="Search by name, NIM, or school..."
                                    value={searchKey}
                                    onChange={(e) =>
                                        setSearchKey(e.target.value)
                                    }
                                    onKeyPress={handleKeyPress}
                                    size="small"
                                    sx={{
                                        "& .MuiOutlinedInput-root.Mui-focused":
                                            {
                                                outline: "none",
                                                boxShadow: "none",
                                            },
                                        "& .MuiInputBase-input:focus": {
                                            outline: "none",
                                            boxShadow: "none",
                                        },
                                    }}
                                    InputProps={{
                                        sx: {
                                            "& .MuiOutlinedInput-root.Mui-focused":
                                                {
                                                    outline: "none",
                                                    boxShadow: "none",
                                                },
                                        },
                                    }}
                                />
                                <Button
                                    variant="contained"
                                    onClick={handleSearch}
                                    sx={{
                                        textTransform: "none",
                                        minWidth: 100,
                                    }}
                                >
                                    Search
                                </Button>
                            </Box>
                        </Box>

                        {/* Selected Filter Info */}
                        {selectedGelombang && (
                            <Box sx={{ mt: 2 }}>
                                <Chip
                                    label={`Gelombang: ${selectedGelombang.name}`}
                                    color="primary"
                                    variant="outlined"
                                    size="small"
                                    onDelete={() => setSelectedGelombang(null)}
                                />
                            </Box>
                        )}
                    </Paper>
                </Box>

                {/* Action Buttons */}
                <div className="flex w-full justify-start gap-x-2 py-2">
                    <Button
                        variant="contained"
                        disableElevation
                        sx={{ textTransform: "capitalize" }}
                        onClick={() => {
                            router.visit(
                                `/operator-sekolah/data/kepsek_pamong/add?idGelombang=${selectedGelombang?.id}`
                            );
                        }}
                    >
                        Tambah Data
                    </Button>
                </div>

                {/* Alert Info */}
                <Box sx={{ mb: 3 }}>
                    <Alert severity="info">
                        <AlertTitle>Petunjuk</AlertTitle>
                        <ol className="!list-decimal pl-5 space-y-2">
                            <li>
                                Mohon diisi data kepala sekolah dan guru pamong
                                dari setiap mahasiswa yang dibimbing 🙏
                            </li>
                            <li>
                                Siapkan berkas scan Buku Rekening dan NPWP
                                dijadikan satu pdf dengan ukuran maksimal 500kb
                            </li>
                            <li>
                                Data akan difilter berdasarkan gelombang yang
                                dipilih. Gelombang terbaru dipilih secara
                                otomatis.
                            </li>
                        </ol>
                    </Alert>
                </Box>

                {/* Data Table */}
                <div className="bg-white dark:bg-gray-800 p-3 relative shadow-md sm:rounded-lg overflow-hidden">
                    {/* Table Header Info */}
                    <Box
                        sx={{
                            p: 2,
                            borderBottom: 1,
                            borderColor: "divider",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                        }}
                    >
                        <Typography variant="subtitle1" fontWeight={600}>
                            Daftar Kepala Sekolah & Guru Pamong
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            Total: {dataRuang.total || 0} data
                        </Typography>
                    </Box>

                    <div className="relative overflow-x-auto min-h-50">
                        {loading && (
                            <div className="absolute z-10 w-full h-full flex items-center justify-center bg-white/70">
                                <ThreeDot color="#4F61E3" size="medium" />
                            </div>
                        )}

                        <table className="w-full relative text-sm text-left text-gray-500 dark:text-gray-400">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                <tr>
                                    <th scope="col" className="px-4 py-3">
                                        No
                                    </th>
                                    <th scope="col" className="px-4 py-3">
                                        Nama Mahasiswa
                                    </th>
                                    <th scope="col" className="px-4 py-3">
                                        NIM Mahasiswa
                                    </th>
                                    <th scope="col" className="px-4 py-3">
                                        Nama
                                    </th>
                                    <th scope="col" className="px-4 py-3">
                                        Nama di Buku Rekening
                                    </th>
                                    <th scope="col" className="px-4 py-3">
                                        NIP
                                    </th>
                                    <th scope="col" className="px-4 py-3">
                                        Pangkat & Golongan
                                    </th>
                                    <th scope="col" className="px-4 py-3">
                                        Jabatan
                                    </th>
                                    <th scope="col" className="px-4 py-3">
                                        Nama Sekolah
                                    </th>
                                    <th scope="col" className="px-4 py-3">
                                        Nama Bank
                                    </th>
                                    <th scope="col" className="px-4 py-3">
                                        No Rekening
                                    </th>
                                    <th scope="col" className="px-4 py-3">
                                        NIK
                                    </th>
                                    <th scope="col" className="px-4 py-3">
                                        Status
                                    </th>
                                    <th scope="col" className="px-4 py-3">
                                        Keterangan
                                    </th>
                                    <th scope="col" className="px-4 py-3">
                                        <span className="sr-only">Actions</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {dataRuang?.data?.length > 0 ? (
                                    dataRuang.data.map((item, index) => (
                                        <tr
                                            key={index}
                                            className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                                        >
                                            <td className="px-4 py-3">
                                                {item.row_index}
                                            </td>
                                            <td className="px-4 py-3">
                                                {item?.nama_mahasiswa}
                                            </td>
                                            <td className="px-4 py-3">
                                                {item?.nim}
                                            </td>
                                            <td className="px-4 py-3">
                                                {item?.name}
                                            </td>
                                            <td className="px-4 py-3">
                                                {item?.nama_di_buku_rekening}
                                            </td>
                                            <td className="px-4 py-3">
                                                {item?.nip}
                                            </td>
                                            <td className="px-4 py-3">
                                                {item?.pangkat_dan_golongan}
                                            </td>
                                            <td className="px-4 py-3">
                                                {item?.jabatan}
                                            </td>
                                            <td className="px-4 py-3">
                                                {item?.nama_sekolah}
                                            </td>
                                            <td className="px-4 py-3">
                                                {item?.nama_bank}
                                            </td>
                                            <td className="px-4 py-3">
                                                {item?.no_rekening}
                                            </td>
                                            <td className="px-4 py-3">
                                                {item?.no_npwp}
                                            </td>
                                            <td className="px-4 py-3">
                                                {item?.status ===
                                                    "diterima" && (
                                                    <Chip
                                                        label={item?.status}
                                                        color="success"
                                                        size="small"
                                                    />
                                                )}
                                                {item?.status === "ditolak" && (
                                                    <Chip
                                                        label={item?.status}
                                                        color="error"
                                                        size="small"
                                                    />
                                                )}
                                                {item?.status ===
                                                    "di-review" && (
                                                    <Chip
                                                        label={item?.status}
                                                        color="warning"
                                                        size="small"
                                                    />
                                                )}
                                                {!item?.status && (
                                                    <Chip
                                                        label="Belum diverifikasi"
                                                        color="default"
                                                        size="small"
                                                    />
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                {item?.keterangan || "-"}
                                            </td>
                                            <td className="px-4 py-3 flex items-center justify-end">
                                                <button
                                                    onClick={() =>
                                                        toggleDropdown(index)
                                                    }
                                                    className="inline-flex items-center p-0.5 text-sm font-medium text-center text-gray-500 hover:text-gray-800 rounded-lg focus:outline-none dark:text-gray-400 dark:hover:text-gray-100"
                                                    type="button"
                                                >
                                                    <svg
                                                        className="w-5 h-5 rotate-90"
                                                        aria-hidden="true"
                                                        fill="currentColor"
                                                        viewBox="0 0 20 20"
                                                        xmlns="http://www.w3.org/2000/svg"
                                                    >
                                                        <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
                                                    </svg>
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
                                                                    Detail
                                                                </a>
                                                            </li>
                                                        </ul>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan="15"
                                            className="px-4 py-8 text-center"
                                        >
                                            <Typography
                                                variant="body1"
                                                color="text.secondary"
                                            >
                                                {loading
                                                    ? "Loading..."
                                                    : "Tidak ada data ditemukan"}
                                            </Typography>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {dataRuang?.data?.length > 0 && (
                        <nav
                            className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-3 md:space-y-0 p-4"
                            aria-label="Table navigation"
                        >
                            <span className="flex gap-x-2 text-sm font-normal text-gray-500 dark:text-gray-400">
                                Showing
                                <span className="font-semibold text-gray-900 dark:text-white">
                                    {`${dataRuang.from || 0}-${
                                        dataRuang.to || 0
                                    }`}
                                </span>
                                of
                                <span className="font-semibold text-gray-900 dark:text-white">
                                    {dataRuang.total || 0}
                                </span>
                            </span>

                            <ul className="inline-flex items-stretch -space-x-px">
                                <li>
                                    <button
                                        onClick={() =>
                                            handlePageChange(currentPage - 1)
                                        }
                                        disabled={currentPage === 1}
                                        className={`flex items-center justify-center h-full py-1.5 px-3 ml-0 rounded-l-lg border ${
                                            currentPage === 1
                                                ? "text-gray-400 bg-gray-100 border-gray-300 cursor-not-allowed"
                                                : "text-gray-500 bg-white border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                                        }`}
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
                                                fillRule="evenodd"
                                                d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                    </button>
                                </li>
                                {visiblePages.map((item, index) =>
                                    item === "..." ? (
                                        <li key={index + 1}>
                                            <button
                                                className="flex items-center justify-center py-2 px-3 border leading-tight text-gray-500 bg-white border-gray-300 hover:bg-gray-100 hover:text-gray-700"
                                                disabled
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
                                    <button
                                        onClick={() =>
                                            handlePageChange(currentPage + 1)
                                        }
                                        disabled={currentPage === lastPage}
                                        className={`flex items-center justify-center h-full py-1.5 px-3 leading-tight rounded-r-lg border ${
                                            currentPage === lastPage
                                                ? "text-gray-400 bg-gray-100 border-gray-300 cursor-not-allowed"
                                                : "text-gray-500 bg-white border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                                        }`}
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
                                                fillRule="evenodd"
                                                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                    </button>
                                </li>
                            </ul>
                        </nav>
                    )}
                </div>
            </div>
        </OperatorSekolahLayout>
    );
};

export default PamongKepsek;
