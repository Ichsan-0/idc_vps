import {
    Alert,
    Snackbar,
    Autocomplete,
    Box,
    Button,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    TextField,
    Chip,
} from "@mui/material";
import PropTypes from "prop-types";
import { FaWhatsapp } from "react-icons/fa";

import { styled, ThemeProvider, createTheme } from "@mui/material/styles";
import React, { useEffect, useState } from "react";
import { Head, Link, router, useForm, usePage } from "@inertiajs/react";
import Header from "@/Components/frontpage/Header";
import Footer from "@/Components/frontpage/Footer";
import InputError from "@/Components/InputError";
import { provinsi, kabupaten, kecamatan, desa } from "daftar-wilayah-indonesia";
import { CloudUploadOutlined } from "@mui/icons-material";
import { GrAttachment } from "react-icons/gr";

function CustomTabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ p: 3, bgcolor: "#fcfcfc" }}>{children}</Box>
            )}
        </div>
    );
}

CustomTabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.number.isRequired,
    value: PropTypes.number.isRequired,
};

const theme = createTheme({
    palette: {
        primary: {
            main: "#008a01",
            light: "#66b967",
            dark: "#006e01",
            contrastText: "fff",
        },
    },
});

const Profil = ({ lowongan_ppl, flash, mahasiswa, list_prodi, link_grup }) => {
    const [notify, setNotify] = useState(!!flash.message);
    const [notifyStatus, setNotifyStatus] = useState("default");
    useEffect(() => {
        if (flash.message !== null) {
            console.log("notify=> ", notify);
            if (flash.message.success) {
                setNotifyStatus("success");
            } else {
                setNotifyStatus("error");
            }
        }
        setNotify(true);
    }, [flash.message]);
    // console.log(tempat_ppl);
    const handleCloseNotify = (event, reason) => {
        if (reason === "clickaway") {
            return;
        }
        setNotify(false);
    };
    const [value, setValue] = useState(2);
    const [name, setName] = useState(mahasiswa?.name || null);
    const [nim, setNim] = useState(mahasiswa?.username || null);
    const [IPK, setIPK] = useState(mahasiswa?.data_mahasiswa.ipk || null);
    const [nilaiMicro, setNilaiMicro] = useState(
        mahasiswa?.data_mahasiswa?.nilai_micro_teaching || null
    );
    const [prodi, setProdi] = useState(
        list_prodi.find((itm) => itm.id === mahasiswa?.data_mahasiswa?.id_prodi)
    );

    const listOfProvincies = provinsi();
    const [listOfRegencies, setListOfRegencies] = useState([]);
    const [listOfSubdistricts, setListOfSubdistricts] = useState([]);
    const [listOfVillages, setListOfVillages] = useState([]);

    const [province, setProvince] = useState(
        mahasiswa.data_mahasiswa.province_code
            ? provinsi().find(
                  (itm) => itm.kode === mahasiswa.data_mahasiswa.province_code
              )
            : null
    );

    const [regency, setRegency] = useState(
        mahasiswa.data_mahasiswa.regency_code
            ? kabupaten(mahasiswa.data_mahasiswa.province_code).find(
                  (itm) => itm.kode === mahasiswa.data_mahasiswa.regency_code
              )
            : null
    );

    const [subDistrict, setSubDistrict] = useState(
        mahasiswa.data_mahasiswa.subdistrict_code
            ? kecamatan(mahasiswa.data_mahasiswa.regency_code).find(
                  (itm) =>
                      itm.kode === mahasiswa.data_mahasiswa.subdistrict_code
              )
            : null
    );

    const [village, setVillage] = useState(
        mahasiswa.data_mahasiswa.village_code
            ? desa(mahasiswa.data_mahasiswa.subdistrict_code).find(
                  (itm) => itm.kode === mahasiswa.data_mahasiswa.village_code
              )
            : null
    );
    const [noHpWa, setNoHpWa] = useState(
        mahasiswa.data_mahasiswa?.no_hp_wa || null
    );
    const [clusterKegiatan, setClusterKegiatan] = useState(
        mahasiswa.data_mahasiswa?.cluster_kegiatan || null
    );

    const [semester, setSemester] = useState(
        mahasiswa.data_mahasiswa?.semester || null
    );
    const [jenisKelamin, setJenisKelamin] = useState(
        mahasiswa.data_mahasiswa?.jk || null
    );

    const [transkrip, setTranskrip] = useState(null);

    const [linkTranskrip, setLinkTranskrip] = useState(
        mahasiswa.data_mahasiswa?.link_transkrip_nilai || null
    );

    const VisuallyHiddenInput = styled("input")({
        clip: "rect(0,0,0,0)",
        clipPath: "inset(50%)",
        height: 1,
        overflow: "hidden",
        position: "absolute",
        bottom: 0,
        left: 0,
        whiteSpace: "nowrap",
        width: 1,
    });

    const { setData, post, errors, processing } = useForm({
        province_code: province?.kode || null,
        regency_code: regency?.kode || null,
        subdistrict_code: subDistrict?.kode || null,
        village_code: village?.kode || null,
        ipk: IPK,
        id_prodi: prodi?.id || null,
        nilai_micro_teaching: nilaiMicro,
        no_hp_wa: noHpWa,
        cluster_kegiatan: clusterKegiatan,
        semester: semester,
        transkrip: transkrip,
        jk: jenisKelamin,
    });

    const handleJenisKelaminChange = (e) => {
        setJenisKelamin(e.target.value);
        setData("jk", e.target.value);
    };

    const handleNameChange = (e) => {
        setName(e.target.value);
        setData("name", e.target.value);
    };

    const handleNimChange = (e) => {
        setNim(e.target.value);
        setData("nim", e.target.value);
    };

    const handleProvinceChange = (e, value) => {
        setProvince(value);
        setData("province_code", value.kode);
        setListOfRegencies(kabupaten(value.kode));
    };

    const handleRegencyChange = (e, value) => {
        setListOfSubdistricts(kecamatan(value.kode));
        setData("regency_code", value.kode);
        setRegency(value);
    };

    const handleSubDisctrictChange = (e, value) => {
        setListOfVillages(desa(value.kode));
        setData("subdistrict_code", value.kode);
        setSubDistrict(value);
    };

    const handleVillageChange = (e, value) => {
        setVillage(value);
        setData("village_code", value.kode);
        setVillage(value);
    };

    const handleIPKChange = (e) => {
        setIPK(e.target.value);
        setData("ipk", e.target.value);
    };

    const handleNilaiMicroChange = (e) => {
        setNilaiMicro(e.target.value);
        setData("nilai_micro_teaching", e.target.value);
    };

    const handleProdiChange = (e, value) => {
        setProdi(value);
        setData("id_prodi", value.id);
    };

    const handleNoHpWa = (e) => {
        setNoHpWa(e.target.value);
        setData("no_hp_wa", e.target.value);
    };

    const handleClusterKegiatanChange = (e) => {
        setData("cluster_kegiatan", e.target.value);
        setClusterKegiatan(e.target.value);
    };

    const handleSemesterChange = (e) => {
        setData("semester", e.target.value);
        setSemester(e.target.value);
    };

    const handleTranskripChange = (e) => {
        const file = e.target.files[0];
        setTranskrip(e.target.files[0]);
        setData("transkrip", file);
    };

    const onSubmit = (e) => {
        e.preventDefault();
        post("/profil/save");
    };

    return (
        <ThemeProvider theme={theme}>
            <Head title="Profil" />
            <Header />
            {flash.message && (
                <Snackbar
                    open={notify}
                    anchorOrigin={{
                        vertical: "top",
                        horizontal: "right",
                    }}
                    autoHideDuration={3000}
                    onClose={handleCloseNotify}
                >
                    <Alert
                        onClose={handleCloseNotify}
                        severity={notifyStatus}
                        variant="filled"
                        sx={{ width: "100%" }}
                    >
                        {flash.message && flash.message[notifyStatus]}
                    </Alert>
                </Snackbar>
            )}
            <main className="flex justify-center flex-col items-center w-full px-6  lg:px-10 z-[0]">
                <div className="flex justify-center items-center w-full mt-4 flex-col">
                    <div className="h-5"></div>

                    <section className="bg-white w-full rounded-md px-4 pt-3 max-w-5xl">
                        <div className="">
                            <p className="text-neutral-600 font-bold text-lg">
                                Profil
                            </p>
                            <ul className="flex flex-row justify-between mt-3">
                                <li>
                                    {mahasiswa.data_mahasiswa.status ===
                                        "accepted" && (
                                        <a
                                            target="_blank"
                                            href={link_grup}
                                            className="bg-secondary cursor-pointer text-white py-2 rounded-md px-3 flex flex-row items-center"
                                        >
                                            <span className="text-3xl mr-2">
                                                <FaWhatsapp />
                                            </span>
                                            Join Group WhatsApp
                                        </a>
                                    )}
                                </li>
                                <li>
                                    {getProfilStatus(
                                        mahasiswa.data_mahasiswa.status
                                    )}
                                </li>
                            </ul>
                            {mahasiswa?.data_mahasiswa?.status === "revisi" && (
                                <ul className="flex w-full mt-3">
                                    <li className="flex w-full">
                                        <Alert
                                            severity="warning"
                                            sx={{ width: "100%" }}
                                        >
                                            {
                                                mahasiswa?.data_mahasiswa
                                                    ?.keterangan
                                            }
                                        </Alert>
                                    </li>
                                </ul>
                            )}

                            <div className="grid max-w-6xl gap-2 grid-cols-1 md:grid-cols-2 pb-5">
                                <div className="flex w-full flex-col mt-5 gap-y-2">
                                    <div className="flex flex-col">
                                        <TextField
                                            id="nama"
                                            value={name}
                                            label="Nama"
                                            disabled
                                            required
                                            onChange={(e) =>
                                                handleNameChange(e)
                                            }
                                            fullWidth
                                        />
                                        {errors.name && (
                                            <InputError message={errors.name} />
                                        )}
                                    </div>
                                    <div className="flex flex-col">
                                        <TextField
                                            id="nim"
                                            value={nim}
                                            label="NIM"
                                            disabled
                                            required
                                            onChange={(e) => handleNimChange(e)}
                                            fullWidth
                                        />
                                        {errors.name && (
                                            <InputError message={errors.name} />
                                        )}
                                    </div>
                                    <div className="flex flex-col">
                                        <TextField
                                            id="no_hp_wa"
                                            value={noHpWa}
                                            label="No HP/WA"
                                            type="tel"
                                            required
                                            onChange={(e) => handleNoHpWa(e)}
                                            fullWidth
                                        />
                                        {errors.no_hp_wa && (
                                            <InputError
                                                message={errors.no_hp_wa}
                                            />
                                        )}
                                    </div>
                                    <div className="flex flex-col">
                                        <Autocomplete
                                            id="province"
                                            value={province}
                                            required
                                            getOptionLabel={(option) =>
                                                option.nama
                                            }
                                            options={listOfProvincies}
                                            onChange={(e, value) =>
                                                handleProvinceChange(e, value)
                                            }
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    label="Provinsi Sekarang"
                                                />
                                            )}
                                            fullWidth
                                        />
                                        {errors.province_code && (
                                            <InputError
                                                message={errors.province_code}
                                            />
                                        )}
                                    </div>
                                    <div className="flex flex-col">
                                        <Autocomplete
                                            id="regency"
                                            value={regency}
                                            required
                                            getOptionLabel={(option) =>
                                                option.nama
                                            }
                                            options={listOfRegencies}
                                            onChange={(e, value) =>
                                                handleRegencyChange(e, value)
                                            }
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    label="Kabupaten Sekarang"
                                                />
                                            )}
                                            fullWidth
                                        />
                                        {errors.regency_code && (
                                            <InputError
                                                message={errors.regency_code}
                                            />
                                        )}
                                    </div>
                                    <div className="flex flex-col">
                                        <Autocomplete
                                            id="subdistrict"
                                            value={subDistrict}
                                            required
                                            getOptionLabel={(option) =>
                                                option.nama
                                            }
                                            options={listOfSubdistricts}
                                            onChange={(e, value) =>
                                                handleSubDisctrictChange(
                                                    e,
                                                    value
                                                )
                                            }
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    label="Kecamatan Sekarang"
                                                />
                                            )}
                                            fullWidth
                                        />
                                        {errors.subdistrict_code && (
                                            <InputError
                                                message={
                                                    errors.subdistrict_code
                                                }
                                            />
                                        )}
                                    </div>
                                    <div className="flex flex-col">
                                        <Autocomplete
                                            id="village"
                                            value={village}
                                            required
                                            getOptionLabel={(option) =>
                                                option.nama
                                            }
                                            options={listOfVillages}
                                            onChange={(e, value) =>
                                                handleVillageChange(e, value)
                                            }
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    label="Desa Sekarang"
                                                />
                                            )}
                                            fullWidth
                                        />
                                        {errors.village_code && (
                                            <InputError
                                                message={errors.village_code}
                                            />
                                        )}
                                    </div>
                                </div>
                                <div className="flex md:mt-5 flex-col gap-y-2">
                                    <div className="flex flex-col">
                                        <Autocomplete
                                            id="prodi"
                                            value={prodi}
                                            required
                                            options={list_prodi}
                                            onChange={(e, value) =>
                                                handleProdiChange(e, value)
                                            }
                                            fullWidth
                                            getOptionLabel={(option) =>
                                                option.name
                                            }
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    label="Prodi"
                                                />
                                            )}
                                        />
                                        {errors.id_prodi && (
                                            <InputError
                                                message={errors.id_prodi}
                                            />
                                        )}
                                    </div>
                                    <div className="flex flex-col">
                                        <TextField
                                            id="ipk"
                                            value={IPK}
                                            label="IPK"
                                            type="text"
                                            inputMode="decimal"
                                            required
                                            onChange={(e) => handleIPKChange(e)}
                                            fullWidth
                                        />
                                        {errors.ipk && (
                                            <InputError message={errors.ipk} />
                                        )}
                                    </div>
                                    <div className="flex flex-col">
                                        <FormControl fullWidth>
                                            <InputLabel id="nilai_micro_teaching_label">
                                                Nilai Micro
                                            </InputLabel>
                                            <Select
                                                labelId="nilai_micro_teaching_label"
                                                id="nilai_micro_teaching"
                                                value={nilaiMicro}
                                                onChange={(e) =>
                                                    handleNilaiMicroChange(e)
                                                }
                                            >
                                                {/* //A, A-, B+, B, B-, C+, C, C- */}
                                                <MenuItem value={"A"}>
                                                    A
                                                </MenuItem>
                                                <MenuItem value={"A-"}>
                                                    A-
                                                </MenuItem>
                                                <MenuItem value={"B+"}>
                                                    B+
                                                </MenuItem>
                                                <MenuItem value={"B"}>
                                                    B
                                                </MenuItem>
                                                <MenuItem value={"B-"}>
                                                    B-
                                                </MenuItem>
                                                <MenuItem value={"C+"}>
                                                    C+
                                                </MenuItem>
                                                <MenuItem value={"C"}>
                                                    C
                                                </MenuItem>
                                                <MenuItem value={"C-"}>
                                                    C-
                                                </MenuItem>
                                            </Select>
                                        </FormControl>

                                        {errors.nilai_micro_teaching && (
                                            <InputError
                                                message={
                                                    errors.nilai_micro_teaching
                                                }
                                            />
                                        )}
                                    </div>

                                    <div className="flex flex-col">
                                        <FormControl fullWidth>
                                            <InputLabel id="cluster_kegiatan_label">
                                                Cluster Kegiatan
                                            </InputLabel>
                                            <Select
                                                labelId="cluster_kegiatan_label"
                                                id="cluster_kegiatan"
                                                value={clusterKegiatan}
                                                onChange={(e) =>
                                                    handleClusterKegiatanChange(
                                                        e
                                                    )
                                                }
                                            >
                                                <MenuItem value={"PPKPM"}>
                                                    PPKPM
                                                </MenuItem>
                                                <MenuItem value={"PPL"}>
                                                    PPL
                                                </MenuItem>
                                                <MenuItem value={"KPM"}>
                                                    KPM
                                                </MenuItem>
                                            </Select>
                                        </FormControl>

                                        {errors.cluster_kegiatan && (
                                            <InputError
                                                message={
                                                    errors.cluster_kegiatan
                                                }
                                            />
                                        )}
                                    </div>

                                    <div className="flex flex-col">
                                        <TextField
                                            id="semester"
                                            value={semester}
                                            label="Semester"
                                            type="number"
                                            required
                                            onChange={(e) =>
                                                handleSemesterChange(e)
                                            }
                                            fullWidth
                                        />
                                        {errors.semester && (
                                            <InputError
                                                message={errors.semester}
                                            />
                                        )}
                                    </div>
                                    <div className="flex flex-col">
                                        <FormControl fullWidth>
                                            <InputLabel id="jenis_kelamin_label">
                                                Jenis Kelamin
                                            </InputLabel>
                                            <Select
                                                labelId="jenis_kelamin_label"
                                                id="jenis_kelamin"
                                                value={jenisKelamin}
                                                onChange={(e) =>
                                                    handleJenisKelaminChange(e)
                                                }
                                            >
                                                <MenuItem value={"Pria"}>
                                                    Pria
                                                </MenuItem>
                                                <MenuItem value={"Wanita"}>
                                                    Wanita
                                                </MenuItem>
                                            </Select>
                                        </FormControl>

                                        {errors.jk && (
                                            <InputError message={errors.jk} />
                                        )}
                                    </div>
                                    <div className="flex flex-col justify-center">
                                        <div className="flex flex-row justify-center gap-x-2 ">
                                            <div
                                                className="flex flex-[1.5] w-full ring-1 ring-secondary rounded-md p-3 justify-between items-center cursor-pointer"
                                                onClick={(e) => {}}
                                            >
                                                {/* <p>Transkrip_nilai_200205002</p> */}
                                                {transkrip === null ? (
                                                    <p>Tidak ada file</p>
                                                ) : (
                                                    <p className="truncate">
                                                        {transkrip?.name
                                                            ?.length > 30
                                                            ? `${transkrip?.name.slice(
                                                                  0,
                                                                  30
                                                              )}...`
                                                            : transkrip?.name}
                                                    </p>
                                                )}

                                                <GrAttachment />
                                            </div>

                                            <Button
                                                component="label"
                                                role={undefined}
                                                variant="contained"
                                                tabIndex={-1}
                                                sx={{
                                                    display: "flex",
                                                    flex: 1,
                                                    textTransform: "capitalize",
                                                    color: "white",
                                                    // whiteSpace: "nowrap",
                                                }}
                                                startIcon={
                                                    <CloudUploadOutlined />
                                                }
                                            >
                                                Upload Transkrip Nilai
                                                <VisuallyHiddenInput
                                                    type="file"
                                                    accept="application/pdf"
                                                    onChange={(event) =>
                                                        handleTranskripChange(
                                                            event
                                                        )
                                                    }
                                                    multiple
                                                />
                                            </Button>
                                        </div>
                                        {errors.transkrip && (
                                            <InputError
                                                message={errors.transkrip}
                                            />
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <Button
                                        id="save"
                                        disabled={processing}
                                        variant="contained"
                                        onClick={(e) => onSubmit(e)}
                                        sx={{
                                            textTransform: "capitalize",
                                            color: "white",
                                        }}
                                    >
                                        Simpan
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </section>
                    <div className="h-72 w-0"></div>
                </div>
            </main>
            <Footer currentTab={4} />
        </ThemeProvider>
    );
};

export default Profil;

const getProfilStatus = (status) => {
    if (status === null) {
        return (
            <Chip variant="filled" label="Lengkapi Profilmu" color="error" />
        );
    } else if (status === "submitted") {
        return (
            <Chip
                variant="filled"
                label="Profilmu Sedang Di-review"
                color="warning"
            />
        );
    } else if (status === "rejected") {
        return (
            <Chip
                variant="filled"
                label="Pendaftaranmu Ditolak, Silakan mendaftar di gelombang selanjutnya"
                color="error"
            />
        );
    } else if (status === "accepted") {
        return (
            <Chip
                variant="filled"
                label="Pendaftaranmu Diterima"
                color="success"
            />
        );
    } else if (status === "revisi") {
        return (
            <Chip
                variant="filled"
                label="Profilmu Ditolak silakan lengkapi profil kembali"
                color="warning"
            />
        );
    }
};
