import Badge from "@/Components/Badge";
import Button from "@/Components/Button";
import DynamicModal from "@/Components/DynamicModal";

import LoaderOnButton from "@/Components/LoaderOnButtn";
import Search from "@/Components/Search";
import Select from "@/Components/Select";
import { config } from "@/config/config";
import { useConfirmationModal, useModal } from "@/Hooks/useModal";
import { PlusIcon } from "@heroicons/react/24/outline";
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
    const { openModalConf, closeModalConf, isOpenConf } =
        useConfirmationModal();

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
                        className={`inline-flex px-5 py-3.5 text-sm items-center justify-center gap-2 rounded-lg transition ${
                            isCurrent
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
        const map = {};
        data?.data?.forEach((row) => {
            if (!map["11"]) {
                map["11"] = {};
                kabupaten("11").forEach((d) => {
                    map["11"][d.kode] = d.nama;
                });
            }
        });
        return map;
    }, [data]);

    const desaMap = useMemo(() => {
        const map = {};
        data?.data?.forEach((row) => {
            if (!map[row.sub_district]) {
                map[row.sub_district] = {};
                desa(row.sub_district).forEach((d) => {
                    map[row.sub_district][d.kode] = d.nama;
                });
            }
        });
        return map;
    }, [data]);

    const kecamatanMap = useMemo(() => {
        const map = {};
        data?.data?.forEach((row) => {
            if (!map[row.regency]) {
                map[row.regency] = {};
                kecamatan(row.regency).forEach((kec) => {
                    map[row.regency][kec.kode] = kec.nama;
                });
            }
        });
        return map;
    }, [data]);

    const getKecamatan = (row) =>
        (row && kecamatanMap?.[row.regency]?.[row.sub_district]) || "-";

    const getDesa = (row) =>
        (row && desaMap?.[row.sub_district]?.[row.village]) || "-";
    const getKabupaten = (row) =>
        (row && kabupatenMap?.["11"]?.[row.regency]) || "-";

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
                <div className="navigation-2 p-5 flex flex-col md:flex-row gap-y-3  justify-between">
                    <div className="flex items-center gap-2 text-gray-500">
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
                    <div className="flex justify-end gap-x-2">
                        <Search
                            value={searchInput}
                            onChange={handleSearchChange}
                        />
                        <Button onClick={openModal}>Tambah</Button>
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
                                              <p>{row?.nama_supervisor}</p>
                                              <p>
                                                  NIP:{row?.username_supervisor}
                                              </p>
                                          </td>
                                          <td className="px-4 py-3">
                                              {row?.total_lowongan}
                                          </td>
                                          <td className="px-4 py-3">
                                              {row?.total_kuota}
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
                        <span>{`Showing ${
                            (currentPage - 1) * entriesPerPage + 1
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
