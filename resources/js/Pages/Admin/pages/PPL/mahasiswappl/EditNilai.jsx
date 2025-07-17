import React from "react";

import {
    Alert,
    Button,
    IconButton,
    InputBase,
    Snackbar,
    Table,
    TableRow,
    TextField,
    styled,
} from "@mui/material";
import { FiEdit2 } from "react-icons/fi";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import Paper from "@mui/material/Paper";
import { Head, Link, router, useForm } from "@inertiajs/react";
import { useState } from "react";
import { useEffect } from "react";
import Header from "@/Components/admin/Header/Header";
import Sidebar from "@/Components/admin/Sidebar/Sidebar";

const BootstrapInput = styled(InputBase)(({ theme }) => ({
    "label + &": {
        marginTop: theme.spacing(3),
    },
    "& .MuiInputBase-input": {
        borderRadius: 4,
        position: "relative",
        backgroundColor: theme.palette.background.paper,
        border: "1px solid #ced4da",
        fontSize: 16,
        padding: "10px 26px 10px 12px",
        transition: theme.transitions.create(["border-color", "box-shadow"]),
        // Use the system font instead of the default Roboto font.
        fontFamily: [
            "-apple-system",
            "BlinkMacSystemFont",
            '"Segoe UI"',
            "Roboto",
            '"Helvetica Neue"',
            "Arial",
            "sans-serif",
            '"Apple Color Emoji"',
            '"Segoe UI Emoji"',
            '"Segoe UI Symbol"',
        ].join(","),
        "&:focus": {
            borderRadius: 4,
            borderColor: "#80bdff",
            boxShadow: "0 0 0 0.2rem rgba(0,123,255,.25)",
        },
    },
}));

