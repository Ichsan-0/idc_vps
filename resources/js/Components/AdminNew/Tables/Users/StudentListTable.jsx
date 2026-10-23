import Badge from "@/Components/Badge";
import Button from "@/Components/Button";
import DynamicModal from "@/Components/DynamicModal";
import LoaderOnButton from "@/Components/LoaderOnButtn";
import Search from "@/Components/Search";
import { config } from "@/config/config";
import { useConfirmationModal, useModal } from "@/Hooks/useModal";
import { PlusIcon } from "@heroicons/react/24/outline";
import axios from "axios";
import React from "react";
import { useEffect } from "react";
import { useState } from "react";
import { useRef } from "react";
import { PiSortAscending, PiSortDescending } from "react-icons/pi";
import { FaRegTrashCan } from "react-icons/fa6";
import { TfiPencil } from "react-icons/tfi";
import DynamicModalConf from "@/Components/DynamicModalConf";
import { desa, kabupaten, kecamatan } from "daftar-wilayah-indonesia";
import { useMemo } from "react";
import { Autocomplete, TextField, Select as MuiSelect, MenuItem } from "@mui/material";
import { Link } from "@inertiajs/react";
import { Eye, Download } from "lucide-react";
import { getMappingStatus, getStatusColor } from "@/Utils/utils";
import { downloadExcel } from "@/Utils/downloadExcel";

