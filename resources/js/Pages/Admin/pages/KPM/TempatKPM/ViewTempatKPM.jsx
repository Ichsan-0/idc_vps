import DynamicModal from "@/Components/DynamicModal";
import PageBreadcrumb from "@/Components/PageBreadcrumb";
import { useModal } from "@/Hooks/useModal";
import AdminLayout from "@/Layouts/Admin/AdminLayout";
import { Autocomplete, TextField } from "@mui/material";
import { useState } from "react";
import Button from "@/Components/Button";
import MasterSekolahViewSkeleton from "@/Components/AdminNew/MasterSekolahViewSkeleton";
import axios from "axios";
import { config } from "@/config/config";
import { useEffect } from "react";
import { desa, kabupaten, kecamatan } from "daftar-wilayah-indonesia";
import LoaderOnButton from "@/Components/LoaderOnButtn";
import MahasiswaKPM from "@/Components/AdminNew/TempatKPM/MahasiswaKPM";

export default function ViewDesa({ id }) {
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

    const [dataKabupaten, setDataKabupaten] = useState(kabupaten("11"));
    const [dataKecamatan, setDataKecamatan] = useState([]);
    const [dataDesa, setDataDesa] = useState([]);
    const [loading, setLoading] = useState(false);
    const [name, setName] = useState(null);
    const [selectedDesa, setSelectedDesa] = useState(null);
    const [selectedSuperviosr, setSelectedSupervisor] = useState(null);
    const [dataSupervisor, setDataSupervisor] = useState([]);
    const [gelombangData, setGelombangData] = useState([]);
    const [selectedGelombangData, setSelectedGelombangData] = useState(null);

    const [regency, setRegency] = useState(null);
    const [subDistrict, setSubDistrict] = useState(null);
    const [village, setVillage] = useState(null);
    const { openModal, closeModal, isOpen } = useModal();

    const getData = async () => {
        try {
            setLoading(true);
            const response = await axios.get(
                `${config.base_url}/api/tempatkpm/${id}`
            );

            setFormData(response.data.data);
            setRegency(getKabupaten(response.data?.data?.regency));
            setSubDistrict(
                getKecamatan(
                    response.data?.data?.sub_district,
                    response.data?.data?.regency
                )
            );
            setVillage(
                getDesa(
                    response.data?.data?.village,
                    response.data?.data?.sub_district
                )
            );
            
            
        } catch (error) {
            setLoading(false);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const payload = new FormData();
            payload.append("name", formData.name);
            payload.append("quota_lk", formData.quota_lk);
            payload.append("quota_pr", formData.quota_pr);
            payload.append("qouta", formData.qouta);
            payload.append("username_supervisor", formData.username_supervisor);
            payload.append("id_desa", formData.id_desa);
            payload.append("id_gelombang", formData.id_gelombang);
            payload.append("id_tempat_kpm", id);

            await axios.post(
                `${config.base_url}/api/admin/kpm/lowongan?_method=PATCH`,
                payload,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            getData();
            closeModal();
        } catch (error) {
            if (error.response?.status === 422) {
                console.log("heello world");
                setValidationError(error.response.data.errors);
            }
            setLoading(false);
            console.error("Failed to save:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const fetch = async ()=>{
            await getMasterDesa();
            await getGelombangData();
            await getDataSupervisor();
            await getData();

        }
        fetch();

    }, []);

    const getKabupaten = (kode) => {
        return kabupaten("11").find((item) => item.kode == kode);
    };

    const getKecamatan = (kecamatanKode, kabupatenKode) => {
        return kecamatan(kabupatenKode).find(
            (item) => item.kode == kecamatanKode
        );
    };
    const getDesa = (desaKode, kecamatanKode) => {
        return desa(kecamatanKode)?.find((item) => item.kode == desaKode);
    };

   
    const getMasterDesa = async () => {
        try {
            const response = await axios.get(
                `${config.base_url}/api/admin/kpm/desa`
            );
            setDataDesa(response?.data?.data);
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

    const getGelombangData = async () => {
        try {
            setLoading(true);

            const response = await axios.get(
                `${config.base_url}/api/gelombang`
            );
            setGelombangData(response.data?.data);
            if (response.data?.data.length > 0) {
               
                setFormData({ ...formData, id_gelombang: gelombang.id });
            }
        } catch (error) {
            console.log(error);
        } 
    };

    useEffect(()=>{
        if(gelombangData.length>0){
            const gelombang = gelombangData.find((item)=>item.id == formData.id_gelombang);
            setSelectedGelombangData(gelombang);
            

        }
        if(dataDesa.length>0){
            const currentDesa = dataDesa.find((item)=> item.id == formData.id_desa);
            setSelectedDesa(currentDesa);


        }
        if(dataSupervisor.length>0){
            const supervisor = dataSupervisor.find((item)=> item.username == formData.username_supervisor);
            setSelectedSupervisor(supervisor);

        }

    }, [gelombangData, dataDesa, dataSupervisor, formData]);

    return (
        <AdminLayout>
            <div className="flex flex-col gap-3">
                <PageBreadcrumb
                    home={"/admin/kpm/tempatkpm"}
                    pageTitle="Tempat KPM"
                />
                <div className="p-5 border border-gray-200 bg-white rounded-2xl dark:border-gray-800 lg:p-6">
                    {loading ? (
                        <MasterSekolahViewSkeleton />
                    ) : (
                        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                            <div>
                                <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
                                    Informasi Tempat KPM
                                </h4>

                                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
                                    <div>
                                        <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                                            Nama Desa
                                        </p>
                                        <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                                            {formData?.nama_desa}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                                            Deskripsi
                                        </p>
                                        <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                                            {formData?.description}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                                            Kabupaten
                                        </p>
                                        <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                                            {
                                                getKabupaten(formData?.regency)
                                                    ?.nama
                                            }
                                        </p>
                                    </div>

                                    <div>
                                        <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                                            Kecamatan
                                        </p>
                                        <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                                            {
                                                getKecamatan(
                                                    formData?.sub_district,
                                                    formData?.regency
                                                )?.nama
                                            }
                                        </p>
                                    </div>

                                    <div>
                                        <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                                            Desa
                                        </p>
                                        <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                                            {
                                                getDesa(
                                                    formData?.village,
                                                    formData?.sub_district
                                                )?.nama
                                            }
                                        </p>
                                    </div>
                                    <div>
                                        <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                                            Nama Supervisor
                                        </p>
                                        <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                                            {formData?.nama_supervisor}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                                            Terisi
                                        </p>
                                        <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                                            {formData?.jumlah_pria} Pria /{" "}
                                            {formData?.jumlah_wanita} Wanita
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={openModal}
                                className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 lg:inline-flex lg:w-auto"
                            >
                                <svg
                                    className="fill-current"
                                    width="18"
                                    height="18"
                                    viewBox="0 0 18 18"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        fillRule="evenodd"
                                        clipRule="evenodd"
                                        d="M15.0911 2.78206C14.2125 1.90338 12.7878 1.90338 11.9092 2.78206L4.57524 10.116C4.26682 10.4244 4.0547 10.8158 3.96468 11.2426L3.31231 14.3352C3.25997 14.5833 3.33653 14.841 3.51583 15.0203C3.69512 15.1996 3.95286 15.2761 4.20096 15.2238L7.29355 14.5714C7.72031 14.4814 8.11172 14.2693 8.42013 13.9609L15.7541 6.62695C16.6327 5.74827 16.6327 4.32365 15.7541 3.44497L15.0911 2.78206ZM12.9698 3.84272C13.2627 3.54982 13.7376 3.54982 14.0305 3.84272L14.6934 4.50563C14.9863 4.79852 14.9863 5.2734 14.6934 5.56629L14.044 6.21573L12.3204 4.49215L12.9698 3.84272ZM11.2597 5.55281L5.6359 11.1766C5.53309 11.2794 5.46238 11.4099 5.43238 11.5522L5.01758 13.5185L6.98394 13.1037C7.1262 13.0737 7.25666 13.003 7.35947 12.9002L12.9833 7.27639L11.2597 5.55281Z"
                                        fill=""
                                    />
                                </svg>
                                Edit
                            </button>
                        </div>
                    )}
                </div>
                <MahasiswaKPM />
                <DynamicModal
                    className="max-w-[700px] m-4"
                    isOpen={isOpen}
                    onClose={closeModal}
                >
                    <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
                        <div className="px-2 pr-14">
                            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
                                Edit Tempat KPM
                            </h4>
                        </div>
                        <form className="flex flex-col" onSubmit={handleSave}>
                            <div className="custom-scrollbar h-[450px] overflow-y-auto px-2 pb-3">
                                <div className="mt-7">
                                    <h5 className="mb-5 text-lg font-medium text-gray-800 dark:text-white/90 lg:mb-6">
                                        Informasi Tempat KPM
                                    </h5>

                                    <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                                        <div className="flex flex-col w-full">
                                            <Autocomplete
                                                id="desa"
                                                name="desa"
                                                sx={{ width: "100%" }}
                                                value={selectedDesa}
                                                options={dataDesa}
                                                getOptionLabel={(option) =>
                                                    option.name
                                                }
                                                onChange={(e, value) => {
                                                    setSelectedDesa(value);
                                                    setFormData({
                                                        ...formData,
                                                        id_desa: value.id,
                                                        name: value.name,
                                                    });
                                                }}
                                                renderInput={(params) => (
                                                    <TextField
                                                        {...params}
                                                        label="Desa"
                                                        sx={{
                                                            "& .MuiOutlinedInput-root.Mui-focused":
                                                                {
                                                                    outline:
                                                                        "none",
                                                                    boxShadow:
                                                                        "none",
                                                                },
                                                            "& .MuiInputBase-input:focus":
                                                                {
                                                                    outline:
                                                                        "none",
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
                                                    setSelectedSupervisor(
                                                        value
                                                    );
                                                    setFormData({
                                                        ...formData,
                                                        username_supervisor:
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
                                                                NIP:{" "}
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
                                                        label="Supervisor"
                                                        sx={{
                                                            "& .MuiOutlinedInput-root.Mui-focused":
                                                                {
                                                                    outline:
                                                                        "none",
                                                                    boxShadow:
                                                                        "none",
                                                                },
                                                            "& .MuiInputBase-input:focus":
                                                                {
                                                                    outline:
                                                                        "none",
                                                                    boxShadow:
                                                                        "none",
                                                                },
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
                                                }}
                                                renderInput={(params) => (
                                                    <TextField
                                                        {...params}
                                                        label="Gelombang"
                                                        sx={{
                                                            "& .MuiOutlinedInput-root.Mui-focused":
                                                                {
                                                                    outline:
                                                                        "none",
                                                                    boxShadow:
                                                                        "none",
                                                                },
                                                            "& .MuiInputBase-input:focus":
                                                                {
                                                                    outline:
                                                                        "none",
                                                                    boxShadow:
                                                                        "none",
                                                                },
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
                                            <TextField
                                                id="Quota"
                                                name="quota"
                                                value={formData.qouta}
                                                label="Quota"
                                                placeholder="Quota"
                                                onChange={(e) => {
                                                    setFormData({
                                                        ...formData,
                                                        qouta: e.target.value,
                                                    });
                                                }}
                                                multiline
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
                                            ></TextField>
                                            {/* {errors.name && (
                                                                        <InputError message={errors.name} />
                                                                    )} */}
                                        </div>
                                        <div className="flex flex-col w-full">
                                            <TextField
                                                id="male-quota"
                                                name="male-quota"
                                                value={formData.quota_lk}
                                                label="Male Quota"
                                                placeholder="Male Quota"
                                                onChange={(e) => {
                                                    setFormData({
                                                        ...formData,
                                                        quota_lk:
                                                            e.target.value,
                                                    });
                                                }}
                                                multiline
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
                                            ></TextField>
                                            {/* {errors.name && (
                                                                        <InputError message={errors.name} />
                                                                    )} */}
                                        </div>
                                        <div className="flex flex-col w-full">
                                            <TextField
                                                id="female-quota"
                                                name="female-quota"
                                                value={formData.quota_pr}
                                                label="Female Quota"
                                                placeholder="Female Quota"
                                                onChange={(e) => {
                                                    setFormData({
                                                        ...formData,
                                                        quota_pr:
                                                            e.target.value,
                                                    });
                                                }}
                                                multiline
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
                                            ></TextField>
                                            {/* {errors.name && (
                                                                        <InputError message={errors.name} />
                                                                    )} */}
                                        </div>
                                        <div className="flex flex-col w-full">
                                            <TextField
                                                id="description"
                                                name="description"
                                                value={formData.description}
                                                label="Description"
                                                placeholder="Description"
                                                onChange={(e) => {
                                                    setFormData({
                                                        ...formData,
                                                        description:
                                                            e.target.value,
                                                    });
                                                }}
                                                multiline
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
                                            ></TextField>
                                        </div>

                                     
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    // startIcon={<PlusIcon />}
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
                                    {loading ? (
                                        <LoaderOnButton />
                                    ) : (
                                        "Save Changes"
                                    )}
                                </Button>
                            </div>
                        </form>
                    </div>
                </DynamicModal>
            </div>
        </AdminLayout>
    );
}
