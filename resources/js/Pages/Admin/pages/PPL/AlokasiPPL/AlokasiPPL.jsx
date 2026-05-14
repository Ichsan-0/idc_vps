import DropdownMenu from "@/Components/AdminNew/DropDownMenu";
import { config } from "@/config/config";
import { sampleColumns, sampleData } from "@/config/data ";
import AdminLayout from "@/Layouts/Admin/AdminLayout";
import { Link } from "@inertiajs/react";
import axios from "axios";
import { useRef } from "react";
import { useState, useEffect } from "react";
import { FiEdit3 } from "react-icons/fi";
import { IoReload } from "react-icons/io5";
import { CgTrash } from "react-icons/cg";


const AlokasiPPL = ({}) => {
    const [columns, setColumns] = useState([]);
    const [data, setData] = useState([]);
    const [editingCell, setEditingCell] = useState(null);
    const [hasChanges, setHasChanges] = useState(false);
    const [originalData, setOriginalData] = useState([]);
    const [loading, setLoading] = useState(null);
    const inputRef = useRef(null);
    const [alocationData, setAlocationData] = useState([]);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (editingCell && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [editingCell]);

    const calculateRowTotal = (row, totalColumn) => {
        const numericColumns = columns.filter(
            (col) =>
                col.type === "number" &&
                col.key !== "no" &&
                col.key !== totalColumn
        );

        return numericColumns.reduce((sum, col) => {
            const value = row[col.key]?.value;
            return (
                sum +
                (typeof value === "number"
                    ? value
                    : value
                    ? parseInt(value.toString()) || 0
                    : 0)
            );
        }, 0);
    };

    const handleCellClick = (rowIndex, columnKey, currentValue) => {
        console.log("rowIndex", rowIndex);
        console.log("key", columnKey);
        console.log("currentValue", currentValue);

        const column = alocationData?.coloumns?.find(
            (col) => col.key === columnKey
        );
        if (!column?.editable) return;

        setEditingCell({
            rowIndex,
            columnKey,
            value: currentValue,
        });
    };

    const handleCellChange = (value) => {
        if (editingCell) {
            const column = alocationData?.coloumns?.find(
                (col) => col.key === editingCell.columnKey
            );
            const processedValue =
                column?.type === "number"
                    ? value === ""
                        ? ""
                        : parseFloat(value) || 0
                    : value;

            setEditingCell({
                ...editingCell,
                value: processedValue,
            });
        }
    };

    const handleCellBlur = () => {
        if (editingCell) {
            setData((prevData) => {
                const newData = [...prevData];
                newData[editingCell.rowIndex] = {
                    ...newData[editingCell.rowIndex],
                    [editingCell.columnKey]: {
                        ...newData[editingCell.rowIndex][editingCell.columnKey],
                        value: editingCell.value,
                    },
                };

                // Recalculate totals if needed
                const totalColumn = alocationData?.coloumns?.find(
                    (col) => col.key === "jlh"
                );
                if (totalColumn) {
                    newData[editingCell.rowIndex][totalColumn.key] = {
                        ...newData[editingCell.rowIndex][totalColumn.key],
                        value: calculateRowTotal(
                            newData[editingCell.rowIndex],
                            totalColumn.key
                        ),
                    };
                }

                return newData;
            });
            setEditingCell(null);
        }
    };
    const handleKeyPress = (e) => {
        if (e.key === "Enter" || e.key === "Tab") {
            e.preventDefault();
            handleCellBlur();
        } else if (e.key === "Escape") {
            setEditingCell(null);
        }
    };

    const saveAllChanges = async () => {
        setIsSaving(true);

        try {
            const payload = {
                columns: columns,
                data: data,
            };
            const response = await axios.patch(`${config.base_url}/api/admin/ppl/lowongan/bulk`,payload);

            

            console.log("Saving all data:", payload);

            setOriginalData([...data]);
            setHasChanges(false);

            alert("All changes saved successfully!");
        } catch (error) {
            console.error("Error saving data:", error);
            alert("Error saving data. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    const getDataAlocation = async () => {
        try {
            setLoading(true);
            const response = await axios.get(
                `${config.base_url}/api/admin/ppl/alocation`
            );
            console.log(response.data)
            setAlocationData(response.data);
            setOriginalData(response?.data?.data?.sekolah);
            setData(response?.data?.data?.sekolah);
            setColumns(response?.data?.data?.coloumns);
            // console.log("sekolah :", response?.data?.data?.sekolah);
        } catch (error) {
            setLoading(false);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        getDataAlocation();
    }, []);
    const renderSkeletonRow = (index) => (
        <tr key={`skeleton-${index}`} className="animate-pulse bg-white">
            {columns.map((col, i) => (
                <td
                    key={i}
                    className="px-3 py-2 border-r border-gray-200 last:border-r-0"
                >
                    <div className="h-8 bg-gray-300 rounded w-full"></div>
                </td>
            ))}
            <td className="px-3 py-2 text-center border-r border-gray-200 w-16">
                <div className="h-8 bg-gray-300 rounded w-4 mx-auto"></div>
            </td>
        </tr>
    );

    const bulkGenerateBulkLowonganPPL = async () => {
        try {
            setLoading(true);
            const response = await axios.post(
                `${config.base_url}/api/admin/ppl/lowongan/bulk`
            );
        } catch (error) {
            setLoading(false);
        } finally {
            getDataAlocation();
        }
    };

    const bulkDeleteLowonganPPL = async () => {
        try {
            setLoading(true);
            const response = await axios.delete(
                `${config.base_url}/api/admin/ppl/lowongan/bulk`
            );
        } catch (error) {
            setLoading(false);
        } finally {
            getDataAlocation();
        }
    };

    const renderCell = (row, column, rowIndex) => {
        const cellData = row?.[column.key];
        const value = cellData?.value || "";
        const isEditing =
            editingCell?.rowIndex === rowIndex &&
            editingCell?.columnKey === column.key;

        if (isEditing) {
            return (
                <input
                    ref={inputRef}
                    type={column.type === "number" ? "number" : "text"}
                    value={editingCell.value}
                    onChange={(e) => handleCellChange(e.target.value)}
                    onBlur={handleCellBlur}
                    onKeyDown={handleKeyPress}
                    className="w-full px-2 py-1 text-sm border border-blue-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-blue-50"
                    // style={{ minWidth: "100%" }}
                />
            );
        }
        return (
            <div
                className={`group flex items-center justify-between cursor-pointer px-2 py-2 rounded hover:bg-blue-50 transition-colors min-h-[32px] ${
                    !column.editable ? "cursor-default bg-gray-50" : ""
                }`}
                onClick={() => handleCellClick(rowIndex, column.key, value)}
            >
                <span
                    className={`text-sm ${
                        column.key === "nama_sekolah"
                            ? "text-left"
                            : "text-center"
                    } ${!column.editable ? "font-medium text-gray-600" : ""}`}
                >
                    {value.toString()}
                </span>
                {column.editable && (
                    <FiEdit3
                        size={12}
                        className="opacity-0 group-hover:opacity-50 text-gray-400 ml-1"
                    />
                )}
            </div>
        );
    };

    const deleteLowongan = () => {
        try{

        }catch(error){

        }finally{
            
        }
    }
    return (
        <AdminLayout className="main flex" title="Alokasi  PPL">
            <div className="flex w-full flex-col">
                <div className=" bg-white p-4 rounded-xl border border-gray-200">
                    <div className="max-w-full mx-auto">
                        <div className="bg-white rounded-lg  overflow-hidden">
                            {/* Header */}
                            <div className=" px-6 py-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex flex-row gap-3 justify-end items-center w-full">
                                        <button
                                            onClick={() => getDataAlocation()}
                                            className="px-2 hover:bg-gray-200 text-xl py-1 rounded-md text-gray-400 hover:text-gray-600"
                                        >
                                            <IoReload />
                                        </button>

                                        <DropdownMenu>
                                            {({ closeDropdown }) => (
                                                <>
                                                    <li>
                                                        <button
                                                            onClick={() => {
                                                                bulkGenerateBulkLowonganPPL();
                                                                closeDropdown();
                                                            }}
                                                            className="flex w-full items-center px-1 text-gray-600 gap-3.5 text-sm  duration-300 ease-in-out hover:text-primary lg:text-base"
                                                        >
                                                            Bulk Create
                                                        </button>
                                                    </li>
                                                    <li>
                                                        <button
                                                            // to="/profile"
                                                            onClick={()=> {
                                                                saveAllChanges();
                                                                closeDropdown();
                                                            }}
                                                            className="flex w-full text-gray-600 items-center px-1 gap-3.5 text-sm duration-300 ease-in-out hover:text-primary lg:text-base"
                                                        >
                                                            Save Changes
                                                        </button>
                                                    </li>
                                                    <li>
                                                        <button
                                                            // to="/profile"
                                                            onClick={()=>{
                                                                bulkDeleteLowonganPPL();
                                                                closeDropdown();
                                                            }}
                                                            className="flex w-full items-center gap-3.5 bg-error-100 px-1 rounded-md text-error-600 py-2 text-sm  duration-300 ease-in-out hover:bg-error-200 hover:text-error-600 lg:text-base"
                                                        >
                                                            Bulk delete
                                                        </button>
                                                    </li>
                                                </>
                                            )}
                                        </DropdownMenu>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        {hasChanges && (
                                            <>
                                                <div className="flex items-center space-x-1 text-yellow-200 text-sm">
                                                    <AlertCircle size={14} />
                                                    <span>Unsaved changes</span>
                                                </div>

                                                <button
                                                    onClick={saveAllChanges}
                                                    disabled={isSaving}
                                                    className="flex items-center space-x-1 bg-green-500 hover:bg-green-600 disabled:bg-green-400 text-white px-4 py-1.5 rounded text-sm transition-colors font-medium"
                                                >
                                                    <Save size={14} />
                                                    <span>
                                                        {isSaving
                                                            ? "Saving..."
                                                            : "Save All"}
                                                    </span>
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Table Container with Scrolling */}
                            <div className="relative">
                                <div className="overflow-auto max-h-[600px] border border-gray-200">
                                    <table className="w-full border-collapse bg-white">
                                        {/* Sticky Header */}
                                        <thead className="sticky top-0 z-10 bg-gray-100">
                                            <tr>
                                                {columns?.map((column) => (
                                                    <th
                                                        key={column.key}
                                                        className="px-3 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-b-2 border-gray-300 border-r border-gray-200 last:border-r-0 bg-gray-100"
                                                        style={{
                                                            width: column.width
                                                                ? `${column.width}px`
                                                                : "auto",
                                                            minWidth:
                                                                column.width
                                                                    ? `${column.width}px`
                                                                    : "auto",
                                                        }}
                                                    >
                                                        {column.label}
                                                    </th>
                                                ))}
                                                <th className="px-3 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider border-b-2 border-gray-300 bg-gray-100 w-16">
                                                    Action
                                                </th>
                                            </tr>
                                        </thead>

                                        {/* Table Body */}
                                        <tbody>
                                            {loading
                                                ? [...Array(15)].map((_, i) =>
                                                      renderSkeletonRow(i)
                                                  ) // 5 baris skeleton
                                                : data?.map((row, rowIndex) => (
                                                      <tr
                                                          key={rowIndex}
                                                          className={`border-b border-gray-200 hover:bg-blue-50 transition-colors ${
                                                              rowIndex % 2 === 0
                                                                  ? "bg-white"
                                                                  : "bg-gray-50"
                                                          }`}
                                                      >
                                                          {columns.map(
                                                              (column) => (
                                                                  <td
                                                                      key={
                                                                          column.key
                                                                      }
                                                                      className="border-r border-gray-200 last:border-r-0 p-0"
                                                                      style={{
                                                                          width: column.width
                                                                              ? `${column.width}px`
                                                                              : "auto",
                                                                          minWidth:
                                                                              column.width
                                                                                  ? `${column.width}px`
                                                                                  : "auto",
                                                                      }}
                                                                  >
                                                                      {renderCell(
                                                                          row,
                                                                          column,
                                                                          rowIndex
                                                                      )}
                                                                  </td>
                                                              )
                                                          )}
                                                          <td className="px-3 py-2 text-center border-r border-gray-200 w-16">
                                                              <button
                                                                  className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                                                                  title="Delete row"
                                                              >
                                                                  <CgTrash
                                                                      size={18}
                                                                  />
                                                              </button>
                                                          </td>
                                                      </tr>
                                                  ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AlokasiPPL;
