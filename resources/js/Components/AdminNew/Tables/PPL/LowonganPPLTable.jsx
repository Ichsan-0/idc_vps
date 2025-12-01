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
import { PiSortAscending, PiSortDescending } from "react-icons/pi";
import { FaRegTrashCan } from "react-icons/fa6";
import { TfiPencil } from "react-icons/tfi";
import DynamicModalConf from "@/Components/DynamicModalConf";
import { Autocomplete, TextField } from "@mui/material";
import { Link, usePage } from "@inertiajs/react";

import SelectCustom from "@/Components/Select";
import EditLowonganPPL from "../../PopUps/EditLowonganPPL";
import Toaster from "@/Components/Toaster";
import InputError from "@/Components/InputError";

const LowonganPPLTable = () => {
    const [loading, setLoading] = useState(false);
    const { openModal, closeModal, isOpen } = useModal();
    const { openModalConf, closeModalConf, isOpenConf } =
        useConfirmationModal();

    const modalA = useModal();

    const { props } = usePage();
    const x = props.data?.id;

    const [currentPage, setCurrentPage] = useState(1);
    const [entriesPerPage, setEntriesPerPage] = useState(5);
    const [totalEntries, setTotalEntries] = useState(null);
    const [totalPages, setTotalPages] = useState(null);

    const [validationError, setValidationError] = useState({
        keterangan: null,
        id_sekolah: null,
        id_prodi: null,
        name: null,
        quota: null,
    });

    const [searchKey, setSearchKey] = useState(null);
    const [searchInput, setSearchInput] = useState(null);
    const [selectedData, setSelectedData] = useState(null);
    const [selectedPelamar, setSelectedPelamar] = useState(null);

    const [data, setData] = useState([]);
    const [sortKey, setSortKey] = useState(null);
    const [sortDir, setSortDir] = useState(null);
    const [selectedLowongan, setSelectedLowongan] = useState(null);
    const [listProdi, setListProdi] = useState(null);
    const [selectedProdi, setSelectedProdi] = useState(null);
    const [responseData, setResponseData] = useState({
        severity: "",
        open: false,
        message: "",
    });

    const [formData, setFormData] = useState({
        keterangan: "",
        id_sekolah: "",
        id_prodi: "",
        name: "",
        quota: "",
    });

    const isValid = () => {
        const errors = {
            keterangan: null,
            id_sekolah: null,
            id_prodi: null,
            name: null,
            quota: null,
        };

        if (!formData.keterangan || formData.keterangan.trim() === "") {
            errors.keterangan = "Keterangan wajib diisi";
        }

        if (!formData.name || formData.name.trim() === "") {
            errors.name = "Nama wajib diisi";
        }

        if (!formData.id_prodi || formData.id_prodi === "") {
            errors.id_prodi = "Prodi wajib diisi";
        }

        if (!formData.quota || formData.quota === "") {
            errors.quota = "Kuota wajib diisi";
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
        console.log("valid", isValid());
        if (isValid()) {
            try {
                setLoading(true);
                const payload = new FormData();
                payload.append("keterangan", formData.keterangan);
                payload.append("id_sekolah", x);
                payload.append("id_prodi", formData.id_prodi);
                payload.append("name", formData.name);
                payload.append("quota", formData.quota);

                const res = await axios.post(
                    `${config.base_url}/api/admin/ppl/lowongan/add`,
                    payload,
                    {
                        headers: {
                            "Content-Type": "multipart/form-data",
                        },
                    }
                );
                setLoading(false);
                setResponseData({
                    message: res?.data?.message,
                    severity: "success",
                    open: true,
                });

                getData();
                closeModal();
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
                        message: error.response?.data?.message,
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
            }
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
        console.log("conf delete");
        openModalConf();
        setSelectedData(id);
    };

    const deleteData = async (id) => {
        try {
            setLoading(true);
            const response = await axios.delete(
                `${config.base_url}/api/admin/ppl/lowongan/delete/${id}`,
                {
                    withCredentials: true,
                    headers: {
                        Accept: "application/json",
                    },
                    params: {
                        idLamaran: selectedData,
                    },
                }
            );

            setResponseData({
                open: true,
                severity: "success",
                message: response.data.message,
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
                    message: error.response?.data?.message,
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
            setSelectedData(null);
            getData();
            
        }
    };

    const getProdi = async () => {
        try {
            const res = await axios.get(`${config.base_url}/api/prodi`);
            setListProdi(res.data.data);
        } catch (e) {
            console.log(e);
        }
    };

    const getData = async () => {
        try {
            setLoading(true);
            console.log("id_sekolah :", x);

            const response = await axios.get(
                `${config.base_url}/api/admin/ppl/lowongan/list`,
                {
                    params: {
                        id_sekolah: x,
                        page: currentPage,
                        perPage: entriesPerPage,
                        sortBy: sortKey,
                        sortOrder: sortDir,
                        search: searchKey,
                    },
                }
            );
            setData(response.data.data);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getData();
    }, [currentPage, entriesPerPage, sortKey, sortDir, searchKey]);

    useEffect(() => {
        getProdi();
        getData();
    }, []);

    const handleSearchChange = (e) => {
        setSearchInput(e.target.value);
        setTimeout(() => {
            setSearchKey(e.target.value);
        }, 2000);
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
                <div className="navigation-2 p-5 flex flex-col md:flex-row gap-y-3  justify-between">
                    <div className="flex items-center gap-2 text-gray-500">
                        <span>Show</span>
                        <SelectCustom
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
                        <div>
                            <Search
                                value={searchInput}
                                onChange={(e) => handleSearchChange(e)}
                            />
                        </div>

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
                                    Nama Lowongan {sortIcon("name")}
                                </th>
                                <th
                                    rowSpan={2}
                                    className="px-5 py-3 min-w-60 text-xs cursor-pointer font-medium text-gray-500"
                                    onClick={() => sortBy("nama_prodi")}
                                >
                                    Prodi {sortIcon("nama_prodi")}
                                </th>
                                <th
                                    rowSpan={2}
                                    className="px-5 py-3 min-w-50 text-xs font-medium text-gray-500"
                                    onClick={() => sortBy("total_quota")}
                                >
                                    Total Kuota {sortIcon("total_quota")}
                                </th>
                                <th
                                    rowSpan={2}
                                    className="px-5 py-3 min-w-50 text-xs font-medium text-gray-500"
                                    onClick={() => sortBy("total_terisi")}
                                >
                                    Terisi {sortIcon("total_terisi")}
                                </th>

                                <th
                                    rowSpan={2}
                                    className="px-5 py-3 text-xs font-medium text-gray-500"
                                >
                                    Action
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
                                              {row.nama_prodi}
                                          </td>
                                          <td className="px-4 py-3">
                                              {row.total_quota}
                                          </td>

                                          <td className="px-4 py-3">
                                              {row?.total_terisi}
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
                                                  <button
                                                      //   href={`/admin/kpm/tempatkpm/${row.id}`}
                                                      className="text-gray-500 cursor-pointer hover:text-gray-800"
                                                      onClick={() => {
                                                          setSelectedLowongan(
                                                              row?.id
                                                          );
                                                          modalA.openModal();
                                                      }}
                                                  >
                                                      <TfiPencil />
                                                  </button>
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
                            Tambah Lowongan
                        </h4>
                    </div>
                    <form className="flex flex-col" onSubmit={handleSave}>
                        <div className="custom-scrollbar h-[450px] overflow-y-auto px-2 pb-3">
                            <div className="mt-7">
                                <h5 className="mb-5 text-lg font-medium text-gray-800 dark:text-white/90 lg:mb-6">
                                    Informasi Lowongan
                                </h5>

                                <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                                    <div className="flex flex-col w-full">
                                        <TextField
                                            id="name"
                                            name="name"
                                            value={formData.name}
                                            label="Nama"
                                            placeholder="nama"
                                            onChange={(e) => {
                                                setFormData({
                                                    ...formData,
                                                    name: e.target.value,
                                                });
                                                setValidationError({
                                                    ...validationError,
                                                    name: null,
                                                });
                                            }}
                                            multiline
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
                                        ></TextField>
                                        {validationError.name && (
                                            <InputError
                                                message={validationError.name}
                                            />
                                        )}
                                    </div>
                                    <div className="flex flex-col w-full">
                                        <Autocomplete
                                            id="prodi"
                                            name="prodi"
                                            sx={{ width: "100%" }}
                                            value={selectedProdi}
                                            options={listProdi}
                                            getOptionLabel={(option) =>
                                                option.name
                                            }
                                            onChange={(e, value) => {
                                                setSelectedProdi(value);
                                                setFormData({
                                                    ...formData,
                                                    id_prodi: value.id,
                                                });
                                            }}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    label="Prodi"
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
                                        {validationError.id_prodi && (
                                            <InputError
                                                message={
                                                    validationError.id_prodi
                                                }
                                            />
                                        )}
                                    </div>
                                    <div className="flex flex-col w-full">
                                        <TextField
                                            id="keterangan"
                                            name="keterangan"
                                            value={formData.keterangan}
                                            label="Keterangan"
                                            placeholder="Keterangan"
                                            onChange={(e) => {
                                                setFormData({
                                                    ...formData,
                                                    keterangan: e.target.value,
                                                });
                                                setValidationError({
                                                    ...validationError,
                                                    keterangan: null,
                                                });
                                            }}
                                            multiline
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
                                        ></TextField>
                                        {validationError.keterangan && (
                                            <InputError
                                                message={
                                                    validationError.keterangan
                                                }
                                            />
                                        )}
                                    </div>
                                    <div className="flex flex-col w-full">
                                        <TextField
                                            id="quota"
                                            name="quota"
                                            value={formData.quota}
                                            label="Quota"
                                            type="number"
                                            placeholder="Female Quota"
                                            onChange={(e) => {
                                                setFormData({
                                                    ...formData,
                                                    quota: e.target.value,
                                                });
                                                setValidationError({
                                                    ...validationError,
                                                    quota: null,
                                                });
                                            }}
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
                                        ></TextField>
                                        {validationError.quota && (
                                            <InputError
                                                message={validationError.quota}
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
            <DynamicModal
                className="max-w-[700px] m-4"
                isOpen={modalA.isOpen}
                onClose={modalA.closeModal}
            >
                <EditLowonganPPL
                    closeModal={modalA.closeModal}
                    onFinish={(res) => {
                        setResponseData(res);
                        getData();
                    }}
                    idLowongan={selectedLowongan}
                    prodi={listProdi}
                />
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

export default LowonganPPLTable;
