import Badge from "@/Components/Badge";
import Button from "@/Components/Button";
import DynamicModal from "@/Components/DynamicModal";
import Input from "@/Components/InputField";
import Label from "@/Components/Label";
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
import ConfrmModal from "@/Components/ConfrmModal";
import DynamicModalConf from "@/Components/DynamicModalConf";

const GelombangTable = () => {
    const [loading, setLoading] = useState(false);
    const { openModal, closeModal, isOpen } = useModal();
    const { openModalConf, closeModalConf, isOpenConf } =
        useConfirmationModal();

    const [currentPage, setCurrentPage] = useState(1);
    const [entriesPerPage, setEntriesPerPage] = useState(5);
    const [totalEntries, setTotalEntries] = useState(100);
    const [totalPages, setTotalPages] = useState(10);
    const [validationError, setValidationError] = useState(null);
    const [searchKey, setSearchKey] = useState(null);
    const [searchInput, setSearchInput] = useState(null);
    const [selectedGelombang, setSelectedGelombang] = useState(null);

    const [data, setData] = useState([]);
    const [sortKey, setSortKey] = useState(null);
    const [sortDir, setSortDir] = useState(null);

    const [formData, setFormData] = useState({
        name: "",
        tahun: "",
        active: 1,
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

    useEffect(() => {
        const totalCount = data?.total ?? 0;
        const totalPageCount = data?.last_page ?? 0;

        setTotalEntries(totalCount);
        setTotalPages(totalPageCount);
    }, [data]);
    const handleSave = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const payload = new FormData();
            payload.append("name", formData.name);
            payload.append("tahun", formData.tahun);
            payload.append("active", formData.active);

            await axios.post(
                `${config.base_url}/api/superadmin/data/gelombang`,
                payload,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );
            setLoading(false);

            await getGelombangData();
            closeModal();
        } catch (error) {
            if (error.response?.status === 422) {
                console.log("heello world");
                setValidationError(error.response.data.errors);
            }
            setLoading(false);
            console.error("Failed to save:", error);
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

    const handleDelete= (id)=> {
        openModalConf();
        setSelectedGelombang(id)
        


        
    }

    const deleteGelombang = async (id)=> {
        try{
            setLoading(true);
            const response = await axios.delete(
                `${config.base_url}/api/superadmin/data/gelombang/${id}`,
                {
                    withCredentials: true,
                    headers: {
                        Accept: "application/json",
                    },
                }
            );

        }catch(error){
            setLoading(false);

        }finally{
            setSelectedGelombang(null);
            getGelombangData();

        }
    }

    const getGelombangData = async () => {
        try {
            setLoading(true);

            const response = await axios.get(
                `${config.base_url}/api/superadmin/data/gelombang`,
                {
                    withCredentials: true,
                    headers: {
                        Accept: "application/json",
                    },
                    params: {
                        page: currentPage,
                        perPage: entriesPerPage,
                        sortBy: sortKey ?? "id", // default to id if no sort
                        sortOrder: (sortDir ?? "asc").toUpperCase(),
                        search: searchKey,
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
    useEffect(() => {
        getGelombangData();
    }, [currentPage, entriesPerPage, sortKey, sortDir, searchKey]);

    useEffect(() => {
        getGelombangData();
    }, []);
    const handleInputChange = (e) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };
    const handleStatusChange = (val) => {
        setFormData((prev) => ({
            ...prev,
            active: val,
        }));
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
    const handleDeleteGelombang = (id)=> {
        closeModalConf();
        deleteGelombang(selectedGelombang);
    }
    const getStatus = (currentStatus) => {
        if (currentStatus == 1) {
            return <Badge color="success">Active</Badge>;
        }
        return <Badge color="error">InActive</Badge>;
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
        <div className="overflow-scroll rounded-xl border border-gray-200 bg-white ">
            <div className="flex flex-col ">
                <div className="p-5 flex flex-col md:flex-row gap-y-3  justify-between">
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

                <table className="min-w-full">
                    <thead className="border-b border-gray-100 dark:border-white/[0.05]">
                        <tr>
                            <th className="px-5 py-3 text-xs font-medium text-gray-500">
                                No
                            </th>
                            <th
                                className="px-5 py-3 text-xs cursor-pointer font-medium text-gray-500"
                                onClick={() => sortBy("name")}
                            >
                                Nama {sortIcon("name")}
                            </th>
                            <th
                                className="px-5 py-3 text-xs cursor-pointer font-medium text-gray-500"
                                onClick={() => sortBy("tahun")}
                            >
                                Tahun {sortIcon("tahun")}
                            </th>
                            <th
                                className="px-5 cursor-pointer py-3 text-xs font-medium text-gray-500"
                                onClick={() => sortBy("active")}
                            >
                                Status {sortIcon("active")}
                            </th>
                            <th className="px-5 py-3 text-xs font-medium text-gray-500">
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
                                          {(currentPage - 1) * entriesPerPage +
                                              idx +
                                              1}
                                      </td>
                                      <td className="px-4 py-3">{row.name}</td>
                                      <td className="px-4 py-3">{row.tahun}</td>
                                      <td className="px-4 py-3">
                                          {getStatus(row.active)}
                                      </td>
                                      <td className="px-4 py-3">
                                          <div className="flex gap-x-2 items-center justify-center">
                                              <button
                                                  onClick={()=>handleDelete(row.id)}
                                                  className="text-gray-500 cursor-pointer hover:text-error-500"
                                              >
                                                  <FaRegTrashCan />
                                              </button>
                                              <button className="text-gray-500 cursor-pointer hover:text-gray-800">
                                                  <TfiPencil />
                                              </button>
                                          </div>
                                      </td>
                                  </tr>
                              ))}
                    </tbody>
                </table>

                <div className="p-5 flex flex-col md:flex-row gap-y-3 justify-between">
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
                            Edit Coin Information
                        </h4>
                    </div>
                    <form className="flex flex-col" onSubmit={handleSave}>
                        <div className="custom-scrollbar h-[450px] overflow-y-auto px-2 pb-3">
                            <div className="mt-7">
                                <h5 className="mb-5 text-lg font-medium text-gray-800 dark:text-white/90 lg:mb-6">
                                    Coin Information
                                </h5>

                                <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                                    <div className="col-span-2 lg:col-span-1">
                                        <Label>Name</Label>
                                        <Input
                                            type="text"
                                            name="name"
                                            error={!!validationError?.name}
                                            hint={validationError?.name[0]}
                                            value={formData.name}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <div className="col-span-2 lg:col-span-1">
                                        <Label>Tahun</Label>
                                        <Input
                                            type="text"
                                            name="tahun"
                                            error={!!validationError?.tahun}
                                            hint={validationError?.tahun[0]}
                                            value={formData.tahun}
                                            onChange={handleInputChange}
                                        />
                                    </div>

                                    <div className="col-span-2 lg:col-span-1">
                                        <Label>Status</Label>
                                        <Select
                                            defaultValue={formData.active}
                                            onChange={handleStatusChange}
                                            showPlaceHolder={false}
                                            options={[
                                                {
                                                    value: 1,
                                                    label: "Active",
                                                },
                                                {
                                                    value: 0,
                                                    label: "Inactive",
                                                },
                                            ]}
                                        />
                                    </div>
                                    {/* <div className="col-span-2">
                                        <Label>Logo file</Label>
                                        <FileInput
                                            onChange={handleFileChange}
                                        />
                                    </div> */}
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
                                onClick={handleDeleteGelombang}
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

export default GelombangTable;
