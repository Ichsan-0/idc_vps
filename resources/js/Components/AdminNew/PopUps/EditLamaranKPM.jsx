import Button from "@/Components/Button";
import LoaderOnButton from "@/Components/LoaderOnButtn";
import { config } from "@/config/config";
import {
    Autocomplete,
    CircularProgress,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    TextField,
} from "@mui/material";
import axios from "axios";
import React from "react";
import { useEffect } from "react";
import { useRef } from "react";
import { useState } from "react";

const EditLamaranKPM = ({ closeModal, idLamaran, tempatKPM = [] }) => {
    const [open, setOpen] = useState(false);
    const [formData, setFormData] = useState({
        username_mahasiswa: "",
        keterangan: "",
        status: "",
        id_desa: "",
    });

    const [loading, setLoading] = useState(false);
    const [allStudent, setAllStudent] = useState([]);
    const [studentSearchQuery, setStudentSearchQueary] = useState(null);
    const debounceRef = useRef(null);
    const [selectedTempatKPM, setSelectedTempatKPM] = useState(null);
    const [selectedStudent, setSelectedStudent] = useState(null);
    // const [tempatKPM, setTempatKPM] = useState([]);

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const payload = new FormData();
            payload.append("username_mahasiswa", formData.username_mahasiswa);
            payload.append("id_desa", formData.id_desa);
            payload.append("keterangan", formData.keterangan);
            payload.append("status", formData.status);
            payload.append("id_lamaran",idLamaran);


            await axios.post(`${config.base_url}/api/kpm/lamaran?_method=PATCH`, payload, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            setLoading(false);

            await getData();
            closeModal();
        } catch (error) {
            if (error.response?.status === 422) {
                setValidationError(error.response.data.errors);
            }
            setLoading(false);
        }finally{
            setLoading(false);
            closeModal();

        }
    };

    

    const getLamaranData = async()=>{
        try{
            setLoading(true);
            const response = await axios.get(`${config.base_url}/api/kpm/lamaran?x=${idLamaran}`)
            setStudentSearchQueary(response.data?.data?.nama_mahasiswa);
            let lamaran = response?.data?.data;
            setFormData({
                username_mahasiswa : lamaran.username_mahasiswa,
                id_desa : lamaran?.id_tempat_kpm,
                status : lamaran?.status,
                keterangan :lamaran?.keterangan

            });
            let tempatKpm = tempatKPM.find((item)=>item.id == lamaran.id_tempat_kpm);

            setSelectedTempatKPM(tempatKpm);

        }catch(e){
            setLoading(false);
            console.error(e);
        }finally{
            setLoading(false);
        }
    }

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

    useEffect(()=>{
            console.log('mahasiswa : ');

        if(allStudent.length > 0){
            let mahasiswa = allStudent.find((item)=> item.username == formData.username_mahasiswa);
            console.log('mahasiswa : ', mahasiswa);

            setSelectedStudent(mahasiswa);
        }
        
    }, [allStudent]);

    useEffect(() => {
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        debounceRef.current = setTimeout(() => {
            fetchStudent();
        }, 500);
    }, [studentSearchQuery]);

    useEffect(()=>{
        getLamaranData();
    }, []);

    return (
        <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
            <div className="px-2 pr-14">
                <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
                    Edit Lamaran
                </h4>
            </div>
            <form className="flex flex-col" onSubmit={handleSave}>
                <div className="custom-scrollbar h-[450px] overflow-y-auto px-2 pb-3">
                    <div className="mt-7">
                        <h5 className="mb-5 text-lg font-medium text-gray-800 dark:text-white/90 lg:mb-6">
                            Informasi Lamaran {idLamaran}
                        </h5>
                        {loading ? (
                            <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                                <Skeleton className="h-[55px]" />
                                <Skeleton className="h-[55px]" />
                                <Skeleton className="h-[55px]" />
                                <Skeleton className="h-[55px]" />
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                                <div className="flex flex-col w-full">
                                    <Autocomplete
                                        open={open}
                                        value={selectedStudent}
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
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label="Student"
                                                sx={{
                                                    "& .MuiOutlinedInput-root.Mui-focused":
                                                        {
                                                            outline: "none",
                                                            boxShadow: "none",
                                                        },
                                                    "& .MuiInputBase-input:focus":
                                                        {
                                                            outline: "none",
                                                            boxShadow: "none",
                                                        },
                                                }}
                                                InputProps={{
                                                    ...params.InputProps,
                                                    endAdornment: (
                                                        <>
                                                            {loading ? (
                                                                <CircularProgress
                                                                    size={20}
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
                                        getOptionLabel={(option) => option.name}
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
                                                            boxShadow: "none",
                                                        },
                                                    "& .MuiInputBase-input:focus":
                                                        {
                                                            outline: "none",
                                                            boxShadow: "none",
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
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
                    <Button size="sm" variant="outline" onClick={closeModal}>
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
    );
};

export default EditLamaranKPM;

const Skeleton = ({ className = "" }) => (
    <div
        className={`animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700 ${className}`}
    ></div>
);
