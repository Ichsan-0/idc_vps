import React from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import {
    Button,
    capitalize,
    InputBase,
    InputLabel,
    MenuItem,
    Select,
    styled,
} from "@mui/material";

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
import { useState } from "react";
import { router, useForm } from "@inertiajs/react";

function DetailPelamarPPLTable({ pelamarppl }) {
    const [status, setStatus] = useState(pelamarppl.status);
    const { data, setData } = useForm({
        status: status,
    });

    function submit(e) {
        e.preventDefault();
        router.post(`/admin/handlelamaran/${pelamarppl.id_lamaran}`, {
            _method: "patch",
            status: data.status,
        });
    }

    const handleChange = (event) => {
        setStatus(event.target.value);
        setData("status", status);
    };
    return (
        <>
            <TableContainer component={Paper} elevation={1}>
                <Table>
                    <TableBody>
                        <TableRow>
                            <TableCell
                                sx={{ whiteSpace: "nowrap", width: "1%" }}
                            >
                                Nama Mahasiswa
                            </TableCell>
                            <TableCell
                                align="center"
                                sx={{ whiteSpace: "nowrap", width: "1%" }}
                            >
                                :
                            </TableCell>
                            <TableCell>{pelamarppl.nama_mahasiswa}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell
                                sx={{ whiteSpace: "nowrap", width: "1%" }}
                            >
                                NIM
                            </TableCell>
                            <TableCell
                                sx={{ whiteSpace: "nowrap", width: "1%" }}
                                align="center"
                            >
                                :
                            </TableCell>
                            <TableCell>{pelamarppl.nim}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell
                                sx={{ whiteSpace: "nowrap", width: "1%" }}
                            >
                                Prodi
                            </TableCell>
                            <TableCell
                                sx={{ whiteSpace: "nowrap", width: "1%" }}
                                align="center"
                            >
                                :
                            </TableCell>
                            <TableCell>{pelamarppl.nama_prodi}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell
                                sx={{ whiteSpace: "nowrap", width: "1%" }}
                            >
                                Jenis Kelamin
                            </TableCell>
                            <TableCell
                                sx={{ whiteSpace: "nowrap", width: "1%" }}
                                align="center"
                            >
                                :
                            </TableCell>
                            <TableCell>{pelamarppl.jk}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell
                                sx={{ whiteSpace: "nowrap", width: "1%" }}
                            >
                                Nama Tempat PPL
                            </TableCell>
                            <TableCell
                                sx={{ whiteSpace: "nowrap", width: "1%" }}
                                align="center"
                            >
                                :
                            </TableCell>
                            <TableCell>{pelamarppl.nama_tempat_ppl}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell
                                sx={{ whiteSpace: "nowrap", width: "1%" }}
                            >
                                Lowongan
                            </TableCell>
                            <TableCell
                                sx={{ whiteSpace: "nowrap", width: "1%" }}
                                align="center"
                            >
                                :
                            </TableCell>
                            <TableCell>
                                {pelamarppl.nama_lowongan_ppl}
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell
                                sx={{ whiteSpace: "nowrap", width: "1%" }}
                            >
                                Kuota
                            </TableCell>
                            <TableCell
                                sx={{ whiteSpace: "nowrap", width: "1%" }}
                                align="center"
                            >
                                :
                            </TableCell>
                            <TableCell>{pelamarppl.kuota}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell
                                sx={{ whiteSpace: "nowrap", width: "1%" }}
                            >
                                Terisi
                            </TableCell>
                            <TableCell
                                sx={{ whiteSpace: "nowrap", width: "1%" }}
                                align="center"
                            >
                                :
                            </TableCell>
                            <TableCell>{pelamarppl.terisi}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell
                                sx={{ whiteSpace: "nowrap", width: "1%" }}
                            >
                                Status
                            </TableCell>
                            <TableCell
                                sx={{ whiteSpace: "nowrap", width: "1%" }}
                                align="center"
                            >
                                :
                            </TableCell>
                            <TableCell>
                                <Select
                                    labelId="status"
                                    id="status"
                                    value={status}
                                    label="Status"
                                    onChange={handleChange}
                                    input={<BootstrapInput />}
                                >
                                    <MenuItem value={"dilamar"}>
                                        dilamar
                                    </MenuItem>
                                    <MenuItem value={"terima"}>terima</MenuItem>
                                    <MenuItem value={"tolak"}>tolak</MenuItem>
                                </Select>
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
        </>
    );
}

export default DetailPelamarPPLTable;
