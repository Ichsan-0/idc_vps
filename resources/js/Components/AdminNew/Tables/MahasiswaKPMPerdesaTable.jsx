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
import { desa, kabupaten, kecamatan } from "daftar-wilayah-indonesia";
import {
    Autocomplete,
    CircularProgress,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    TextField,
} from "@mui/material";
import { Link, usePage } from "@inertiajs/react";
import { useRef } from "react";
import SelectCustom from "@/Components/Select";
import EditLamaranKPM from "../PopUps/EditLamaranKPM";


const MahasiswaKPMPerdesaTable = () => {
    const [loading, setLoading] = useState(false);
    const { openModal, closeModal, isOpen } = useModal();
    const { openModalConf, closeModalConf, isOpenConf } =
        useConfirmationModal();

    const modalA = useModal();

    const { props } = usePage();
    const x = props.id;

    const [currentPage, setCurrentPage] = useState(1);
    const [entriesPerPage, setEntriesPerPage] = useState(5);
    const [totalEntries, setTotalEntries] = useState(null);
    const [totalPages, setTotalPages] = useState(null);
    const [validationError, setValidationError] = useState(null);
    const [searchKey, setSearchKey] = useState(null);
    const [searchInput, setSearchInput] = useState(null);
    const [selectedData, setSelectedData] = useState(null);
    const [selectedPelamar, setSelectedPelamar] = useState(null);

    const [data, setData] = useState([]);
    const [sortKey, setSortKey] = useState(null);
    const [sortDir, setSortDir] = useState(null);
    const [studentName, setStudentName] = useState(null);
    const [studentNim, setStudentNim] = useState(null);
    const [selectedTempatKPM, setSelectedTempatKPM] = useState(null);
    const [tempatKPM, setTempatKPM] = useState(null || []);
    const [daftarMahasiswa, setDaftarMahasiswa] = useState([]);
    const [selectedStudnet, setSelectedStudent] = useState(null);
    const [allStudent, setAllStudent] = useState([]);
    const [studentSearchQuery, setStudentSearchQueary] = useState(null);
    const [open, setOpen] = useState(false);

    const debounceRef = useRef(null);

    const [formData, setFormData] = useState({
        username_mahasiswa: "",
        keterangan: "",
        status: "",
        id_desa: "",
    });

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

    useEffect(()=>{
        const currentTempatKPM = tempatKPM.find((item) => item.id == x);
        setSelectedTempatKPM(currentTempatKPM || null);
        setFormData({...formData, id_desa:currentTempatKPM?.id});
        console.log('test : ', currentTempatKPM);

    }, [tempatKPM]);

    useEffect(() => {
        const totalCount = daftarMahasiswa?.total ?? 0;
        const totalPageCount = daftarMahasiswa?.last_page ?? 0;

        setTotalEntries(totalCount);
        setTotalPages(totalPageCount);
    }, [daftarMahasiswa]);

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const payload = new FormData();
            payload.append("username_mahasiswa", formData.username_mahasiswa);
            payload.append("id_desa", formData.id_desa);
            payload.append("keterangan", formData.keterangan);
            payload.append("status", formData.status);

            await axios.post(`${config.base_url}/api/kpm/lamaran`, payload, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            setLoading(false);

            await getMahasiswa();
            closeModal();
        } catch (error) {
            if (error.response?.status === 422) {
                setValidationError(error.response.data.errors);
            }
            setLoading(false);
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
        console.log('conf delete');
        openModalConf();
        setSelectedData(id);
    };

    const deleteData = async (id) => {
        try {
            setLoading(true);
            const response = await axios.delete(
                `${config.base_url}/api/kpm/lamaran`,
                {
                    withCredentials: true,
                    headers: {
                        Accept: "application/json",
                    },
                    params:{
                        idLamaran : selectedData
                    }
                }
            );
        } catch (error) {
            setLoading(false);
        } finally {
            setSelectedData(null);
            getMahasiswa();
        }
    };

    const getTempatKPM = async () => {
        try {
            const res = await axios.get(`${config.base_url}/api/tempatkpm`);
            setTempatKPM(res.data?.data || []);
        } catch (e) {
            console.log(e);
        }
    };

    const getMahasiswa = async () => {
        try {
            setLoading(true);

            const response = await axios.get(
                `${config.base_url}/api/tempatkpm/mahasiswa`,
                {
                    params: {
                        id_tempat_kpm: x,
                        page: currentPage,
                        entries_per_page: entriesPerPage,
                        sort_key: sortKey,
                        sort_dir: sortDir,
                        search_key: searchKey,
                    },
                }
            );
            setDaftarMahasiswa(response.data.data);
        } catch (error) {
            setLoading(false);
        } finally {
            setLoading(false);
        }
    };

    const fetchStudent = async () => {
        if (!studentSearchQuery) {
            setAllStudent([]);
            return;
        }

        setLoading(true);
        try {
            const response = await axios.get(
                `${config.base_url}/api/admin/student?search=${studentSearchQuery}`
            );
            setAllStudent(response.data.data || []);
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        debounceRef.current = setTimeout(() => {
            fetchStudent();
        }, 500);
    }, [studentSearchQuery]);

    useEffect(() => {
        // if (daftarMahasiswa?.data?.length > 0) {
        getMahasiswa();
        // }
    }, [currentPage, entriesPerPage, sortKey, sortDir, searchKey]);

    useEffect(() => {
        getTempatKPM();
        getMahasiswa();
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

    useEffect(() => {
        console.log("daftar mahasiswa :", daftarMahasiswa);
    }, [daftarMahasiswa]);

    return (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white ">
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
                                    Nama {sortIcon("name")}
                                </th>
                                <th
                                    rowSpan={2}
                                    className="px-5 py-3 min-w-50 text-xs font-medium text-gray-500"
                                    onClick={() => sortBy("nim")}
                                >
                                    NIM {sortIcon("nim")}
                                </th>
                                <th
                                    rowSpan={2}
                                    className="px-5 py-3 min-w-50 text-xs font-medium text-gray-500"
                                    onClick={() => sortBy("prodi")}
                                >
                                    Prodi {sortIcon("prodi")}
                                </th>
                                <th
                                    rowSpan={2}
                                    className="px-5 py-3 min-w-50 text-xs font-medium text-gray-500"
                                    onClick={() => sortBy("jenisKelamin")}
                                >
                                    Jenis Kelamin {sortIcon("jenis_kelamin")}
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
                                : daftarMahasiswa?.data?.map((row, idx) => (
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
                                              {row?.prodi}
                                          </td>
                                          <td className="px-4 py-3">
                                              {row?.jenis_kelamin}
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
                                                          setSelectedPelamar(
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
                            Tambah Lamaran
                        </h4>
                    </div>
                    <form className="flex flex-col" onSubmit={handleSave}>
                        <div className="custom-scrollbar h-[450px] overflow-y-auto px-2 pb-3">
                            <div className="mt-7">
                                <h5 className="mb-5 text-lg font-medium text-gray-800 dark:text-white/90 lg:mb-6">
                                    Informasi Lamaran
                                </h5>

                                <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                                    <div className="flex flex-col w-full">
                                        <Autocomplete
                                            open={open}
                                            onOpen={() => setOpen(true)}
                                            onClose={() => setOpen(false)}
                                            options={allStudent}
                                            getOptionLabel={(option) =>
                                                option.name || ""
                                            } // adapt for your API
                                            loading={loading}
                                            onInputChange={(event, value) =>
                                                setStudentSearchQueary(value)
                                            }
                                            onChange={(event, value) => {
                                                setFormData({
                                                    ...formData,
                                                    username_mahasiswa:
                                                        value.username,
                                                });
                                            }}
                                            renderOption={(
                                                    props,
                                                    option
                                                ) => (
                                                    <li
                                                        {...props}
                                                        key={option?.username}
                                                    >
                                                        <div>
                                                            <p>
                                                                {option?.name}
                                                            </p>
                                                            <p>
                                                                NIM:{" "}
                                                                {
                                                                    option?.username
                                                                }
                                                            </p>
                                                        </div>
                                                    </li>
                                                )}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    label="Student"
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
                                                    InputProps={{
                                                        ...params.InputProps,
                                                        endAdornment: (
                                                            <>
                                                                {loading ? (
                                                                    <CircularProgress
                                                                        size={
                                                                            20
                                                                        }
                                                                    />
                                                                ) : null}
                                                                {
                                                                    params
                                                                        .InputProps
                                                                        .endAdornment
                                                                }
                                                            </>
                                                        ),
                                                    }}
                                                />
                                            )}
                                        />

                                        {/* {errors.regency && (
                                            <InputError
                                                message={errors.regency}
                                            />
                                        )} */}
                                    </div>
                                    <div className="flex flex-col w-full">
                                        <Autocomplete
                                            id="tempat-kpm"
                                            name="tempat-kpm"
                                            sx={{ width: "100%" }}
                                            value={selectedTempatKPM}
                                            options={tempatKPM}
                                            getOptionLabel={(option) =>
                                                option.name
                                            }
                                            onChange={(e, value) => {
                                                setSelectedTempatKPM(value);
                                                setFormData({
                                                    ...formData,
                                                    id_desa: value.id,
                                                });
                                            }}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    label="Desa"
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
                                        {/* {errors.regency && (
                                            <InputError
                                                message={errors.regency}
                                            />
                                        )} */}
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
                                    </div>
                                    <div className="flex flex-col w-full">
                                        <FormControl fullWidth>
                                            <InputLabel id="status">
                                                Status
                                            </InputLabel>
                                            <Select
                                                labelId="status"
                                                id="status"
                                                value={formData.status}
                                                label="Status"
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        status: e.target.value,
                                                    })
                                                }
                                            >
                                                <MenuItem value={"submitted"}>
                                                    Direview
                                                </MenuItem>
                                                <MenuItem value={"accepted"}>
                                                    Diterima
                                                </MenuItem>
                                                <MenuItem value={"rejected"}>
                                                    Ditolak
                                                </MenuItem>
                                            </Select>
                                        </FormControl>
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
                <EditLamaranKPM closeModal={modalA.closeModal} idLamaran={selectedPelamar} tempatKPM={tempatKPM}/>
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

export default MahasiswaKPMPerdesaTable;
