import InputError from "@/Components/InputError";
import OperatorKecamatanLayout from "@/Layouts/OperatorKecamatanLayout";
import OperatorSekolahLayout from "@/Layouts/OperatorSekolahLayout";
import { Head, router } from "@inertiajs/react";
import {
    Alert,
    AlertTitle,
    Autocomplete,
    Button,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    styled,
    TextField,
} from "@mui/material";
import { desa } from "daftar-wilayah-indonesia";
import kecamatan from "daftar-wilayah-indonesia/kecamatan";
import { Input } from "postcss";
import React from "react";
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

function AddCamatKeuchik({ base_url, data_opt, auth }) {
    const [dataoPt, setDataopt] = useState(data_opt.id_sekolah);
    const [errors, setErrors] = useState({
        name: null,
        nip: null,
        pangkat_golongan: null,
        desa: null,
        kecamatan: null,
        id_desa: null,
        id_kecamatan: null,
        nama_bank: null,
        no_rekening: null,
        nama_di_buku_rekening: null,
        no_npwp: null,
        dokumen: null,
        jabatan: null,
    });

    const [responseError, setResponseError] = useState(null);

    const [name, setName] = useState(null);
    const [nip, setNip] = useState(null);
    const [pangkatGolongan, setPangkatGolongan] = useState("");
    const [namaBank, setNamaBank] = useState("");
    const [noRekening, setNoRekening] = useState(null);
    const [noNPWP, setNoNPWP] = useState(null);
    const [dokumen, setDokumen] = useState(null);
    const [jabatan, setJabatan] = useState("");
    const [loading, setLoading] = useState(false);
    const [namaDiBukuRek, setNamaDiBukuRek] = useState(null);

    const [villageData, setVillageData] = useState(
        desa(data_opt?.id_kecamatan) || []
    );
    const [village, setVillage] = useState(null);
    const handleVillageChange = (e, value) => {
        setVillage(value);
    };

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

        if (namaBank === "") {
            newErrors.nama_bank = "Nama bank wajib diisi";
        }
        if (noRekening === null) {
            newErrors.no_rekening = "No rekening wajib diisi";
        }
        if (noNPWP === null) {
            newErrors.no_npwp = "No NPWP wajib diisi";
        }
        if (dokumen === null) {
            newErrors.dokumen = "Dokumen wajib diupload";
        }
        if (jabatan === "") {
            newErrors.jabatan = "Jabatan wajib dipilih";
        } else {
            if (jabatan === "Camat") {
                if (nip === null) {
                    newErrors.nip = "NIP wajib diisi";
                }
                if (pangkatGolongan === null) {
                    newErrors.pangkat_golongan =
                        "Pangkat & golongan wajib diisi";
                }
            }
            if (jabatan === "Keuchik") {
                if (village === null) {
                    newErrors.village = "Desa wajib dipilih";
                }
            }
        }

        setErrors(newErrors);

        console.log(newErrors); // Log the updated errors
        return Object.values(newErrors).every((value) => value === null);
    };
    const submit = async () => {
        console.log("submit");
        if (validate()) {
            setLoading(true);
            console.log("save");

            try {
                const formData = new FormData();
                formData.append("name", name);
                formData.append("nip", nip);
                formData.append("jabatan", jabatan);
                formData.append("no_rekening", noRekening);
                formData.append("no_npwp", noNPWP);
                formData.append("pangkat_dan_golongan", pangkatGolongan);
                formData.append("dokumen", dokumen);
                formData.append("id_sekolah", data_opt.id_sekolah);
                formData.append("nama_bank", namaBank);
                formData.append("desa", village?.nama);
                formData.append("id_desa", village?.kode);
                formData.append("id_kecamatan", data_opt?.id_kecamatan);
                formData.append("kecamatan", auth?.user?.name);
                formData.append("nama_di_buku_rekening", namaDiBukuRek);
                console.log(village);

                const response = await axios.post(
                    `${base_url}/api/operator-kecamatan/data/camat-keuchik/save`,
                    formData,
                    {
                        headers: { "Content-Type": "multipart/form-data" },
                    }
                );
                console.log("response", response);
                if (response.data.status === "ok") {
                    router.visit("/operator-kecamatan/data/camat-keuchik");
                }
            } catch (err) {
                setResponseError(err.response?.data?.message);
            } finally {
                setLoading(false);
            }
        } else {
            return;
        }
    };

    const handleJabatanChange = (e) => {
        setJabatan(e.target.value);
        setErrors({ ...errors, jabatan: null });
    };

    return (
        <OperatorKecamatanLayout>
            <Head title="Add Camat / Keuchik" />
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
                <Alert severity="info">
                    <AlertTitle>Info Pengisian</AlertTitle>
                    <ol class="!list-decimal pl-5 space-y-2">
                        <li>
                            Setelah memasukkan nama silakan pilih jabatan yang
                            sesuai
                        </li>
                        <li>
                            Jika sebagai Camat maka wajib mengisi NIP dan
                            Pengakat & golongan. jika tidak ada isi dengan (-)
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

                        {errors.name && <InputError message={errors.name} />}
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
                                <MenuItem value={"Camat"}>Camat</MenuItem>
                                <MenuItem value={"Keuchik"}>Keuchik</MenuItem>
                            </Select>
                        </FormControl>
                        {errors.nama_bank && (
                            <InputError message={errors.nama_bank} />
                        )}
                    </div>
                    {jabatan === "Camat" && (
                        <>
                            <div className="flex flex-col ">
                                <TextField
                                    fullWidth
                                    value={nip}
                                    label="NIP"
                                    onChange={(e) => handleNIPChange(e)}
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
                                {errors.nip && (
                                    <InputError message={errors.nip} />
                                )}
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
                                        onChange={(e) =>
                                            handlePangkatDanGolongan(e)
                                        }
                                    >
                                        <MenuItem value={"Pembina/(IVA)"}>
                                            Pembina/(IVA)
                                        </MenuItem>
                                        <MenuItem
                                            value={"Pembina Tingkat 1/(IVB)"}
                                        >
                                            Pembina Tingkat 1/(IVB)
                                        </MenuItem>
                                        <MenuItem
                                            value={"Pembina Utama Muda/(IVC)"}
                                        >
                                            Pembina Utama Muda/(IVC)
                                        </MenuItem>
                                        <MenuItem
                                            value={"Pembina Utama Madya/(IVD)"}
                                        >
                                            Pembina Utama Madya/(IVD)
                                        </MenuItem>
                                        <MenuItem value={"Pembina Utama/(IVE)"}>
                                            Pembina Utama/(IVE)
                                        </MenuItem>

                                        <MenuItem value={"Penata Muda/(IIIA)"}>
                                            Penata Muda/(IIIA)
                                        </MenuItem>
                                        <MenuItem
                                            value={
                                                "Penata Muda Tingkat 1/(IIIB)"
                                            }
                                        >
                                            Penata Muda Tingkat 1/(IIIB)
                                        </MenuItem>
                                        <MenuItem value={"Penata/(IIIC)"}>
                                            Penata/(IIIC)
                                        </MenuItem>
                                        <MenuItem
                                            value={"Penata Tingkat1/(IIID)"}
                                        >
                                            Penata Tingkat 1/(IIID)
                                        </MenuItem>
                                        <MenuItem value={"-"}>Lainnya</MenuItem>
                                    </Select>
                                </FormControl>
                                {errors.pangkat_golongan && (
                                    <InputError
                                        message={errors.pangkat_golongan}
                                    />
                                )}
                            </div>
                        </>
                    )}
                    {jabatan === "Keuchik" && (
                        <div className="flex flex-col w-full">
                            <Autocomplete
                                id="desa"
                                sx={{ width: "100%" }}
                                options={villageData}
                                getOptionLabel={(option) => option.nama}
                                onChange={(e, value) =>
                                    handleVillageChange(e, value)
                                }
                                renderInput={(params) => (
                                    <TextField {...params} label="Desa" />
                                )}
                            ></Autocomplete>
                            {errors.village && (
                                <InputError message={errors.village} />
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
                            component="label"
                            startIcon={<IoCloudUploadOutline />}
                        >
                            Upload Dokumen
                            <VisuallyHiddenInput
                                type="file"
                                accept="application/pdf"
                                onChange={(event) => handleDokumenChange(event)}
                            />
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
        </OperatorKecamatanLayout>
    );
}

export default AddCamatKeuchik;
