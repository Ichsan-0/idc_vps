import {
    Autocomplete,
    Avatar,
    BottomNavigation,
    BottomNavigationAction,
    Box,
    Button,
    FormControl,
    MenuItem,
    Select,
    Tab,
    Tabs,
    TextField,
} from "@mui/material";
import PropTypes from "prop-types";
import InputLabel from "@mui/material/InputLabel";
import { provinsi, kabupaten, kecamatan, desa } from "daftar-wilayah-indonesia";

import { styled, ThemeProvider, createTheme } from "@mui/material/styles";
import PermIdentityIcon from "@mui/icons-material/PermIdentity";
import React, { useState, useEffect } from "react";
import PlaceIcon from "@mui/icons-material/Place";
import SubjectIcon from "@mui/icons-material/Subject";
import { AcademicCapIcon } from "@heroicons/react/24/outline";
import { data_tempat_ppl, data_prodi, data_nilai } from "../../data";
import { Head, router, useForm } from "@inertiajs/react";
import { deepOrange, deepPurple } from "@mui/material/colors";
import UpdateProfileInformation from "../Profile/Partials/UpdateProfileInformationForm";
import DeleteUserForm from "../Profile/Partials/DeleteUserForm";
import UpdatePasswordForm from "../Profile/Partials/UpdatePasswordForm";
import PrimaryButton from "@/Components/PrimaryButton";
import { Email } from "@mui/icons-material";
import InputError from "@/Components/InputError";

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

function a11yProps(index) {
    return {
        id: `simple-tab-${index}`,
        "aria-controls": `simple-tabpanel-${index}`,
    };
}

const StyledTabs = styled((props) => (
    <Tabs
        {...props}
        TabIndicatorProps={{
            children: <span className="MuiTabs-indicatorSpan" />,
        }}
    />
))({
    "& .MuiTabs-indicator": {
        display: "flex",
        justifyContent: "center",
        backgroundColor: "transparent",
    },
    "& .MuiTabs-indicatorSpan": {
        maxWidth: 40,
        width: "100%",
        backgroundColor: "#008A01",
    },
});

const StyledTab = styled((props) => <Tab disableRipple {...props} />)(
    ({ theme }) => ({
        textTransform: "none",
        fontWeight: theme.typography.fontWeightRegular,
        fontSize: theme.typography.pxToRem(15),
        marginRight: theme.spacing(1),
        color: "#b2b2b2",
        "&.Mui-selected": {
            color: "#008A01",
        },
        "&.Mui-focusVisible": {
            backgroundColor: "#006e01",
        },
        "&:hover": {
            color: "#008A01",
            opacity: 1,
        },
    })
);

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