const StudentListTable = () => {
    const [loading, setLoading] = useState(false);
    const [exportLoading, setExportLoading] = useState(false);
    const { openModal, closeModal, isOpen } = useModal();
    const { openModalConf, closeModalConf, isOpenConf } =
        useConfirmationModal();

    const [currentPage, setCurrentPage] = useState(1);
    const [entriesPerPage, setEntriesPerPage] = useState(5);
    const [totalEntries, setTotalEntries] = useState(null);
    const [totalPages, setTotalPages] = useState(null);
    const [validationError, setValidationError] = useState(null);
    const [searchKey, setSearchKey] = useState(null);
    const [searchInput, setSearchInput] = useState(null);
    const searchTimer = useRef(null);
    const [selectedData, setSelectedData] = useState(null);
    const [statusFilter, setStatusFilter] = useState("");

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
    const [masterDesa, setMasterDesa] = useState([]);
    const [selectedDesa, setSelectedDesa] = useState(null);
    const [selectedSuperviosr, setSelectedSupervisor] = useState(null);
    const [quota, setQuata] = useState(0);
    const [quotaLk, setQuotaLk] = useState(0);
    const [quotaPr, setQuataPR] = useState(0);
    const [description, setDescription] = useState(null);

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        username_supervisor: "",
        id_desa: "",
        quota_lk: "",
        quota_pr: "",
        qouta: "",
        id_gelombang: "",
    });

    // Options untuk filter status
    const statusOptions = [
        { value: "", label: "Semua Status" },
        { value: "accepted", label: "Diterima" },
        { value: "rejected", label: "Ditolak" },
        { value: "submitted", label: "Submitted" },
        { value: "revisi", label: "Revisi" },
    ];

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
                `${config.base_url}/api/admin/kpm/lowongan/${id}`,
                {
                    withCredentials: true,
                    headers: {
                        Accept: "application/json",
                    },
                }
            );
        } catch (error) {
            setLoading(false);
        } finally {
            setSelectedData(null);
            getData();
        }
    };

    const getData = async () => {
        try {
            setLoading(true);

            const response = await axios.get(
                `${config.base_url}/api/admin/users/student/list`,
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
                        status: statusFilter || undefined,
                    },
                }
            );
            console.log("API Response:", response.data);
            if (response.data?.data) {
                setData(response.data.data);
            } else {
                setData({ data: [], total: 0, last_page: 1, current_page: 1 });
            }
        } catch (error) {
            console.error("API Error:", error.response?.data || error.message);
            setData({ data: [], total: 0, last_page: 1, current_page: 1 });
            setValidationError(error.response?.data?.message || "Failed to fetch student data");
        } finally {
            setLoading(false);
        }
    };

    // Fungsi untuk export data ke Excel
    const handleExportExcel = async () => {
        setExportLoading(true);
        try {
            const now = new Date();
            const jakartaTime = new Date(now.getTime() + 7 * 60 * 60 * 1000);
            const formattedDate = jakartaTime
                .toISOString()
                .slice(0, 19)
                .replace("T", "_")
                .replace(/:/g, "-");

            await downloadExcel({
                url: `${config.base_url}/api/admin/users/student/export`,
                data: {
                    search: searchKey,
                    idGelombang: selectedGelombangData?.id,
                    status: statusFilter,
                    sortBy: sortKey ?? "id",
                    sortOrder: (sortDir ?? "asc").toUpperCase(),
                },
                filename: `Mahasiswa_${formattedDate}.xlsx`,
            });
        } catch (err) {
            setValidationError(err.message || "Gagal mengekspor data.");
        } finally {
            setExportLoading(false);
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
            } else {
                setLoading(false);
            }
        } catch (error) {
            setLoading(false);
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
        statusFilter,
    ]);

    useEffect(() => {
        getGelombangData();
  
    }, []);

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchInput(value);

        if (searchTimer.current) {
            clearTimeout(searchTimer.current);
        }

        searchTimer.current = setTimeout(() => {
            setSearchKey(value);
            setCurrentPage(1);
        }, 400);
    };

    useEffect(() => {
        return () => {
            if (searchTimer.current) {
                clearTimeout(searchTimer.current);
            }
        };
    }, []);
    
    const handleStatusFilterChange = (e) => {
        setStatusFilter(e.target.value);
        setCurrentPage(1); // Reset ke halaman pertama saat filter berubah
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
    
   




   

    
    const renderSkeletonRows = () => {
        const skeletonRows = Array.from(
            { length: entriesPerPage },
            (_, idx) => (
                <tr key={`skeleton-${idx}`}>
                    {Array.from({ length: 11 }).map((_, colIdx) => (
                        <td key={colIdx} className="px-4 py-3">
                            <div className="h-4 w-full bg-gray-200 animate-pulse rounded"></div>
                        </td>
                    ))}
                </tr>
            )
        );
        return skeletonRows;
    };
    
    // Untuk select "Show entries", kita juga bisa menggunakan Material UI Select
    const handleEntriesChangeMUI = (e) => {
        setEntriesPerPage(parseInt(e.target.value));
        setCurrentPage(1);
    };
    
    return (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white ">
            {validationError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-t-lg">
                    {validationError}
                </div>
            )}
            <div className="navigation-1 flex flex-col ">
                <div className="p-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                            <Autocomplete
                                id="gelombang"
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
                            />
                        </div>
                        <div>
                            <MuiSelect
                                value={statusFilter}
                                onChange={handleStatusFilterChange}
                                displayEmpty
                                sx={{ 
                                    width: "100%",
                                    "& .MuiOutlinedInput-root.Mui-focused": {
                                        outline: "none",
                                        boxShadow: "none",
                                    },
                                }}
                            >
                                {statusOptions.map((option) => (
                                    <MenuItem key={option.value} value={option.value}>
                                        {option.label}
                                    </MenuItem>
                                ))}
                            </MuiSelect>
                        </div>
                        <div className="flex items-end">
                            <Button
                                onClick={handleExportExcel}
                                disabled={exportLoading}
                                className="w-full md:w-auto"
                                startIcon={<Download className="h-4 w-4" />}
                            >
                                {exportLoading ? (
                                    <>
                                        <LoaderOnButton />
                                        Exporting...
                                    </>
                                ) : (
                                    "Export Excel"
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
                <div className="navigation-2 p-5 flex flex-col md:flex-row gap-y-3  justify-between">
                    <div className="flex items-center gap-2 text-gray-500">
                        <span>Show</span>
                        <MuiSelect
                            value={entriesPerPage}
                            onChange={handleEntriesChangeMUI}
                            size="small"
                            sx={{ 
                                minWidth: 80,
                                "& .MuiOutlinedInput-root.Mui-focused": {
                                    outline: "none",
                                    boxShadow: "none",
                                },
                            }}
                        >
                            {["5", "10", "50", "100"].map((v) => (
                                <MenuItem key={v} value={parseInt(v)}>
                                    {v}
                                </MenuItem>
                            ))}
                        </MuiSelect>
                        <span>entries</span>
                    </div>
                    <div className="flex justify-end gap-x-2">
                        <Search
                            value={searchInput}
                            onChange={handleSearchChange}
                        />
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
                                    className="px-5 py-3 min-w-60 text-xs cursor-pointer font-medium text-gray-500"
                                    onClick={() => sortBy("name")}
                                >
                                    Nama {sortIcon("name")}
                                </th>
                                <th className="px-5 py-3 min-w-50 text-xs font-medium text-gray-500">
                                    NIM
                                </th>
                                <th className="px-5 py-3 min-w-50 text-xs font-medium text-gray-500">
                                    Email
                                </th>
                                <th className="px-5 py-3 min-w-50 text-xs font-medium text-gray-500">
                                    Prodi
                                </th>
                                <th className="px-5 py-3 min-w-50 text-xs font-medium text-gray-500">
                                    Gender
                                </th>
                                <th className="px-5 py-3 min-w-50 text-xs font-medium text-gray-500">
                                    Cluster Kegiatan
                                </th>
                                <th className="px-5 py-3 min-w-50 text-xs font-medium text-gray-500">
                                    Nilai Micro
                                </th>

                                <th className="px-5 py-3 min-w-50 text-xs font-medium text-gray-500">
                                    Gelombang
                                </th>

                                <th className="px-5 py-3 min-w-50 text-xs font-medium text-gray-500">
                                    Status
                                </th>

                                <th className="px-5 py-3 text-xs font-medium text-gray-500">
                                    Action
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                            {loading
                                ? renderSkeletonRows()
                                : (data?.data && data?.data?.length > 0) ? (
                                    data?.data?.map((row, idx) => (
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
                                              {row.nim}
                                          </td>
                                          <td className="px-4 py-3">
                                              {row.email}
                                          </td>
                                          <td className="px-4 py-3">
                                              {row.nama_prodi}
                                          </td>
                                          <td className="px-4 py-3">
                                              {row.gender}
                                          </td>
                                          <td className="px-4 py-3">
                                              {row.cluster_kegiatan}
                                          </td>
                                          <td className="px-4 py-3">
                                              {row.nilai_micro_teaching}
                                          </td>
                                          <td className="px-4 py-3">
                                              {row.nama_gelombang}
                                          </td>
                                          <td className="px-4 py-3">
                                              <Badge
                                                  variant="light"
                                                  color={
                                                      getStatusColor(row?.status)
                                                  }
                                              >

                                                      {getMappingStatus(row?.status)}
                                              </Badge>
                                          </td>

                                          <td className="px-4 py-3">
                                              <div className="flex gap-x-2 items-center justify-center">
                                                  {/* <button
                                                      onClick={() =>
                                                          handleDelete(row.id)
                                                      }
                                                      className="text-gray-500 cursor-pointer hover:text-error-500"
                                                  >
                                                      <FaRegTrashCan />
                                                  </button> */}
                                                  <Link
                                                      href={`/admin/users/student/detail?x=${row.nim}`}
                                                      className="text-gray-500 cursor-pointer hover:text-gray-800"
                                                  >
                                                      <Eye />
                                                  </Link>
                                              </div>
                                          </td>
                                      </tr>
                                    ))
                                  ) : (
                                    <tr>
                                        <td colSpan="11" className="px-4 py-8 text-center text-gray-500">
                                            No data available. Please check your filters or try again.
                                        </td>
                                    </tr>
                                  )
                            }
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

export default StudentListTable;

const getStatus = (status) =>{
    

}