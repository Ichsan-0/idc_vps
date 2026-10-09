import Badge from "@/Components/Badge";
import Button from "@/Components/Button";
import DynamicModal from "@/Components/DynamicModal";

import LoaderOnButton from "@/Components/LoaderOnButtn";
import Search from "@/Components/Search";
import Select from "@/Components/Select";
import { config } from "@/config/config";
import { useConfirmationModal, useModal } from "@/Hooks/useModal";
import { PlusIcon } from "@heroicons/react/24/outline";
import { RiFileExcel2Line, RiDownloadLine, RiUploadCloud2Line } from "react-icons/ri";
import axios from "axios";
import React from "react";
import { useEffect } from "react";
import { useState } from "react";
import { PiSortAscending, PiSortDescending } from "react-icons/pi";
import { FaRegTrashCan } from "react-icons/fa6";
import { TfiPencil } from "react-icons/tfi";
import DynamicModalConf from "@/Components/DynamicModalConf";
import { desa, kabupaten, kecamatan } from "daftar-wilayah-indonesia";
import { useMemo } from "react";
import { Autocomplete, Slide, TextField } from "@mui/material";
import { Link } from "@inertiajs/react";
import Toaster from "@/Components/Toaster";
import InputError from "@/Components/InputError";

const TempatPPLTable = () => {
    const [loading, setLoading] = useState(false);
    const { openModal, closeModal, isOpen } = useModal();
    const { openModal: openImportModal, closeModal: closeImportModal, isOpen: isOpenImport } = useModal();
    const { openModalConf, closeModalConf, isOpenConf } =
        useConfirmationModal();

    const [importFile, setImportFile] = useState(null);
    const [importLoading, setImportLoading] = useState(false);
    const [importGelombang, setImportGelombang] = useState(null);
    const [importError, setImportError] = useState(null);
    const [isDraggingLokasi, setIsDraggingLokasi] = useState(false);

    const {
        openModal: openImportPesertaModal,
        closeModal: closeImportPesertaModal,
        isOpen: isOpenImportPeserta,
    } = useModal();
    const [importPesertaFile, setImportPesertaFile] = useState(null);
    const [importPesertaLoading, setImportPesertaLoading] = useState(false);
    const [importPesertaGelombang, setImportPesertaGelombang] = useState(null);
    const [importPesertaError, setImportPesertaError] = useState(null);
    const [isDraggingPeserta, setIsDraggingPeserta] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);
    const [entriesPerPage, setEntriesPerPage] = useState(5);
    const [totalEntries, setTotalEntries] = useState(null);
    const [totalPages, setTotalPages] = useState(null);
    const [validationError, setValidationError] = useState({
        id_sekolah: null,
        id_gelombang: null,
        username_supervisor: null,
    });
    const [searchKey, setSearchKey] = useState(null);
    const [searchInput, setSearchInput] = useState(null);
    const [selectedData, setSelectedData] = useState(null);

    const [gelombangData, setGelombangData] = useState([]);
    const [selectedGelombangData, setSelectedGelombangData] = useState(null);

    const dataKabupaten = kabupaten("11");
    const [dataKecamatan, setDataKecamatan] = useState([]);
    const [dataDesa, setDataDesa] = useState([]);
    const [regency, setRegency] = useState(null);
    const [subDistrict, setSubDistrict] = useState(null);

    const [data, setData] = useState([]);
    const [sortKey, setSortKey] = useState(null);
    const [sortDir, setSortDir] = useState(null);

    const [dataSupervisor, setDataSupervisor] = useState([]);
    const [masterSekolah, setMasterSekolah] = useState([]);
    const [selectedSekolah, setSelectedSekolah] = useState(null);
    const [selectedSuperviosr, setSelectedSupervisor] = useState(null);
    const [responseData, setResponseData] = useState({
        message: "",
        severity: "error",
        open: false,
    });

    const [formData, setFormData] = useState({
        name: "",
        username_supervisor: "",
        id_sekolah: "",
        id_gelombang: "",
    });
    const isValid = () => {
        const errors = {
            name: null,
            id_sekolah: null,
            username_supervisor: null,
            id_gelombang: null,
        };

        if (!formData.name) {
            errors.name = "Sekolah wajib dipilih";
        }

        if (!formData.id_sekolah) {
            errors.id_sekolah = "Sekolah wajib dipilihss";
        }

        if (!formData.id_gelombang) {
            errors.id_gelombang = "Gelombang wajib dipilih";
        }

        setValidationError(errors);

        const hasError = Object.values(errors).some((value) => value !== null);

        return !hasError;
    };

    const sortIcon = (key) =>
        key === sortKey ? (
            sortDir === "asc" ? (
                <PiSortAscending className="ml-1 h-4 w-4 inline" />
            ) : (
                <PiSortDescending className="ml-1 h-4 w-4 inline" />
            )
        ) : null;

    const handleEntriesChange = (v) => {
        setEntriesPerPage(parseInt(v));
        setCurrentPage(1);
    };

    useEffect(() => {
        const totalCount = data?.total ?? 0;
        const totalPageCount = data?.last_page ?? 0;

        setTotalEntries(totalCount);
        setTotalPages(totalPageCount);
    }, [data]);
    const handleSave = async (e) => {
        e.preventDefault();
        if (isValid()) {
            try {
                setLoading(true);
                const payload = new FormData();
                payload.append("name", formData.name);
                payload.append(
                    "username_supervisor",
                    formData.username_supervisor
                );
                payload.append("id_sekolah", formData.id_sekolah);
                payload.append("id_gelombang", formData.id_gelombang);

                const res = await axios.post(
                    `${config.base_url}/api/admin/ppl/sekolah`,
                    payload,
                    {
                        headers: {
                            "Content-Type": "multipart/form-data",
                        },
                    }
                );
                setResponseData({
                    message: res.data?.message,
                    severity: "success",
                    open: true,
                });

                getData();
            } catch (error) {
                if (error.response?.status === 422) {
                    setResponseData({
                        message:
                            error.response.data.message || "Validasi gagal",
                        severity: "error",
                        open: true,
                    });
                } else if (error.response?.status === 400) {
                    setResponseData({
                        message: error.response.data.error || "Bad Request",
                        severity: "error",
                        open: true,
                    });
                } else if (error.response?.status === 404) {
                    setResponseData({
                        message: "Data sekolah tidak ditemukan",
                        severity: "error",
                        open: true,
                    });
                } else {
                    setResponseData({
                        message: "Terjadi kesalahan saat menyimpan data",
                        severity: "error",
                        open: true,
                    });
                }
            } finally {
                setLoading(false);
                closeModal();
            }
        }
    };

    const getMasterSekolah = async () => {
        try {
            const response = await axios.get(
                `${config.base_url}/api/admin/master-sekolah`
            );
            setMasterSekolah(response?.data?.data);
        } catch (error) {
            console.error(error);
        }
    };
    const getDataSupervisor = async () => {
        try {
            const response = await axios.get(
                `${config.base_url}/api/admin/kpm/supervisor`
            );
            setDataSupervisor(response.data);
        } catch (error) {
            console.error(error);
        }
    };

    const sortBy = (key) => {
        if (sortKey === key) {
            if (sortDir === "asc") {
                setSortDir("desc");
            } else if (sortDir === "desc") {
                setSortKey(null);
                setSortDir(null);
            } else {
                setSortDir("asc");
            }
        } else {
            setSortKey(key);
            setSortDir("asc");
        }

        setCurrentPage(1);
    };

    const handleDelete = (id) => {
        openModalConf();
        setSelectedData(id);
    };

    const deleteData = async (id) => {
        try {
            setLoading(true);
            const response = await axios.delete(
                `${config.base_url}/api/admin/ppl/sekolah/delete/${id}`,
                {
                    withCredentials: true,
                    headers: {
                        Accept: "application/json",
                    },
                }
            );
            setResponseData({
                message: response.data?.message,
                severity: "success",
                open: true,
            });
        } catch (error) {
            if (error.response?.status === 422) {
                setResponseData({
                    message: error.response.data.message || "Validasi gagal",
                    severity: "error",
                    open: true,
                });
            } else if (error.response?.status === 400) {
                setResponseData({
                    message: error.response.data.error || "Bad Request",
                    severity: "error",
                    open: true,
                });
            } else if (error.response?.status === 404) {
                setResponseData({
                    message: "Data sekolah tidak ditemukan",
                    severity: "error",
                    open: true,
                });
            } else {
                setResponseData({
                    message: "Terjadi kesalahan saat menghapus data",
                    severity: "error",
                    open: true,
                });
            }
        } finally {
            setSelectedData(null);
            getData();
        }
    };

    const getData = async () => {
        try {
            setLoading(true);

            const response = await axios.get(
                `${config.base_url}/api/ppl/sekolah`,
                {
                    withCredentials: true,
                    headers: {
                        Accept: "application/json",
                    },
                    params: {
                        page: currentPage,
                        perPage: entriesPerPage,
                        sortBy: sortKey ?? "id",
                        sortOrder: (sortDir ?? "asc").toUpperCase(),
                        search: searchKey,
                        idGelombang: selectedGelombangData?.id,
                    },
                }
            );
            setData(response.data.data);
        } catch (error) {
            setLoading(false);
        } finally {
            setLoading(false);
        }
    };

    const getGelombangData = async () => {
        try {
            setLoading(true);

            const response = await axios.get(
                `${config.base_url}/api/gelombang`
            );
            setGelombangData(response.data?.data);
            if (response.data?.data.length > 0) {
                const gelombang =
                    response.data?.data[response.data?.data.length - 1];
                setSelectedGelombangData(gelombang);
                setFormData({ ...formData, id_gelombang: gelombang.id });
            }
        } catch (error) {
            setLoading(false);
        } finally {
            getData();
        }
    };
    useEffect(() => {
        if (gelombangData.length > 0) {
            getData();
        }
    }, [
        currentPage,
        entriesPerPage,
        sortKey,
        sortDir,
        searchKey,
        selectedGelombangData,
    ]);

    useEffect(() => {
        // getData();
        getGelombangData();
        getMasterSekolah();
        getDataSupervisor();
    }, []);

    const handleDownloadTemplate = () => {
        const gelombangId = importGelombang?.id || selectedGelombangData?.id;
        const url = gelombangId
            ? `${config.base_url}/admin/ppl/sekolah/template-import?id_gelombang=${gelombangId}`
            : `${config.base_url}/admin/ppl/sekolah/template-import`;
        window.location.href = url;
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDragEnterLokasi = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDraggingLokasi(true);
    };

    const handleDragLeaveLokasi = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.currentTarget.contains(e.relatedTarget)) return;
        setIsDraggingLokasi(false);
    };

    const handleDropLokasi = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDraggingLokasi(false);

        const files = e.dataTransfer?.files;
        if (files && files.length > 0) {
            const file = files[0];
            const ext = "." + file.name.split(".").pop().toLowerCase();
            if (![".xlsx", ".xls", ".csv"].includes(ext)) {
                setImportError("Format file tidak didukung. Harap unggah file .xlsx, .xls, atau .csv.");
                return;
            }
            if (file.size > 10 * 1024 * 1024) {
                setImportError("Ukuran file melebihi batas maksimal (10MB).");
                return;
            }
            setImportFile(file);
            setImportError(null);
        }
    };

    const handleDragEnterPeserta = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDraggingPeserta(true);
    };

    const handleDragLeavePeserta = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.currentTarget.contains(e.relatedTarget)) return;
        setIsDraggingPeserta(false);
    };

    const handleDropPeserta = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDraggingPeserta(false);

        const files = e.dataTransfer?.files;
        if (files && files.length > 0) {
            const file = files[0];
            const ext = "." + file.name.split(".").pop().toLowerCase();
            if (![".xlsx", ".xls", ".csv"].includes(ext)) {
                setImportPesertaError("Format file tidak didukung. Harap unggah file .xlsx, .xls, atau .csv.");
                return;
            }
            if (file.size > 15 * 1024 * 1024) {
                setImportPesertaError("Ukuran file melebihi batas maksimal (15MB).");
                return;
            }
            setImportPesertaFile(file);
            setImportPesertaError(null);
        }
    };

    const handleImportSubmit = async (e) => {
        e.preventDefault();
        if (!importFile) {
            setImportError("Silakan pilih file Excel terlebih dahulu.");
            return;
        }

        const targetGelombangId = importGelombang?.id || selectedGelombangData?.id;
        if (!targetGelombangId) {
            setImportError("Silakan pilih gelombang terlebih dahulu.");
            return;
        }

        try {
            setImportLoading(true);
            setImportError(null);

            const payload = new FormData();
            payload.append("file", importFile);
            payload.append("id_gelombang", targetGelombangId);

            const res = await axios.post(
                `${config.base_url}/api/admin/ppl/sekolah/import`,
                payload,
                {
                    withCredentials: true,
                    headers: {
                        "Content-Type": "multipart/form-data",
                        Accept: "application/json",
                    },
                }
            );

            setResponseData({
                message: res.data?.message || "Data tempat PPL berhasil diimpor.",
                severity: "success",
                open: true,
            });

            setImportFile(null);
            closeImportModal();
            getData();
        } catch (err) {
            console.error("Import error:", err);
            const errorMsg =
                err.response?.data?.message ||
                err.response?.data?.error ||
                "Terjadi kesalahan saat mengimpor data.";
            setImportError(errorMsg);
            setResponseData({
                message: errorMsg,
                severity: "error",
                open: true,
            });
        } finally {
            setImportLoading(false);
        }
    };

    const handleDownloadPesertaTemplate = () => {
        const gelombangId = importPesertaGelombang?.id || selectedGelombangData?.id;
        const url = gelombangId
            ? `${config.base_url}/admin/ppl/sekolah/peserta/template-import?id_gelombang=${gelombangId}`
            : `${config.base_url}/admin/ppl/sekolah/peserta/template-import`;
        window.location.href = url;
    };

    const handleImportPesertaSubmit = async (e) => {
        e.preventDefault();
        if (!importPesertaFile) {
            setImportPesertaError("Silakan pilih file Excel terlebih dahulu.");
            return;
        }

        const targetGelombangId =
            importPesertaGelombang?.id || selectedGelombangData?.id;

        try {
            setImportPesertaLoading(true);
            setImportPesertaError(null);

            const payload = new FormData();
            payload.append("file", importPesertaFile);
            if (targetGelombangId) {
                payload.append("id_gelombang", targetGelombangId);
            }

            const res = await axios.post(
                `${config.base_url}/api/admin/ppl/sekolah/peserta/import`,
                payload,
                {
                    withCredentials: true,
                    headers: {
                        "Content-Type": "multipart/form-data",
                        Accept: "application/json",
                    },
                }
            );

            setResponseData({
                message:
                    res.data?.message ||
                    "Data peserta PPL berhasil diimpor.",
                severity: "success",
                open: true,
            });

            setImportPesertaFile(null);
            closeImportPesertaModal();
            getData();
        } catch (err) {
            console.error("Import peserta error:", err);
            const errorMsg =
                err.response?.data?.message ||
                err.response?.data?.error ||
                "Terjadi kesalahan saat mengimpor data peserta PPL.";
            setImportPesertaError(errorMsg);
            setResponseData({
                message: errorMsg,
                severity: "error",
                open: true,
            });
        } finally {
            setImportPesertaLoading(false);
        }
    };

    const handleSearchChange = (e) => {
        setSearchInput(e.target.value);
        setTimeout(() => {
            setSearchKey(e.target.value);
            console.log("search");
        }, 2500);
    };
    const renderPageButtons = () => {
        const buttons = [];
        let prevEllipsis = false;
        for (let page = 1; page <= totalPages; page++) {
            const isCurrent = page === currentPage;
            const isEdge = page === 1 || page === totalPages;
            const isNear = Math.abs(page - currentPage) <= 1;
            if (isEdge || isNear) {
                prevEllipsis = false;
                buttons.push(
                    <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`inline-flex px-5 py-3.5 text-sm items-center justify-center gap-2 rounded-lg transition ${isCurrent
                                ? "bg-brand-500 text-white shadow-theme-xs hover:bg-brand-600 disabled:bg-brand-300"
                                : "bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 dark:hover:bg-white/[0.03] dark:hover:text-gray-300"
                            }`}
                    >
                        {page}
                    </button>
                );
            } else {
                if (!prevEllipsis) {
                    buttons.push(
                        <span
                            key={`ellipsis-${page}`}
                            className="inline-flex px-5 py-3.5 text-sm items-center justify-center gap-2 text-gray-500"
                        >
                            ...
                        </span>
                    );
                    prevEllipsis = true;
                }
            }
        }
        return buttons;
    };
    const handleDeleteData = (id) => {
        closeModalConf();
        deleteData(selectedData);
    };
    const getStatus = (currentStatus) => {
        if (currentStatus == 1) {
            return <Badge color="success">Active</Badge>;
        }
        return <Badge color="error">InActive</Badge>;
    };

    useEffect(() => {
        console.log("data desa", dataDesa);
    }, [dataDesa]);

    const kabupatenMap = useMemo(() => {
        const map = { "11": {} };
        try {
            const list = kabupaten("11");
            if (Array.isArray(list)) {
                list.forEach((d) => {
                    if (d && d.kode) {
                        map["11"][d.kode] = d.nama;
                    }
                });
            }
        } catch (e) {
            console.error("Error loading kabupaten:", e);
        }
        return map;
    }, []);

    const desaMap = useMemo(() => {
        const map = {};
        if (data?.data && Array.isArray(data.data)) {
            data.data.forEach((row) => {
                const sub = row?.sub_district;
                if (sub && !map[sub]) {
                    map[sub] = {};
                    try {
                        const list = desa(sub);
                        if (Array.isArray(list)) {
                            list.forEach((d) => {
                                if (d && d.kode) {
                                    map[sub][d.kode] = d.nama;
                                }
                            });
                        }
                    } catch (e) {
                        console.error("Error loading desa for sub_district:", sub, e);
                    }
                }
            });
        }
        return map;
    }, [data]);

    const kecamatanMap = useMemo(() => {
        const map = {};
        if (data?.data && Array.isArray(data.data)) {
            data.data.forEach((row) => {
                const reg = row?.regency;
                if (reg && !map[reg]) {
                    map[reg] = {};
                    try {
                        const list = kecamatan(reg);
                        if (Array.isArray(list)) {
                            list.forEach((kec) => {
                                if (kec && kec.kode) {
                                    map[reg][kec.kode] = kec.nama;
                                }
                            });
                        }
                    } catch (e) {
                        console.error("Error loading kecamatan for regency:", reg, e);
                    }
                }
            });
        }
        return map;
    }, [data]);

    const getKecamatan = (row) =>
        (row && row.regency && kecamatanMap?.[row.regency]?.[row.sub_district]) || row?.sub_district || "-";

    const getDesa = (row) =>
        (row && row.sub_district && desaMap?.[row.sub_district]?.[row.village]) || row?.village || "-";
    const getKabupaten = (row) =>
        (row && row.regency && kabupatenMap?.["11"]?.[row.regency]) || row?.regency || "-";

    const renderSkeletonRows = () => {
        const skeletonRows = Array.from(
            { length: entriesPerPage },
            (_, idx) => (
                <tr key={`skeleton-${idx}`}>
                    {Array.from({ length: 5 }).map((_, colIdx) => (
                        <td key={colIdx} className="px-4 py-3">
                            <div className="h-4 w-full bg-gray-200 animate-pulse rounded"></div>
                        </td>
                    ))}
                </tr>
            )
        );
        return skeletonRows;
    };
    return (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white ">
            <Toaster
                openToaster={responseData.open}
                message={responseData.message}
                severity={responseData.severity}
                onClose={() =>
                    setResponseData({ ...responseData, open: false })
                }
            />
            <div className="navigation-1 flex flex-col ">
                <div className="p-5">
                    <div>
                        <Autocomplete
                            id="gelomabng"
                            name="gelombang"
                            sx={{ width: "100%" }}
                            value={selectedGelombangData}
                            options={gelombangData}
                            getOptionLabel={(option) => option.name}
                            onChange={(e, value) => {
                                setSelectedGelombangData(value);

                                setFormData({
                                    ...formData,
                                    id_gelombang: value.id,
                                });
                            }}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Gelombang"
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
                        ></Autocomplete>
                    </div>
                </div>
                <div className="navigation-2 p-4 sm:p-5 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-3 border-b border-gray-100 dark:border-gray-800">
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-2 text-sm text-gray-500 shrink-0">
                            <span>Show</span>
                            <Select
                                showPlaceHolder={false}
                                options={["5", "10", "50", "100"].map((v) => ({
                                    value: v,
                                    label: v,
                                }))}
                                defaultValue={entriesPerPage}
                                onChange={handleEntriesChange}
                                className="dark:bg-dark-900"
                            />
                            <span>entries</span>
                        </div>
                        <div className="w-full sm:w-52 md:w-60 lg:w-64 min-w-[160px]">
                            <Search
                                value={searchInput}
                                onChange={handleSearchChange}
                                placeholder="Cari lokasi PPL..."
                                className="w-full"
                            />
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                        <Button
                            size="sm"
                            variant="outline"
                            type="button"
                            onClick={() => {
                                setImportGelombang(selectedGelombangData);
                                setImportFile(null);
                                setImportError(null);
                                openImportModal();
                            }}
                            className="!border-emerald-600 !text-emerald-700 hover:!bg-emerald-50 dark:!text-emerald-400 dark:hover:!bg-emerald-950/30 flex items-center gap-1.5 !px-3 !py-2 text-xs md:text-sm font-medium whitespace-nowrap shadow-xs shrink-0"
                        >
                            <RiFileExcel2Line className="text-base text-emerald-600" />
                            Import Lokasi
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            type="button"
                            onClick={() => {
                                setImportPesertaGelombang(selectedGelombangData);
                                setImportPesertaFile(null);
                                setImportPesertaError(null);
                                openImportPesertaModal();
                            }}
                            className="!border-blue-600 !text-blue-700 hover:!bg-blue-50 dark:!border-blue-500 dark:!text-blue-400 dark:hover:!bg-blue-950/30 flex items-center gap-1.5 !px-3 !py-2 text-xs md:text-sm font-medium whitespace-nowrap shadow-xs shrink-0"
                        >
                            <RiFileExcel2Line className="text-base text-blue-600 dark:text-blue-400" />
                            Import Peserta
                        </Button>
                        <Button
                            size="sm"
                            onClick={openModal}
                            className="!px-3.5 !py-2 text-xs md:text-sm font-medium whitespace-nowrap shadow-xs shrink-0"
                        >
                            Tambah
                        </Button>
                    </div>
                </div>
                <div className="w-full max-h-[500px] overflow-auto">
                    <table className="min-w-full">
                        <thead className="sticky top-0 z-10 bg-white border-b border-gray-100 dark:border-white/[0.05]">
                            <tr>
                                <th
                                    rowSpan={2}
                                    className="px-5 py-3 text-xs font-medium text-gray-500"
                                >
                                    No
                                </th>
                                <th
                                    rowSpan={2}
                                    className="px-5 py-3 min-w-60 text-xs cursor-pointer font-medium text-gray-500"
                                    onClick={() => sortBy("name")}
                                >
                                    Nama {sortIcon("name")}
                                </th>
                                <th
                                    rowSpan={2}
                                    className="px-5 py-3 min-w-50 text-xs font-medium text-gray-500"
                                >
                                    Kabupaten
                                </th>
                                <th
                                    rowSpan={2}
                                    className="px-5 py-3 min-w-50 text-xs font-medium text-gray-500"
                                >
                                    Kecamatan
                                </th>
                                <th
                                    rowSpan={2}
                                    className="px-5 py-3 min-w-50 text-xs font-medium text-gray-500"
                                >
                                    Desa
                                </th>
                                <th
                                    rowSpan={2}
                                    className="px-5 py-3 min-w-50 text-xs font-medium text-gray-500"
                                >
                                    Supervisor
                                </th>

                                {/* Kelompok Kuota */}
                                <th
                                    colSpan={2}
                                    className="px-5 py-3 bg-blue-200/20 text-xs text-center font-medium text-gray-500 "
                                >
                                    Kuota
                                </th>

                                {/* Kelompok Terisi */}
                                <th
                                    colSpan={3}
                                    className="px-5 bg-green-300/20 py-3 text-xs text-center font-medium text-gray-500 "
                                >
                                    Terisi
                                </th>

                                <th
                                    rowSpan={2}
                                    className="px-5 py-3 text-xs font-medium text-gray-500"
                                >
                                    Action
                                </th>
                            </tr>
                            <tr>
                                {/* Detail Kuota */}
                                <th className="px-5 min-w-[100px] py-3 bg-blue-200/20 text-xs font-medium text-gray-500">
                                    Total Lowongan
                                </th>

                                <th className="px-5 min-w-[100px] py-3 bg-blue-200/20 text-xs font-medium text-gray-500">
                                    Total Kuota
                                </th>

                                {/* Detail Terisi */}
                                <th className="px-5 py-3 min-w-[100px] bg-green-300/20 text-xs font-medium text-gray-500">
                                    Total
                                </th>
                                <th className="px-5 py-3 min-w-[100px] bg-green-300/20 text-xs font-medium text-gray-500">
                                    Laki-Laki
                                </th>
                                <th className="px-5 py-3 min-w-[100px]  bg-green-300/20 text-xs font-medium text-gray-500">
                                    Perempuan
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                            {loading
                                ? renderSkeletonRows()
                                : data?.data?.map((row, idx) => (
                                    <tr key={row.id + "-" + idx}>
                                        <td className="px-4 py-3">
                                            {(currentPage - 1) *
                                                entriesPerPage +
                                                idx +
                                                1}
                                        </td>
                                        <td className="px-4 py-3">
                                            {row.name}
                                        </td>
                                        <td className="px-4 py-3">
                                            {getKabupaten(row)}
                                        </td>
                                        <td className="px-4 py-3">
                                            {getKecamatan(row)}
                                        </td>
                                        <td className="px-4 py-3">
                                            {getDesa(row)}
                                        </td>
                                        <td className="px-4 py-3">
                                            <p className="font-medium text-gray-800 dark:text-white/90">
                                                {row?.nama_supervisor || (row?.username_supervisor ? "-" : "Belum ditentukan")}
                                            </p>
                                            {row?.username_supervisor && (
                                                <p className="text-xs text-gray-500">
                                                    NIP: {row.username_supervisor}
                                                </p>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            {row?.total_lowongan ?? 0}
                                        </td>
                                        <td className="px-4 py-3">
                                            {row?.total_kuota ?? 0}
                                        </td>

                                        <td className="px-4 py-3">
                                            {row?.total}
                                        </td>
                                        <td className="px-4 py-3">
                                            {row?.total_male}
                                        </td>
                                        <td className="px-4 py-3">
                                            {row?.total_female}
                                        </td>

                                        <td className="px-4 py-3">
                                            <div className="flex gap-x-2 items-center justify-center">
                                                <button
                                                    onClick={() =>
                                                        handleDelete(row.id)
                                                    }
                                                    className="text-gray-500 cursor-pointer hover:text-error-500"
                                                >
                                                    <FaRegTrashCan />
                                                </button>
                                                <Link
                                                    href={`/admin/ppl/sekolah/detail?x=${row.id}`}
                                                    className="text-gray-500 cursor-pointer hover:text-gray-800"
                                                >
                                                    <TfiPencil />
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>

                <div className="navigation-3 p-5 flex flex-col md:flex-row gap-y-3 justify-between">
                    <div className="flex items-center gap-2 text-gray-500">
                        <span>{`Showing ${(currentPage - 1) * entriesPerPage + 1
                            } to ${Math.min(
                                currentPage * entriesPerPage,
                                totalEntries
                            )} of ${totalEntries} entries`}</span>
                    </div>
                    <div className="flex gap-x-4">
                        <Button
                            variant="outline"
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage((prev) => prev - 1)}
                        >
                            Previous
                        </Button>
                        <div className="w-full flex gap-x-2">
                            {renderPageButtons()}
                        </div>
                        <Button
                            variant="outline"
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage((prev) => prev + 1)}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            </div>
            <DynamicModal
                className="max-w-[700px] m-4"
                isOpen={isOpen}
                onClose={closeModal}
            >
                <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
                    <div className="px-2 pr-14">
                        <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
                            Tambah Sekolah
                        </h4>
                    </div>
                    <form className="flex flex-col" onSubmit={handleSave}>
                        <div className="custom-scrollbar h-[450px] overflow-y-auto px-2 pb-3">
                            <div className="mt-7">
                                <h5 className="mb-5 text-lg font-medium text-gray-800 dark:text-white/90 lg:mb-6">
                                    Informasi Sekolah
                                </h5>

                                <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                                    <div className="flex flex-col w-full">
                                        <Autocomplete
                                            id="sekolah"
                                            name="sekolah"
                                            sx={{ width: "100%" }}
                                            value={selectedSekolah}
                                            options={masterSekolah}
                                            getOptionLabel={(option) =>
                                                option.name
                                            }
                                            onChange={(e, value) => {
                                                setSelectedSekolah(value);
                                                setFormData({
                                                    ...formData,
                                                    id_sekolah: value.id,
                                                    name: value.name,
                                                });
                                                setValidationError({
                                                    ...validationError,
                                                    id_sekolah: null,
                                                    name: null,
                                                });
                                            }}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    label="Sekolah"
                                                    sx={{
                                                        "& .MuiOutlinedInput-root.Mui-focused":
                                                        {
                                                            outline: "none",
                                                            boxShadow:
                                                                "none",
                                                        },
                                                        "& .MuiInputBase-input:focus":
                                                        {
                                                            outline: "none",
                                                            boxShadow:
                                                                "none",
                                                        },
                                                    }}
                                                />
                                            )}
                                        ></Autocomplete>
                                        {validationError.id_sekolah && (
                                            <InputError
                                                message={
                                                    validationError.id_sekolah
                                                }
                                            />
                                        )}
                                    </div>
                                    <div className="flex flex-col w-full">
                                        <Autocomplete
                                            id="Supervisor"
                                            name="supervisor"
                                            sx={{ width: "100%" }}
                                            value={selectedSuperviosr}
                                            options={dataSupervisor}
                                            getOptionLabel={(option) =>
                                                `${option?.name} - NIP: ${option?.username}`
                                            }
                                            onChange={(e, value) => {
                                                setSelectedSupervisor(value);
                                                setFormData({
                                                    ...formData,
                                                    username_supervisor:
                                                        value.username,
                                                });
                                                setValidationError({
                                                    ...validationError,
                                                    username_supervisor: null,
                                                });
                                            }}
                                            renderOption={(props, option) => (
                                                <li
                                                    {...props}
                                                    key={option?.username}
                                                >
                                                    <div>
                                                        <p>{option?.name}</p>
                                                        <p>
                                                            NIP:{" "}
                                                            {option?.username}
                                                        </p>
                                                    </div>
                                                </li>
                                            )}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    label="Supervisor"
                                                    sx={{
                                                        "& .MuiOutlinedInput-root.Mui-focused":
                                                        {
                                                            outline: "none",
                                                            boxShadow:
                                                                "none",
                                                        },
                                                        "& .MuiInputBase-input:focus":
                                                        {
                                                            outline: "none",
                                                            boxShadow:
                                                                "none",
                                                        },
                                                    }}
                                                />
                                            )}
                                        />

                                        {validationError.username_supervisor && (
                                            <InputError
                                                message={
                                                    validationError.username_supervisor
                                                }
                                            />
                                        )}
                                    </div>
                                    <div className="flex flex-col w-full">
                                        <Autocomplete
                                            id="id_gelombang"
                                            name="id_gelombang"
                                            sx={{ width: "100%" }}
                                            value={selectedGelombangData}
                                            options={gelombangData}
                                            getOptionLabel={(option) =>
                                                `${option?.name}`
                                            }
                                            onChange={(e, value) => {
                                                setFormData({
                                                    ...formData,
                                                    id_gelombang: value.id,
                                                });
                                                setSelectedGelombangData(value);
                                            }}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    label="Gelombang"
                                                    sx={{
                                                        "& .MuiOutlinedInput-root.Mui-focused":
                                                        {
                                                            outline: "none",
                                                            boxShadow:
                                                                "none",
                                                        },
                                                        "& .MuiInputBase-input:focus":
                                                        {
                                                            outline: "none",
                                                            boxShadow:
                                                                "none",
                                                        },
                                                    }}
                                                />
                                            )}
                                        />

                                        {validationError.id_gelombang && (
                                            <InputError
                                                message={
                                                    validationError.id_gelombang
                                                }
                                            />
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
                            <Button
                                size="sm"
                                variant="outline"
                                startIcon={<PlusIcon />}
                                onClick={closeModal}
                            >
                                Close
                            </Button>
                            <Button
                                disabled={loading}
                                className="relative"
                                size="sm"
                                type="submit"
                            >
                                {loading ? <LoaderOnButton /> : "Save Changes"}
                            </Button>
                        </div>
                    </form>
                </div>
            </DynamicModal>

            {/* Modal Import Excel */}
            <DynamicModal
                className="max-w-[580px] m-4"
                isOpen={isOpenImport}
                onClose={() => {
                    setIsDraggingLokasi(false);
                    closeImportModal();
                }}
            >
                <div className="relative w-full max-w-[580px] overflow-hidden rounded-3xl bg-white p-6 dark:bg-gray-900 lg:p-8">
                    <div className="flex items-center gap-3 border-b border-gray-100 pb-4 dark:border-gray-800">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
                            <RiFileExcel2Line className="text-2xl" />
                        </div>
                        <div>
                            <h4 className="text-xl font-bold text-gray-800 dark:text-white/90">
                                Import Tempat PPL
                            </h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Unggah file Excel (.xlsx, .xls, .csv) untuk menambahkan data tempat PPL.
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handleImportSubmit} className="mt-5 space-y-4">
                        {/* Target Gelombang */}
                        <div>
                            <label className="mb-1 block text-xs font-semibold text-gray-700 dark:text-gray-300">
                                Gelombang Sasaran
                            </label>
                            <Autocomplete
                                id="import_gelombang"
                                name="import_gelombang"
                                sx={{ width: "100%" }}
                                value={importGelombang || selectedGelombangData}
                                options={gelombangData}
                                getOptionLabel={(option) => option?.name || ""}
                                onChange={(e, value) => setImportGelombang(value)}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        size="small"
                                        placeholder="Pilih Gelombang"
                                    />
                                )}
                            />
                        </div>

                        {/* Template Download Card */}
                        <div className="flex items-center justify-between rounded-xl border border-dashed border-gray-200 bg-gray-50/70 p-3.5 dark:border-gray-800 dark:bg-gray-800/40">
                            <div className="flex items-center gap-2.5">
                                <RiFileExcel2Line className="text-xl text-emerald-600 dark:text-emerald-400" />
                                <div>
                                    <p className="text-xs font-semibold text-gray-800 dark:text-white">
                                        Format Excel Template
                                    </p>
                                    <p className="text-[11px] text-gray-500 dark:text-gray-400">
                                        Unduh template standar untuk mengisi data
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={handleDownloadTemplate}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 hover:text-emerald-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                            >
                                <RiDownloadLine className="text-sm" />
                                Unduh Template
                            </button>
                        </div>

                        {/* File Upload Area */}
                        <div>
                            <label className="mb-1.5 block text-xs font-semibold text-gray-700 dark:text-gray-300">
                                Pilih File Excel
                            </label>
                            <div
                                onClick={() => document.getElementById("file-import-tempat-ppl")?.click()}
                                onDragOver={handleDragOver}
                                onDragEnter={handleDragEnterLokasi}
                                onDragLeave={handleDragLeaveLokasi}
                                onDrop={handleDropLokasi}
                                className={`relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center transition-all duration-200 cursor-pointer ${isDraggingLokasi
                                        ? "border-emerald-500 bg-emerald-100/50 scale-[1.01] shadow-lg shadow-emerald-500/10 dark:border-emerald-400 dark:bg-emerald-950/30"
                                        : importFile
                                        ? "border-emerald-500 bg-emerald-50/20 dark:border-emerald-600 dark:bg-emerald-950/10"
                                        : "border-gray-300 bg-gray-50 hover:bg-gray-100/70 hover:border-gray-400 dark:border-gray-700 dark:bg-gray-800/50 dark:hover:bg-gray-800"
                                    }`}
                            >
                                <input
                                    id="file-import-tempat-ppl"
                                    type="file"
                                    className="hidden"
                                    accept=".xlsx,.xls,.csv"
                                    onChange={(e) => {
                                        if (e.target.files && e.target.files[0]) {
                                            setImportFile(e.target.files[0]);
                                            setImportError(null);
                                        }
                                    }}
                                />
                                <RiUploadCloud2Line
                                    className={`text-4xl mb-2 transition-transform duration-200 ${isDraggingLokasi
                                            ? "text-emerald-600 scale-125 animate-bounce"
                                            : importFile
                                            ? "text-emerald-600"
                                            : "text-gray-400"
                                        }`}
                                />
                                {isDraggingLokasi ? (
                                    <div>
                                        <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                                            Lepaskan file Excel di sini...
                                        </p>
                                        <p className="text-xs text-emerald-500 dark:text-emerald-400 mt-0.5">
                                            File akan otomatis dipilih
                                        </p>
                                    </div>
                                ) : importFile ? (
                                    <div>
                                        <p className="text-sm font-semibold text-gray-800 dark:text-white">
                                            {importFile.name}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            {(importFile.size / 1024).toFixed(1)} KB — Klik atau seret file lain untuk mengganti
                                        </p>
                                    </div>
                                ) : (
                                    <div>
                                        <p className="text-xs font-semibold text-gray-700 dark:text-gray-200">
                                            Klik untuk memilih file Excel atau seret dan lepas file ke sini
                                        </p>
                                        <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                                            Format didukung: .xlsx, .xls, .csv (Maks. 10MB)
                                        </p>
                                    </div>
                                )}
                            </div>
                            {importError && (
                                <div className="mt-2">
                                    <InputError message={importError} />
                                </div>
                            )}
                        </div>

                        {/* Panduan Format Singkat */}
                        <div className="rounded-xl bg-blue-50/60 p-3 text-[11px] text-blue-800 dark:bg-blue-950/30 dark:text-blue-300">
                            <span className="font-bold">Ketentuan Kolom:</span>
                            <ul className="mt-1 list-disc list-inside space-y-0.5 text-blue-700 dark:text-blue-400">
                                <li><span className="font-medium">Nama Sekolah:</span> Wajib (otomatis disinkronkan ke Master Sekolah).</li>
                                <li><span className="font-medium">NIP Supervisor:</span> Opsional (diisi NIP supervisor terdaftar).</li>
                                <li><span className="font-medium">Kabupaten, Kecamatan, Desa:</span> Opsional (kode atau nama wilayah).</li>
                            </ul>
                        </div>

                        {/* Modal Actions */}
                        <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                            <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                    setImportFile(null);
                                    setImportError(null);
                                    setIsDraggingLokasi(false);
                                    closeImportModal();
                                }}
                            >
                                Batal
                            </Button>
                            <Button
                                disabled={importLoading || !importFile}
                                className="relative !bg-emerald-600 hover:!bg-emerald-700"
                                size="sm"
                                type="submit"
                            >
                                {importLoading ? <LoaderOnButton /> : "Import Sekarang"}
                            </Button>
                        </div>
                    </form>
                </div>
            </DynamicModal>

            {/* Modal Import Peserta PPL (Multi-Sheet) */}
            <DynamicModal
                className="max-w-[640px] m-4"
                isOpen={isOpenImportPeserta}
                onClose={() => {
                    if (!importPesertaLoading) {
                        setImportPesertaFile(null);
                        setImportPesertaError(null);
                        setIsDraggingPeserta(false);
                        closeImportPesertaModal();
                    }
                }}
            >
                <div className="relative w-full max-w-[640px] overflow-hidden rounded-3xl bg-white p-6 dark:bg-gray-900 lg:p-8">
                    {/* Header */}
                    <div className="flex items-start gap-3.5 border-b border-gray-100 pb-4 dark:border-gray-800">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
                            <RiFileExcel2Line className="text-2xl" />
                        </div>
                        <div>
                            <h4 className="text-xl font-bold text-gray-800 dark:text-white/90">
                                Import Data Peserta PPL
                            </h4>
                            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                                Tambahkan mahasiswa peserta PPL langsung ke sekolah-sekolah di gelombang ini via Excel multi-sheet lengkap dengan kuota jurusan.
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handleImportPesertaSubmit} className="mt-5 space-y-4">
                        {/* Gelombang Sasaran */}
                        <div>
                            <label className="mb-1 block text-xs font-semibold text-gray-700 dark:text-gray-300">
                                Gelombang Sasaran
                            </label>
                            <Autocomplete
                                id="import_peserta_gelombang"
                                name="import_peserta_gelombang"
                                sx={{ width: "100%" }}
                                value={importPesertaGelombang || selectedGelombangData}
                                options={gelombangData}
                                getOptionLabel={(option) => option?.name || ""}
                                onChange={(e, value) => setImportPesertaGelombang(value)}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        size="small"
                                        placeholder="Pilih Gelombang"
                                    />
                                )}
                            />
                        </div>

                        {/* Template Download Card (Multi-Sheet) */}
                        <div className="flex items-center justify-between rounded-xl border border-dashed border-blue-200 bg-blue-50/50 p-3.5 dark:border-blue-900/60 dark:bg-blue-950/20">
                            <div className="flex items-center gap-2.5">
                                <RiFileExcel2Line className="text-2xl text-blue-600 dark:text-blue-400" />
                                <div>
                                    <p className="text-xs font-bold text-gray-800 dark:text-white">
                                        Template Excel Multi-Sheet
                                    </p>
                                    <p className="text-[11px] text-gray-500 dark:text-gray-400">
                                        Disertai Sheet Kode Prodi (MPI, PGMI, dll) & Daftar Sekolah/Kuota
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={handleDownloadPesertaTemplate}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-blue-300 bg-white px-3 py-1.5 text-xs font-medium text-blue-700 shadow-sm transition hover:bg-blue-50 dark:border-blue-700 dark:bg-gray-800 dark:text-blue-300 dark:hover:bg-gray-700"
                            >
                                <RiDownloadLine className="text-sm" />
                                Unduh Template
                            </button>
                        </div>

                        {/* File Upload Dropzone */}
                        <div>
                            <label className="mb-1.5 block text-xs font-semibold text-gray-700 dark:text-gray-300">
                                Pilih File Excel (.xlsx / .xls)
                            </label>
                            <div
                                onClick={() => document.getElementById("file-import-peserta-ppl")?.click()}
                                onDragOver={handleDragOver}
                                onDragEnter={handleDragEnterPeserta}
                                onDragLeave={handleDragLeavePeserta}
                                onDrop={handleDropPeserta}
                                className={`relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center transition-all duration-200 cursor-pointer ${isDraggingPeserta
                                        ? "border-blue-500 bg-blue-100/50 scale-[1.01] shadow-lg shadow-blue-500/10 dark:border-blue-400 dark:bg-blue-950/30"
                                        : importPesertaFile
                                        ? "border-blue-500 bg-blue-50/20 dark:border-blue-600 dark:bg-blue-950/10"
                                        : "border-gray-300 bg-gray-50 hover:bg-gray-100/70 hover:border-gray-400 dark:border-gray-700 dark:bg-gray-800/50 dark:hover:bg-gray-800"
                                    }`}
                            >
                                <input
                                    id="file-import-peserta-ppl"
                                    type="file"
                                    className="hidden"
                                    accept=".xlsx,.xls,.csv"
                                    onChange={(e) => {
                                        if (e.target.files && e.target.files[0]) {
                                            setImportPesertaFile(e.target.files[0]);
                                            setImportPesertaError(null);
                                        }
                                    }}
                                />
                                <RiUploadCloud2Line
                                    className={`text-4xl mb-2 transition-transform duration-200 ${isDraggingPeserta
                                            ? "text-blue-600 scale-125 animate-bounce"
                                            : importPesertaFile
                                            ? "text-blue-600"
                                            : "text-gray-400"
                                        }`}
                                />
                                {isDraggingPeserta ? (
                                    <div>
                                        <p className="text-sm font-bold text-blue-600 dark:text-blue-400">
                                            Lepaskan file Excel di sini...
                                        </p>
                                        <p className="text-xs text-blue-500 dark:text-blue-400 mt-0.5">
                                            File akan otomatis dipilih
                                        </p>
                                    </div>
                                ) : importPesertaFile ? (
                                    <div>
                                        <p className="text-sm font-semibold text-gray-800 dark:text-white">
                                            {importPesertaFile.name}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            {(importPesertaFile.size / 1024).toFixed(1)} KB — Klik atau seret file lain untuk mengganti
                                        </p>
                                    </div>
                                ) : (
                                    <div>
                                        <p className="text-xs font-semibold text-gray-700 dark:text-gray-200">
                                            Klik untuk memilih file Excel atau seret dan lepas file ke sini
                                        </p>
                                        <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                                            Format didukung: .xlsx, .xls (Maks. 15MB)
                                        </p>
                                    </div>
                                )}
                            </div>
                            {importPesertaError && (
                                <div className="mt-2">
                                    <InputError message={importPesertaError} />
                                </div>
                            )}
                        </div>

                        {/* Sheet Guide Info */}
                        <div className="rounded-xl bg-gray-50 p-3.5 border border-gray-100 dark:bg-gray-800/60 dark:border-gray-700/60 text-[11px] text-gray-600 dark:text-gray-300">
                            <span className="font-bold text-gray-800 dark:text-white">Petunjuk Sheet Excel:</span>
                            <ul className="mt-1.5 space-y-1 list-disc list-inside">
                                <li>
                                    <span className="font-semibold text-blue-600 dark:text-blue-400">Sheet 1 (Data Peserta PPL):</span> Cukup isi NIM dan Nama Sekolah / ID Sekolah (Nama Mahasiswa & Program Studi otomatis terhubung dari data mahasiswa).
                                </li>
                                <li>
                                    <span className="font-semibold text-blue-600 dark:text-blue-400">Sheet 2 (Daftar Sekolah & Kuota):</span> Referensi nama/ID sekolah terdaftar beserta ketersediaan kuota per jurusan.
                                </li>
                                <li>
                                    <span className="font-semibold text-blue-600 dark:text-blue-400">Sheet 3 (Petunjuk Pengisian):</span> Panduan dan ketentuan pengisian template.
                                </li>
                            </ul>
                        </div>

                        {/* Modal Actions */}
                        <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                            <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                    setImportPesertaFile(null);
                                    setImportPesertaError(null);
                                    setIsDraggingPeserta(false);
                                    closeImportPesertaModal();
                                }}
                            >
                                Batal
                            </Button>
                            <Button
                                disabled={importPesertaLoading || !importPesertaFile}
                                className="relative !bg-blue-600 hover:!bg-blue-700"
                                size="sm"
                                type="submit"
                            >
                                {importPesertaLoading ? <LoaderOnButton /> : "Import Peserta Sekarang"}
                            </Button>
                        </div>
                    </form>
                </div>
            </DynamicModal>
            <DynamicModalConf
                className="max-w-[400px] m-4"
                showCloseButton={false}
                isOpen={isOpenConf}
                onClose={closeModalConf}
            >
                <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
                    <div className="px-2 pr-14">
                        <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
                            Confirmation
                        </h4>
                    </div>
                    <div className="flex flex-col">
                        <div className="custom-scrollbar h-[50px] overflow-y-auto px-2 pb-3">
                            Apakah anda yakin akan menghapus?
                        </div>
                        <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={closeModalConf}
                            >
                                Cancel
                            </Button>
                            <Button
                                disabled={loading}
                                className="relative"
                                size="sm"
                                type="submit"
                                onClick={handleDeleteData}
                            >
                                Oke
                            </Button>
                        </div>
                    </div>
                </div>
            </DynamicModalConf>
        </div>
    );
};

export default TempatPPLTable;