const Profil = ({ prodi_data, auth, data_mahasiswa }) => {
    const { data, setData, post, progress, errors } = useForm({
        id_prodi: null,
        provinsi: null,
        kabupaten: null,
        kecamatan: null,
        desa: null,
        provinsi_now: null,
        kabupaten_now: null,
        kecamatan_now: null,
        desa_now: null,
        ipk: null,
        khs: null,
        jk: null,
        no_hp_wa: null,
        nilai_microteaching: null,
    });

    const [value, setValue] = useState(2);
    const [nama, setNama] = useState(auth.user.name || "");

    const [email, setEmail] = useState(auth.user.email || "");

    const [nim, setNim] = useState(auth.user.username);

    const [noHp, setNoHp] = useState(data_mahasiswa.no_hp_wa || "");

    const [jenisKelamin, setJenisKelamin] = useState(data_mahasiswa.jk || "");

    const [daftarProvinsiD, setDaftarProvinsiD] = useState([]);
    const [daftarKabupatenD, setDaftarKabD] = useState([]);
    const [daftarKecD, setDaftarKecD] = useState([]);
    const [daftarDesaD, setDaftarDesaD] = useState([]);

    const [daftarProvinsi, setDaftarProvinsi] = useState([]);
    const [daftarKabupaten, setDaftarKab] = useState([]);
    const [daftarKec, setDaftarKec] = useState([]);
    const [daftarDesa, setDaftarDesa] = useState([]);

    const [provD, setProvD] = useState(
        data_mahasiswa.provinsi
            ? provinsi().find((p) => p.kode === data_mahasiswa.provinsi)
            : null
    );

    const [kabD, setKabD] = useState(
        data_mahasiswa.kabupaten
            ? kabupaten(data_mahasiswa.provinsi).find(
                  (p) => p.kode === data_mahasiswa.kabupaten
              )
            : null
    );
    const [kecD, setKecD] = useState(
        data_mahasiswa.kecamatan
            ? kecamatan(data_mahasiswa.kabupaten).find(
                  (p) => p.kode === data_mahasiswa.kecamatan
              )
            : null
    );
    const [kelD, setKelD] = useState(
        data_mahasiswa.desa
            ? desa(data_mahasiswa.kecamatan).find(
                  (p) => (p.kode = data_mahasiswa.desa)
              )
            : null
    );

    const [prov, setProv] = useState(
        data_mahasiswa.provinsi_now
            ? provinsi().find((p) => p.kode === data_mahasiswa.provinsi_now)
            : null
    );
    const [kab, setKab] = useState(
        data_mahasiswa.kabupaten_now
            ? kabupaten(data_mahasiswa.provinsi_now).find(
                  (p) => p.kode === data_mahasiswa.kabupaten_now
              )
            : null
    );
    const [kec, setKec] = useState(
        data_mahasiswa.kecamatan_now
            ? kecamatan(data_mahasiswa.kabupaten_now).find(
                  (p) => p.kode === data_mahasiswa.kecamatan_now
              )
            : null
    );
    const [kel, setKel] = useState(
        data_mahasiswa.desa_now
            ? desa(data_mahasiswa.kecamatan_now).find(
                  (p) => (p.kode = data_mahasiswa.desa_now)
              )
            : null
    );

    const [prodMhs, setProdiMhs] = useState(
        data_mahasiswa.id_prodi
            ? data_prodi.find((p) => p.id === data_mahasiswa.id_prodi)
            : null
    );

    const [nilaiMicro, setNilaiMicro] = useState(
        data_mahasiswa.nilai_microteaching
            ? data_nilai.find(
                  (p) => p.id === data_mahasiswa.nilai_microteaching
              )
            : null
    );

    const [ipk, setIPK] = useState(
        data_mahasiswa.ipk ? data_mahasiswa.ipk : null
    );

    function submit(e) {
        e.preventDefault();
        router.post("/profil", {
            _method: "patch",
            id_prodi: data.id_prodi,
            provinsi: data.provinsi,
            kabupaten: data.kabupaten,
            kecamatan: data.kecamatan,
            desa: data.desa,
            provinsi_now: data.provinsi_now,
            kabupaten_now: data.kabupaten_now,
            kecamatan_now: data.kecamatan_now,
            desa_now: data.desa_now,
            ipk: data.ipk,
            khs: data.khs,
            jk: data.jk,
            no_hp_wa: data.no_hp_wa,
            nilai_microteaching: data.nilai_microteaching,
        });
    }

    useEffect(() => {
        setDaftarProvinsiD(provinsi());
        setDaftarProvinsi(provinsi());
    }, []);

    const handleProvDChange = (event, value) => {
        setProvD(value);
        setDaftarKabD([]);
        setDaftarKecD([]);
        setDaftarDesaD([]);
        setDaftarKabD(kabupaten(value?.kode || ""));
        setKabD(null);
        setKecD(null);
        setKelD(null);
        setData("provinsi", value.kode);
    };

    const handleKabDchange = (event, value) => {
        setKabD(value);
        setDaftarKecD(kecamatan(value?.kode || ""));
        setKecD(null);
        setKelD(null);
        setData("kabupaten", value.kode);
    };

    const handleKecDchange = (event, value) => {
        setKecD(value);
        setDaftarDesaD(desa(value?.kode || ""));
        setKelD(null);
        setData("kecamatan", value.kode);
    };

    const handleProvChange = (event, value) => {
        setProv(value);
        setDaftarKab([]);
        setDaftarKec([]);
        setDaftarDesa([]);
        setDaftarKab(kabupaten(value?.kode || ""));
        setKab(null);
        setKec(null);
        setKel(null);
        setData("provinsi_now", value.kode);
    };

    const handleKabchange = (event, value) => {
        setKab(value);
        setDaftarKec(kecamatan(value?.kode || ""));
        setKec(null);
        setKel(null);
        setData("kabupaten_now", value.kode);
    };

    const handleKecchange = (event, value) => {
        setKec(value);
        setDaftarDesa(desa(value?.kode || ""));
        setKelD(null);
        setData("kecamatan_now", value.kode);
    };

    const handleJKChange = (event, newValue) => {
        setJenisKelamin(event.target.value);
        setData("jk", event.target.value);
    };

    const getInitials = (name) => {
        const nameArray = name.split(" ");
        const initials = nameArray
            .map((n) => n[0])
            .join("")
            .toUpperCase();
        return initials;
    };

    return (
        <ThemeProvider theme={theme}>
            <Head title="Profil" />
            <header className="fixed z-[100] flex w-full ">
                <div className="flex w-full h-20 lg:px-20 md:px-5 bg-white shadow-md justify-between sm:px-2 backdrop-blur-sm bg-opacity-50">
                    <div className="flex py-3">
                        <div className="flex items-center">
                            <img
                                className="w-20 min-w-20"
                                src="https://upload.wikimedia.org/wikipedia/commons/a/af/Lambang_UIN_Ar-Raniry.png"
                                alt="logo"
                            ></img>
                        </div>

                        <div className="w-[0.5px] bg-neutral-400"></div>
                        <div className="flex h-full items-center">
                            <span className="ml-3 text-xl font-semibold">
                                IDC
                            </span>
                        </div>
                    </div>
                    <div className="flex justify-center items-center">
                        <form>
                            <input
                                type="search"
                                placeholder="search"
                                className="ring-1 bg-secondary/5 ring-secondary rounded-md focus:ring-secondary focus:border-secondary"
                            ></input>
                        </form>
                    </div>
                </div>
            </header>
            <main className="flex justify-center flex-col items-center w-full px-6  lg:px-10">
                <div className="container">
                    <div className="h-32"></div>

                    <section className="bg-white w-full rounded-md px-4 p-4">
                        <div>
                            <p className="text-neutral-600 font-bold text-lg">
                                Profil Information
                            </p>
                            <p className="mt-1 text-sm text-gray-600">
                                Silakan Memperbaharui informasi profil anda!
                            </p>
                        </div>
                        <div className="w-full">
                            <Box sx={{ width: "100%" }}>
                                <form onSubmit={submit}>
                                    <div className="flex h-full w-full flex-col gap-y-3">
                                        <div className="flex w-full justify-center items-center mb-4">
                                            <Avatar
                                                sx={{
                                                    width: 100,
                                                    height: 100,
                                                    bgcolor: deepOrange[500],
                                                }}
                                            >
                                                {getInitials(auth.user.name)}
                                            </Avatar>
                                        </div>
                                        <div className="gap-x-5 flex w-full">
                                            <TextField
                                                id="nama"
                                                label="Nama"
                                                required
                                                disabled
                                                value={nama}
                                                sx={{ width: "100%" }}
                                            />
                                            <TextField
                                                id="nim"
                                                label="NIM"
                                                required
                                                disabled
                                                value={nim}
                                                sx={{ width: "100%" }}
                                            />
                                        </div>
                                        <div className="gap-x-5 flex w-full">
                                            <TextField
                                                disabled
                                                required
                                                id="email"
                                                label="email"
                                                value={email}
                                                sx={{ width: "100%" }}
                                            />
                                            <TextField
                                                id="no_hp_wa"
                                                label="No HP/WA"
                                                required
                                                onChange={(event, value) => {
                                                    setNoHp(event.target.value);
                                                    setData(
                                                        "no_hp_wa",
                                                        event.target.value
                                                    );
                                                }}
                                                value={noHp}
                                                sx={{ width: "100%" }}
                                            />
                                        </div>
                                        <div>
                                            <Box sx={{ minWidth: 120 }}>
                                                <FormControl fullWidth>
                                                    <InputLabel id="jeniskelamin">
                                                        Jenis Kelamin
                                                    </InputLabel>
                                                    <Select
                                                        labelId="jeniskelamin"
                                                        id="demo-simple-select"
                                                        required
                                                        value={jenisKelamin}
                                                        label="Jenis Kelamin"
                                                        onChange={
                                                            handleJKChange
                                                        }
                                                    >
                                                        <MenuItem
                                                            value={"Laki-laki"}
                                                        >
                                                            Laki-laki
                                                        </MenuItem>
                                                        <MenuItem
                                                            value={"Perempuan"}
                                                        >
                                                            Perempuan
                                                        </MenuItem>
                                                    </Select>
                                                </FormControl>
                                            </Box>
                                        </div>

                                        <div className="flex flex-col mt-3 gap-2">
                                            <p className="text-xs text-gray-700">
                                                Isi Alamatmu Sesuai KTP
                                            </p>
                                            <Autocomplete
                                                id="provinsiD"
                                                value={provD}
                                                options={daftarProvinsiD}
                                                getOptionLabel={(option) =>
                                                    option.nama
                                                }
                                                required
                                                onChange={handleProvDChange}
                                                renderInput={(params) => (
                                                    <TextField
                                                        {...params}
                                                        label="Provinsi"
                                                    />
                                                )}
                                            />
                                            <Autocomplete
                                                id="kabupatenD"
                                                value={kabD}
                                                options={daftarKabupatenD}
                                                getOptionLabel={(option) =>
                                                    option.nama
                                                }
                                                onChange={handleKabDchange}
                                                required
                                                renderInput={(params) => (
                                                    <TextField
                                                        {...params}
                                                        label="Kabupaten"
                                                    />
                                                )}
                                            />

                                            <Autocomplete
                                                id="kecamatanD"
                                                value={kecD}
                                                required
                                                options={daftarKecD}
                                                getOptionLabel={(option) =>
                                                    option.nama
                                                }
                                                onChange={handleKecDchange}
                                                renderInput={(params) => (
                                                    <TextField
                                                        {...params}
                                                        label="Kecamatan"
                                                    />
                                                )}
                                            />
                                            <Autocomplete
                                                id="desaD"
                                                value={kelD}
                                                options={daftarDesaD}
                                                getOptionLabel={(option) =>
                                                    option.nama
                                                }
                                                required
                                                onChange={(event, value) => {
                                                    setKelD(value);
                                                    setData("desa", value.kode);
                                                }}
                                                renderInput={(params) => (
                                                    <TextField
                                                        {...params}
                                                        label="Desa"
                                                    />
                                                )}
                                            />
                                        </div>
                                        <div className="flex flex-col mt-3 gap-2">
                                            <p className="text-xs text-gray-700">
                                                Isi sesui dengan alamat tempat
                                                tinggalmu sekarang
                                            </p>
                                            <Autocomplete
                                                id="provinsi"
                                                value={prov}
                                                options={daftarProvinsi}
                                                getOptionLabel={(option) =>
                                                    option.nama
                                                }
                                                required
                                                onChange={handleProvChange}
                                                renderInput={(params) => (
                                                    <TextField
                                                        {...params}
                                                        label="Provinsi"
                                                    />
                                                )}
                                            />
                                            <Autocomplete
                                                id="kabupaten"
                                                value={kab}
                                                options={daftarKabupaten}
                                                getOptionLabel={(option) =>
                                                    option.nama
                                                }
                                                required
                                                onChange={handleKabchange}
                                                renderInput={(params) => (
                                                    <TextField
                                                        {...params}
                                                        label="Kabupaten"
                                                    />
                                                )}
                                            />

                                            <Autocomplete
                                                id="Kecamatan"
                                                value={kec}
                                                options={daftarKec}
                                                getOptionLabel={(option) =>
                                                    option.nama
                                                }
                                                required
                                                onChange={handleKecchange}
                                                renderInput={(params) => (
                                                    <TextField
                                                        {...params}
                                                        label="Kecamatan"
                                                    />
                                                )}
                                            />
                                            <Autocomplete
                                                id="desa"
                                                value={kel}
                                                options={daftarDesa}
                                                getOptionLabel={(option) =>
                                                    option.nama
                                                }
                                                required
                                                onChange={(event, value) => {
                                                    setKel(value);
                                                    setData(
                                                        "desa_now",
                                                        value.kode
                                                    );
                                                }}
                                                renderInput={(params) => (
                                                    <TextField
                                                        {...params}
                                                        label="Desa"
                                                    />
                                                )}
                                            />
                                        </div>
                                        <div className="flex flex-col mt-3 gap-2">
                                            <p className="text-xs text-gray-700">
                                                Isi sesuai dengan data
                                                akademikmu
                                            </p>
                                            <Autocomplete
                                                id="prodi"
                                                value={prodMhs}
                                                options={prodi_data}
                                                getOptionLabel={(option) =>
                                                    option.label
                                                }
                                                required
                                                onChange={(event, value) => {
                                                    setProdiMhs(value);
                                                    setData(
                                                        "id_prodi",
                                                        value.id
                                                    );
                                                }}
                                                renderInput={(params) => (
                                                    <TextField
                                                        {...params}
                                                        label="Prodi"
                                                    />
                                                )}
                                            />
                                            <Autocomplete
                                                id="nilai_micro"
                                                value={nilaiMicro}
                                                options={data_nilai}
                                                getOptionLabel={(option) =>
                                                    option.label
                                                }
                                                required
                                                onChange={(event, value) => {
                                                    setNilaiMicro(value);
                                                    setData(
                                                        "nilai_microteaching",
                                                        value.id
                                                    );
                                                }}
                                                renderInput={(params) => (
                                                    <TextField
                                                        {...params}
                                                        label="Nilai Micro Teaching"
                                                    />
                                                )}
                                            />
                                            <TextField
                                                type="number"
                                                label="IPK"
                                                value={ipk}
                                                required
                                                onChange={(event, value) => {
                                                    setIPK(event.target.value);
                                                    setData(
                                                        "ipk",
                                                        event.target.value
                                                    );
                                                }}
                                            />
                                            <InputError
                                                message={errors.khs}
                                                className="mt-2"
                                            />

                                            <InputLabel id="khs">
                                                KHS/Transkrip Nilai
                                            </InputLabel>

                                            <p className="text-xs text-gray-700">
                                                Khs harus ada nim dan nilai
                                                micro teaching
                                            </p>

                                            {data_mahasiswa.khs && (
                                                <div className="flex w-full">
                                                    <a
                                                        className="px-2 bg-green-200/35 rounded-md py-2 text-sm"
                                                        href={`/storage/${data_mahasiswa.khs}`}
                                                        target="_blank"
                                                    >
                                                        Khs_{auth.user.username}
                                                    </a>
                                                </div>
                                            )}

                                            <input
                                                className="flex w-full"
                                                labelId="khs"
                                                type="file"
                                                onChange={(e) =>
                                                    setData(
                                                        "khs",
                                                        e.target.files[0]
                                                    )
                                                }
                                            />
                                            {progress && (
                                                <progress
                                                    value={progress.percentage}
                                                    max="100"
                                                >
                                                    {progress.percentage}%
                                                </progress>
                                            )}
                                        </div>
                                    </div>
                                    <PrimaryButton className="mt-4">
                                        Save
                                    </PrimaryButton>
                                </form>
                            </Box>
                        </div>
                    </section>
                    <div className="flex bg-white rounded-md mt-4 p-4">
                        <UpdateProfileInformation />
                    </div>
                    <div className="flex bg-white rounded-md mt-4 p-4">
                        <UpdatePasswordForm />
                    </div>
                    <div className="flex bg-white rounded-md mt-4 p-4">
                        <DeleteUserForm />
                    </div>
                    <div className="h-96"></div>
                </div>
            </main>
            <footer className="z-[100] ">
                <Box
                    sx={{
                        width: "100%",
                        position: "fixed",
                        bottom: 0,
                        boxShadow: "10",
                    }}
                    className="shadow-md "
                >
                    <BottomNavigation
                        showLabels
                        value={value}
                        onChange={(event, newValue) => {
                            setValue(newValue);
                        }}
                    >
                        <BottomNavigationAction
                            label="PPKPM"
                            onClick={() => router.visit("/")}
                            icon={<PlaceIcon />}
                        />
                        <BottomNavigationAction
                            color="primary"
                            label="Lamaran ku"
                            onClick={() => router.visit("lamaranku")}
                            icon={<SubjectIcon />}
                        />
                        <BottomNavigationAction
                            color="primary"
                            label="Nilai"
                            // onClick={() => router.visit("lamaranku")}
                            icon={<PiListStarBold />}
                        />
                        <BottomNavigationAction
                            label="Profil"
                            icon={<PermIdentityIcon />}
                        />
                    </BottomNavigation>
                </Box>
            </footer>
        </ThemeProvider>
    );
};

export default Profil;