const EditNilai = ({ mahasiswa, base_url, flash }) => {
    const [nilai_supervisor_ppl, setNilaiSupervisorPPL] = useState(
        mahasiswa["nilai_supervisor_ppl"]
            ? mahasiswa["nilai_supervisor_ppl"]
            : null
    );

    const [nilaiPamong, setNilaiPamong] = useState(
        mahasiswa["nilai_pamong"] ? mahasiswa["nilai_pamong"] : null
    );
    const { data, setData, post, progress, errors } = useForm({
        nilai_supervisor_ppl: nilai_supervisor_ppl,
        nilai_pamong: nilaiPamong,
    });

    const [detailInstrument, setDetailInstrument] = useState(() => {
        return mahasiswa?.link_instrument_penilaian || null;
    });

    const onChangeFile = (file) => {
        setDetailInstrument(file[0]);
    };

    function submit(e) {
        e.preventDefault();
        console.log(mahasiswa.id_mahasiswa);
        router.post(`/admin/updatenilai/${mahasiswa.id_mahasiswa}`, {
            _method: "patch",
            nilai_supervisor_ppl: data.nilai_supervisor_ppl,
            nilai_pamong: data.nilai_pamong,
            file: detailInstrument,
        });
    }

    useEffect(() => {
        console.log(base_url);
    }, [base_url]);

    // console.log(tempat_ppl);
    return (
        <section className="main flex">
            <div className="sidebarWrapper flex">
                <Sidebar tabId={3} />
            </div>
            <div className="flex w-full ml-72 flex-col">
                <Header></Header>
                <Head title="Edit Nilai Mahasiswa" />
                <div className="space"></div>
                <div className="px-3 max-w-3xl">
                    <TableContainer component={Paper} elevation={1}>
                        <Table>
                            <TableBody>
                                <TableRow>
                                    <TableCell
                                        sx={{
                                            whiteSpace: "nowrap",
                                            width: "1%",
                                        }}
                                    >
                                        Nama Mahasiswa
                                    </TableCell>
                                    <TableCell
                                        align="center"
                                        sx={{
                                            whiteSpace: "nowrap",
                                            width: "1%",
                                        }}
                                    >
                                        :
                                    </TableCell>
                                    <TableCell>
                                        {mahasiswa["nama_mahasiswa"]}
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell
                                        sx={{
                                            whiteSpace: "nowrap",
                                            width: "1%",
                                        }}
                                    >
                                        NIM
                                    </TableCell>
                                    <TableCell
                                        sx={{
                                            whiteSpace: "nowrap",
                                            width: "1%",
                                        }}
                                        align="center"
                                    >
                                        :
                                    </TableCell>
                                    <TableCell>{mahasiswa["nim"]}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell
                                        sx={{
                                            whiteSpace: "nowrap",
                                            width: "1%",
                                        }}
                                    >
                                        No HP/WA
                                    </TableCell>
                                    <TableCell
                                        sx={{
                                            whiteSpace: "nowrap",
                                            width: "1%",
                                        }}
                                        align="center"
                                    >
                                        :
                                    </TableCell>
                                    <TableCell>
                                        {mahasiswa["no_hp_wa"]}
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell
                                        sx={{
                                            whiteSpace: "nowrap",
                                            width: "1%",
                                        }}
                                    >
                                        Prodi
                                    </TableCell>
                                    <TableCell
                                        sx={{
                                            whiteSpace: "nowrap",
                                            width: "1%",
                                        }}
                                        align="center"
                                    >
                                        :
                                    </TableCell>
                                    <TableCell>
                                        {mahasiswa["nama_prodi"]}
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell
                                        sx={{
                                            whiteSpace: "nowrap",
                                            width: "1%",
                                        }}
                                    >
                                        Nama Tempat PPL
                                    </TableCell>
                                    <TableCell
                                        sx={{
                                            whiteSpace: "nowrap",
                                            width: "1%",
                                        }}
                                        align="center"
                                    >
                                        :
                                    </TableCell>
                                    <TableCell>
                                        {mahasiswa["nama_sekolah"]}
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell
                                        sx={{
                                            whiteSpace: "nowrap",
                                            width: "1%",
                                        }}
                                    >
                                        Lowongan
                                    </TableCell>
                                    <TableCell
                                        sx={{
                                            whiteSpace: "nowrap",
                                            width: "1%",
                                        }}
                                        align="center"
                                    >
                                        :
                                    </TableCell>
                                    <TableCell>
                                        {`PPL ${mahasiswa["nama_lowongan"]}`}
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell
                                        sx={{
                                            whiteSpace: "nowrap",
                                            width: "1%",
                                        }}
                                    >
                                        Nilai Supervisor
                                    </TableCell>
                                    <TableCell
                                        sx={{
                                            whiteSpace: "nowrap",
                                            width: "1%",
                                        }}
                                        align="center"
                                    >
                                        :
                                    </TableCell>
                                    <TableCell>
                                        <TextField
                                            input={<BootstrapInput />}
                                            type="text"
                                            inputMode="numeric"
                                            onChange={(e, value) => {
                                                setNilaiSupervisorPPL(
                                                    e.target.value
                                                );
                                                setData(
                                                    "nilai_supervisor_ppl",
                                                    e.target.value
                                                );
                                            }}
                                            value={nilai_supervisor_ppl}
                                            placeholder="Isi nilai Supervisor"
                                        >
                                            {mahasiswa.nama_lowongan_ppl}
                                        </TextField>
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell
                                        sx={{
                                            whiteSpace: "nowrap",
                                            width: "1%",
                                        }}
                                    >
                                        Nilai Pamong
                                    </TableCell>
                                    <TableCell
                                        sx={{
                                            whiteSpace: "nowrap",
                                            width: "1%",
                                        }}
                                        align="center"
                                    >
                                        :
                                    </TableCell>
                                    <TableCell>
                                        <TextField
                                            input={<BootstrapInput />}
                                            type="text"
                                            inputMode="numeric"
                                            onChange={(e, value) => {
                                                setNilaiPamong(e.target.value);
                                                setData(
                                                    "nilai_pamong",
                                                    e.target.value
                                                );
                                            }}
                                            value={nilaiPamong}
                                            placeholder="Isi nilai supervisor"
                                        ></TextField>
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell
                                        sx={{
                                            whiteSpace: "nowrap",
                                            width: "1%",
                                        }}
                                    >
                                        Instrument Penilaian
                                    </TableCell>
                                    <TableCell
                                        sx={{
                                            whiteSpace: "nowrap",
                                            width: "1%",
                                        }}
                                        align="center"
                                    >
                                        :
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <label
                                                    class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                                                    for="file_input"
                                                >
                                                    Upload file
                                                </label>
                                                <input
                                                    class="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
                                                    aria-describedby="file_input_help"
                                                    id="file_input"
                                                    type="file"
                                                    accept=".pdf"
                                                    onChange={(e) =>
                                                        onChangeFile(
                                                            e.target.files
                                                        )
                                                    }
                                                />
                                                <p
                                                    class="mt-1 text-sm text-gray-500 dark:text-gray-300"
                                                    id="file_input_help"
                                                >
                                                    .pdf
                                                </p>
                                            </div>
                                            {mahasiswa.link_instrument_penilaian && (
                                                <a
                                                    target="_blank"
                                                    className="flex bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-500/85"
                                                    href={`${base_url}/storage/${mahasiswa.link_instrument_penilaian}`}
                                                >
                                                    lihat
                                                </a>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <div className="mt-3">
                        <Button
                            sx={{ textTransform: "capitalize" }}
                            variant="contained"
                            onClick={submit}
                        >
                            Simpan
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default EditNilai;
