import InputError from "@/Components/InputError";
import AdminLayout from "@/Layouts/Admin/AdminLayout";
import OperatorSekolahLayout from "@/Layouts/OperatorSekolahLayout";
import { Head, Link, router } from "@inertiajs/react";
import { LaunchOutlined, OpenInBrowser, OpenInFull, ViewAgenda } from "@mui/icons-material";
import {
    Alert,
    AlertTitle,
    Autocomplete,
    Box,
    Breadcrumbs,
    Button,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    styled,
    TextField,
    Typography,
} from "@mui/material";
import axios from "axios";
import { Input } from "postcss";
import React from "react";
import { useEffect } from "react";
import { useState } from "react";
import { IoCloudUploadOutline } from "react-icons/io5";
import { RiAttachment2 } from "react-icons/ri";
import { ThreeDot } from "react-loading-indicators";
const VisuallyHiddenInput = styled("input")({
    clip: "rect(0 0 0 0)",
    clipPath: "inset(50%)",
    height: 1,
    overflow: "hidden",
    position: "absolute",
    bottom: 0,
    left: 0,
    whiteSpace: "nowrap",
    width: 1,
});

function EditKepsekPamong({ base_url, data }) {
    const [dataoPt, setDataopt] = useState(data.id_sekolah);
    const [errors, setErrors] = useState({
        name: null,
        nip: null,
        pangkat_golongan: null,
        nama_bank: null,
        no_rekening: null,
        no_npwp: null,
        dokumen: null,
        jabatan: null,
        nama_di_buku_rekening: null,
        jumlah_mahasiswa_bimbingan: null,
        mahasiswa: null,
    });

    const [responseError, setResponseError] = useState(null);

    const [name, setName] = useState(data?.name);
    const [nip, setNip] = useState(data?.nip);
    const [pangkatGolongan, setPangkatGolongan] = useState(data?.pangkat_dan_golongan);
    const [namaBank, setNamaBank] = useState(data?.nama_bank);
    const [noRekening, setNoRekening] = useState(data?.no_rekening);
    const [noNPWP, setNoNPWP] = useState(data?.no_npwp);
    const [dokumen, setDokumen] = useState(null);
    const [jabatan, setJabatan] = useState(data?.jabatan);
    const [loading, setLoading] = useState(false);
    const [namaDiBukuRek, setNamaDiBukuRek] = useState(data?.nama_di_buku_rekening);
    const [usernameMahasiswa, setUsernameMahasiswa] = useState(null);
    const [dataMahasiswa, setDataMahasiswa] = useState(null);
    const [jumlhMhswBimbingan, setJumlhMhswBimbingan] = useState(0);
    const [mahasiswa, setMahasiwa] = useState(null);

    const handleNameChange = (e) => {
        setName(e.target.value);
        setErrors({ ...errors, name: null });
    };

    const handleNIPChange = (e) => {
        const regex = /^\d{16,}$|^[-]+$/;
        setNip(e.target.value);
        if (!e.target.value.match(regex)) {
            setErrors({
                ...errors,
                nip: "Angka numerik dengan panjang minimal 16 digit atau -",
            });
            return;
        }
        setErrors({
            ...errors,
            nip: null,
        });
    };

    const handlePangkatDanGolongan = (e) => {
        setPangkatGolongan(e.target.value);
        setErrors({ ...errors, pangkat_golongan: null });
    };

    const handleNamaBankChange = (e) => {
        setNamaBank(e.target.value);
        setErrors({ ...errors, nama_bank: null });
    };

    const handleNoRekeningChange = (e) => {
        setNoRekening(e.target.value);
        const regex = /^\d{10,14}$/;
        if (!e.target.value.match(regex)) {
            setErrors({
                ...errors,
                no_rekening: "Berupa angka 14 digit BAS atau 10 digit BSI",
            });
            return;
        }
        setErrors({
            ...errors,
            no_rekening: null,
        });
    };

    const handleNoNPWPChange = (e) => {
        setNoNPWP(e.target.value);
        const regex = /^\d{15,16}$/;
        if (!e.target.value.match(regex)) {
            setErrors({
                ...errors,
                no_npwp: "Berupa angka 15 atau 16 digit",
            });
            return;
        }
        setErrors({
            ...errors,
            no_npwp: null,
        });
    };
    const handleDokumenChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.type !== "application/pdf") {
                setErrors({
                    ...errors,
                    dokumen: "Only PDF Files are allowed",
                });

                return;
            }
            if (file.size > 500 * 1024) {
                setErrors({
                    ...errors,
                    dokumen: "Ukuran file tidak boleh melibihi 200kb",
                });

                return;
            }
            setDokumen(file);
            // setPayload({ ...payload, dokumen: file });
            setErrors({
                ...errors,
                dokumen: null,
            });
        }
    };

    const validate = () => {
        const newErrors = { ...errors }; // Start with the current errors

        if (name === null) {
            newErrors.name = "Nama wajib diisi";
        }
        if (nip === null) {
            newErrors.nip = "NIP wajib diisi";
        }
        if (pangkatGolongan === null) {
            newErrors.pangkat_golongan = "Pangkat & golongan wajib diisi";
        }
        if (namaBank === "") {
            newErrors.nama_bank = "Nama bank wajib diisi";
        }
        if (noRekening === null) {
            newErrors.no_rekening = "No rekening wajib diisi";
        }
        if (noNPWP === null) {
            newErrors.no_npwp = "No NPWP wajib diisi";
        }
        // if (dokumen === null) {
        //     newErrors.dokumen = "Dokumen wajib diupload";
        // }
        if (jabatan === "") newErrors.jabatan = "Jabatan wajib dipilih";

        if (namaDiBukuRek === null) {
            newErrors.nama_di_buku_rekening =
                "Nama di buku rekening wajib diisi";
        }
        // if (usernameMahasiswa === null) {
        //     newErrors.username_mahasiswa = "Mahasiswa wajib dipilih";
        // }
        if (jabatan === "Guru Pamong") {
            if (mahasiswa === null) {
                newErrors.mahasiswa = "Mahasiswa Bimbingan Wajib diisi";
            } else {
                newErrors.mahasiswa = null;
            }
        }

        setErrors(newErrors);

        console.log(newErrors); // Log the updated errors
        return Object.values(newErrors).every((value) => value === null);
    };

    const getMahasiswa = async () => {
        setLoading(true);
        try {
            const response = await axios.get(
                `/api/operator-sekolah/data/mahasiswa?id_sekolah=${data.id_sekolah}`
            );
            setDataMahasiswa(response.data.data);
            
            console.log(response.data.data);
        } catch (err) {
            setResponseError(err.response?.data?.message);
        } finally {
            setLoading(false);
        }
    };
    const submit = async () => {
        if (validate()) {
            setLoading(true);
            console.log("save");

            try {
                const formData = new FormData();
                formData.append("name", name);
                formData.append("id", data?.id);
                formData.append("nip", nip);
                formData.append("jabatan", jabatan);
                formData.append("no_rekening", noRekening);
                formData.append("no_npwp", noNPWP);
                formData.append("pangkat_dan_golongan", pangkatGolongan);
                // formData.append("dokumen", dokumen);
                formData.append("id_sekolah", data?.id_sekolah);
                formData.append("nama_bank", namaBank);
                formData.append("nama_di_buku_rekening", namaDiBukuRek);
                formData.append("username_mahasiswa", mahasiswa?.username);

                const response = await axios.post(
                    `/api/admin/data/kepsek-pamong/edit`,
                    formData,
                    {
                        headers: { "Content-Type": "multipart/form-data" },
                    }
                );
                console.log(response);
                if (response.data.success === true) {
                    router.visit("/admin/data/kepsek-pamong");
                }
            } catch (err) {
                console.log(err);
                
                setResponseError(err);
            } finally {
                setLoading(false);
            }
        } else {
            return;
        }
    };

    useEffect(()=> {
        if(dataMahasiswa !== null && dataMahasiswa.length > 0){
            setMahasiwa(()=>{
                if(data.username_mahasiswa !== null && dataMahasiswa !== null && dataMahasiswa.length > 0){
                    let mahasiswa = dataMahasiswa.find((itm)=> itm.username === data.username_mahasiswa);
                    return mahasiswa;
                }else{
                    return null;
                }
            })
        }
    }, [dataMahasiswa]);

    useEffect(() => {
        getMahasiswa();
    }, []);

    const handleJabatanChange = (e) => {
        setJabatan(e.target.value);
        setErrors({ ...errors, jabatan: null });
    };

    const openDokumen = (link)=>{
        if (link) {
            window.open(
                link,
                "_blank",
                `width=${screen.width * 0.8}, height=${
                    screen.height * 0.6
                }, left=100, top=100`
            );
        }
        
    }

    return (
        <AdminLayout>
            <Head title={data?.name || `Detail`} />
            {loading && (
                <div className="absolute z-10 w-full h-full flex items-center justify-center bg-white/70">
                    <ThreeDot color="#4F61E3" size="medium" />
                </div>
            )}
            <section className="flex flex-col gap-3 p-5 bg-white">
                {responseError && (
                    <Alert severity="error">
                        <AlertTitle>Error</AlertTitle>
                        {responseError}
                    </Alert>
                )}
                <Breadcrumbs aria-label="breadcrumb">
                    <Link underline="hover" color="inherit" href="/admin/data/kepsek-pamong">
                        List
                    </Link>
                    
                    <Typography sx={{ color: "text.primary" }}>
                        Detail
                    </Typography>
                </Breadcrumbs>
                <Alert severity="info">
                    <AlertTitle>Info Pengisian</AlertTitle>
                    <ol class="!list-decimal pl-5 space-y-2">
                        <li>
                            Setelah memasukkan nama silakan pilih jabatan yang
                            sesuai
                        </li>
                        <li>
                            Jika tidak ada NIP atau pangkat & golongan bisa
                            diisi dengan (-)
                        </li>
                        <li>
                            No rekening hanya dapat angka 14 digit BAS atau 10
                            digit BSI
                        </li>
                        <li>
                            Dokumen berupa scan buku rekening dan NPWP dan hanya
                            dapat diupload dengna file PDF dengan ukuran kurang
                            dari 500kb
                        </li>
                    </ol>
                </Alert>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3  p-5 border">
                    <div className="flex flex-col gap-x-3">
                        <TextField
                            fullWidth
                            value={name}
                            label="Nama"
                            onChange={(e) => handleNameChange(e)}
                            sx={{
                                "& .MuiOutlinedInput-root.Mui-focused": {
                                    outline: "none",
                                    boxShadow: "none",
                                },
                                "& .MuiInputBase-input:focus": {
                                    outline: "none",
                                    boxShadow: "none",
                                },
                            }}
                        />

                        {errors.name && <InputError message={errors.name} />}
                    </div>
                    <div className="flex flex-col gap-x-3">
                        <TextField
                            fullWidth
                            value={namaDiBukuRek}
                            label="Nama di buku rekening"
                            onChange={(e) => setNamaDiBukuRek(e.target.value)}
                            sx={{
                                "& .MuiOutlinedInput-root.Mui-focused": {
                                    outline: "none",
                                    boxShadow: "none",
                                },
                                "& .MuiInputBase-input:focus": {
                                    outline: "none",
                                    boxShadow: "none",
                                },
                            }}
                        />

                        {errors.nama_di_buku_rekening && (
                            <InputError
                                message={errors.nama_di_buku_rekening}
                            />
                        )}
                    </div>
                    <div className="flex flex-col ">
                        <TextField
                            fullWidth
                            value={nip}
                            label="NIP"
                            onChange={(e) => handleNIPChange(e)}
                            sx={{
                                "& .MuiOutlinedInput-root.Mui-focused": {
                                    outline: "none",
                                    boxShadow: "none",
                                },
                                "& .MuiInputBase-input:focus": {
                                    outline: "none",
                                    boxShadow: "none",
                                },
                            }}
                        />
                        {errors.nip && <InputError message={errors.nip} />}
                    </div>

                    <div className="flex flex-col">
                        <FormControl fullWidth>
                            <InputLabel id="bank-name">
                                Pangkat dan Golongan
                            </InputLabel>
                            <Select
                                labelId="bank-name"
                                id="bank-name"
                                value={pangkatGolongan}
                                label="Nama Bank"
                                onChange={(e) => handlePangkatDanGolongan(e)}
                            >
                                <MenuItem value={"Pembina/(IVA)"}>
                                    Pembina/(IVA)
                                </MenuItem>
                                <MenuItem value={"Pembina Tingkat 1/(IVB)"}>
                                    Pembina Tingkat 1/(IVB)
                                </MenuItem>
                                <MenuItem value={"Pembina Utama Muda/(IVC)"}>
                                    Pembina Utama Muda/(IVC)
                                </MenuItem>
                                <MenuItem value={"Pembina Utama Madya/(IVD)"}>
                                    Pembina Utama Madya/(IVD)
                                </MenuItem>
                                <MenuItem value={"Pembina Utama/(IVE)"}>
                                    Pembina Utama/(IVE)
                                </MenuItem>

                                <MenuItem value={"Penata Muda/(IIIA)"}>
                                    Penata Muda/(IIIA)
                                </MenuItem>
                                <MenuItem
                                    value={"Penata Muda Tingkat 1/(IIIB)"}
                                >
                                    Penata Muda Tingkat 1/(IIIB)
                                </MenuItem>
                                <MenuItem value={"Penata/(IIIC)"}>
                                    Penata/(IIIC)
                                </MenuItem>
                                <MenuItem value={"Penata Tingkat1/(IIID)"}>
                                    Penata Tingkat 1/(IIID)
                                </MenuItem>
                                <MenuItem value={"-"}>Lainnya</MenuItem>
                            </Select>
                        </FormControl>
                        {errors.pangkat_golongan && (
                            <InputError message={errors.pangkat_golongan} />
                        )}
                    </div>
                    {jabatan === "Guru Pamong" && (
                        <div>
                            <Autocomplete
                                id="mahasiswa"
                                value={mahasiswa}
                                getOptionLabel={(option) => option.name}
                                options={dataMahasiswa}
                                onChange={(e, value) => {
                                    setMahasiwa(value);
                                }}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Mahasiswa Bimbingan"
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
                                    <Box
                                        {...props}
                                        sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            p: 1,
                                        }}
                                    >
                                        <Box sx={{ textAlign: "left" }}>
                                            <Typography variant="body1">
                                                {option.name}
                                            </Typography>
                                            <Typography
                                                variant="body2"
                                                color="textSecondary"
                                            >
                                                {`NIM. ${option.username}`}
                                            </Typography>
                                        </Box>
                                    </Box>
                                )}
                                fullWidth
                            />
                            {errors.mahasiswa && (
                                <InputError message={errors.mahasiswa} />
                            )}
                        </div>
                    )}

                    <div className="flex flex-col">
                        <FormControl fullWidth>
                            <InputLabel id="bank-name">Nama Bank</InputLabel>
                            <Select
                                labelId="bank-name"
                                id="bank-name"
                                value={namaBank}
                                label="Nama Bank"
                                onChange={(e) => handleNamaBankChange(e)}
                            >
                                <MenuItem value={"Bank Aceh Syari'ah"}>
                                    Bank Aceh Syari'ah
                                </MenuItem>
                                <MenuItem value={"Bank Syari'ah Indonesia"}>
                                    Bank Syari'ah Indonesia
                                </MenuItem>
                            </Select>
                        </FormControl>
                        {errors.nama_bank && (
                            <InputError message={errors.nama_bank} />
                        )}
                    </div>
                    <div className="flex flex-col">
                        <FormControl fullWidth>
                            <InputLabel id="jabatan">Jabatan</InputLabel>
                            <Select
                                labelId="jabatan"
                                id="jabatan"
                                // value={age}
                                value={jabatan}
                                label="Jabatan"
                                onChange={(e) => handleJabatanChange(e)}
                            >
                                <MenuItem value={"Kepala Sekolah"}>
                                    Kepala Sekolah
                                </MenuItem>
                                <MenuItem value={"Guru Pamong"}>
                                    Guru Pamong
                                </MenuItem>
                            </Select>
                        </FormControl>
                        {errors.nama_bank && (
                            <InputError message={errors.nama_bank} />
                        )}
                    </div>

                    <div className="flex flex-col">
                        <TextField
                            fullWidth
                            value={noRekening}
                            label="No Rekening"
                            onChange={(e) => handleNoRekeningChange(e)}
                            sx={{
                                "& .MuiOutlinedInput-root.Mui-focused": {
                                    outline: "none",
                                    boxShadow: "none",
                                },
                                "& .MuiInputBase-input:focus": {
                                    outline: "none",
                                    boxShadow: "none",
                                },
                            }}
                        />
                        {errors.no_rekening && (
                            <InputError message={errors.no_rekening} />
                        )}
                    </div>
                    <div className="flex flex-col">
                        <TextField
                            fullWidth
                            value={noNPWP}
                            label="No NPWP"
                            onChange={(e) => handleNoNPWPChange(e)}
                            sx={{
                                "& .MuiOutlinedInput-root.Mui-focused": {
                                    outline: "none",
                                    boxShadow: "none",
                                },
                                "& .MuiInputBase-input:focus": {
                                    outline: "none",
                                    boxShadow: "none",
                                },
                            }}
                        />
                        {errors.no_npwp && (
                            <InputError message={errors.no_npwp} />
                        )}
                    </div>
                    <div className="flex flex-col gap-y-2">
                        {/* {userData?.link_nota && (
                            <a
                                href={`/storage/${userData.link_nota}`}
                                target="_blank"
                                className="font-normal flex items-center gap-x-2 bg-primary2-400/10 w-fit px-3 py-1 rounded-md cursor-pointer"
                            >
                                {userData.link_nota.split("/").pop()}
                                <RiAttachment2 className="text-lg" />
                            </a>
                        )} */}
                        {dokumen && (
                            <a
                                href="#"
                                className="font-normal flex items-center gap-x-2 bg-primary2-400/10 w-fit px-3 py-1 rounded-md cursor-pointer"
                            >
                                {dokumen.name}
                                <RiAttachment2 className="text-lg" />
                            </a>
                        )}
                        <Button
                            variant="outlined"
                            sx={{
                                textTransform: "capitalize",
                                width: "200px",
                            }}
                            onClick={() =>
                                openDokumen(
                                    "/storage/" +
                                        data?.link_document.replace(
                                            "public/",
                                            ""
                                        )
                                )
                            }
                            component="label"
                            startIcon={<LaunchOutlined />}
                        >
                            Dokumen
                            {/* <VisuallyHiddenInput
                                type="file"
                                accept="application/pdf"
                                onChange={(event) => handleDokumenChange(event)}
                            /> */}
                        </Button>
                        {errors.dokumen && (
                            <InputError message={errors.dokumen} />
                        )}
                    </div>
                </div>
                <div>
                    <Button
                        sx={{ textTransform: "capitalize" }}
                        variant="contained"
                        disableElevation
                        disabled={loading}
                        onClick={() => submit()}
                    >
                        Simpan
                    </Button>
                </div>
            </section>
        </AdminLayout>
    );
}

export default EditKepsekPamong;
