import { Alert, Button, Chip, Snackbar } from "@mui/material";

import { styled, ThemeProvider, createTheme } from "@mui/material/styles";
import React, { useEffect, useState } from "react";
import { Head, router } from "@inertiajs/react";
import Header from "@/Components/frontpage/Header";
import Footer from "@/Components/frontpage/Footer";
import { ThreeDot } from "react-loading-indicators";
import { data } from "autoprefixer";

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

const Nilai = ({ access_token, auth }) => {
    const [responseError, setResponseError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [dataMahasiswa, setDataMahasiswa] = useState([]);
    const [notify, setNotify] = useState(false);
    const [notifMsg, setNotifMsg] = useState(null);
    const [notifyStatus, setNotifyStatus] = useState("default");

    const handleCloseNotify = () => {
        setNotify(false);
    };

    const getNilai = async () => {
        try {
            setLoading(true);
            const response = await axios.get("/api/student/nilai", {
                headers: {
                    Authorization: `Bearer ${access_token}`,
                },
                params: {
                    nim: auth?.user?.username,
                },
            });

            setDataMahasiswa(response?.data?.data?.mahasiswa);

            console.log(response);
        } catch (err) {
            setResponseError(err.message);
            setLoading(false);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getNilai();
    }, []);

    const printCertificate = async () => {
        console.log("start");
        if (dataMahasiswa?.open_print_certificate == 0) {
            setNotifMsg("Cetak Certifikat Belum dibuka");
            setNotifyStatus("error");
            setNotify(true);

            return;
        }
        try {
            setLoading(true);
            const response = await axios.post(
                `/api/certificate/download`,
                { nim: auth?.user?.username }, // Pass the request body here
                {
                    responseType: "blob", // Set responseType in Axios config
                }
            );

            const blob = new Blob([response.data], {
                type: "application/pdf", // Correct MIME type for PDF
            });
            if (response.headers["content-type"] === "application/pdf") {
                let filename = "";
                const downloadUrl = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = downloadUrl;

                const contentDisposition =
                    response.headers["content-disposition"];

                if (contentDisposition) {
                    const match =
                        contentDisposition.match(/filename="?([^"]+)"?/);
                    console.log("match ", match);
                    if (match) {
                        filename = match[1];
                    }
                }

                a.download = filename;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(downloadUrl);
            }else{
                throw new Error('Internal Server Error')
            }
        } catch (err) {
            console.log(err);
            setLoading(false);

            setResponseError(err.message || "Something went wrong.");
            setNotify(true);
            setNotifMsg(err.message || "Something went wrong");
            setNotifyStatus('error');
            if (err.response && err.response.data) {
                const errorText = new TextDecoder().decode(err.response.data);
                console.error("Error response text:", errorText);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <ThemeProvider theme={theme}>
            <Head title="Nilai PPKPM" />
            <Header />
            <Snackbar
                open={notify}
                anchorOrigin={{
                    vertical: "top",
                    horizontal: "right",
                }}
                autoHideDuration={2000}
                onClose={handleCloseNotify}
            >
                <Alert
                    onClose={handleCloseNotify}
                    severity={notifyStatus}
                    variant="filled"
                    sx={{ width: "100%" }}
                >
                    {notifMsg && notifMsg}
                </Alert>
            </Snackbar>
            {loading && (
                <div className="absolute z-10 w-full h-full flex items-center justify-center bg-white/70">
                    <ThreeDot color="#4F61E3" size="medium" />
                </div>
            )}

            <main className="flex justify-center flex-col items-center w-full px-6  lg:px-10 z-[0]">
                <div className="flex justify-center items-center w-full mt-4 flex-col">
                    <div className="h-5"></div>

                    <section className="bg-white w-full rounded-md px-4 pt-3 max-w-5xl">
                        <div className="py-5">
                            {dataMahasiswa && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 lg:grid-cols-3">
                                    {(dataMahasiswa.cluster_kegiatan ===
                                        "PPKPM" ||
                                        dataMahasiswa.cluster_kegiatan ===
                                            "PPL") && (
                                        <div className="flex flex-col border p-3 rounded-md w-full gap-y-3">
                                            <h3 className="font-semibold text-md">
                                                {dataMahasiswa.nama_tempat_ppl}
                                            </h3>
                                            <ul className="flex flex-wrap justify-between gap-3">
                                                <li>
                                                    <p className="font-normal">
                                                        Nilai Pamong
                                                    </p>
                                                    <p>
                                                        {
                                                            dataMahasiswa.nilai_pamong
                                                        }
                                                    </p>
                                                </li>
                                                <li>
                                                    <p className="font-normal">
                                                        Nilai Supervisor
                                                    </p>
                                                    <p>
                                                        {
                                                            dataMahasiswa.nilai_supervisor_ppl
                                                        }
                                                    </p>
                                                </li>
                                                <li>
                                                    <p className="font-normal">
                                                        Total
                                                    </p>
                                                    <p>
                                                        {dataMahasiswa.SM_PPL}
                                                    </p>
                                                </li>
                                            </ul>
                                        </div>
                                    )}
                                    {(dataMahasiswa.cluster_kegiatan ===
                                        "PPKPM" ||
                                        dataMahasiswa.cluster_kegiatan ===
                                            "KPM") && (
                                        <div className="flex flex-col border p-3 rounded-md w-full gap-y-3">
                                            <h3 className="font-semibold text-md">
                                                {dataMahasiswa.nama_tempat_kpm}
                                            </h3>
                                            <ul className="flex flex-wrap justify-between gap-3">
                                                <li>
                                                    <p className="font-normal">
                                                        Nilai Keuchik
                                                    </p>
                                                    <p>
                                                        {
                                                            dataMahasiswa.nilai_keuchik
                                                        }
                                                    </p>
                                                </li>
                                                <li>
                                                    <p className="font-normal">
                                                        Nilai Supervisor
                                                    </p>
                                                    <p>
                                                        {
                                                            dataMahasiswa.nilai_supervisor_kpm
                                                        }
                                                    </p>
                                                </li>
                                                <li>
                                                    <p className="font-normal">
                                                        Total
                                                    </p>
                                                    <p>
                                                        {dataMahasiswa.SM_KPM}
                                                    </p>
                                                </li>
                                            </ul>
                                        </div>
                                    )}

                                    <div className="flex flex-col border p-3 rounded-md w-full gap-y-3">
                                        <h3 className="font-semibold text-md">
                                            Nilai Akhir
                                        </h3>
                                        <ul className="flex flex-wrap justify-between gap-3">
                                            <li>
                                                <p className="font-normal">
                                                    Nilai PPKPM
                                                </p>
                                                <p>
                                                    {dataMahasiswa.nilai_ppkpm}
                                                </p>
                                            </li>
                                            <li>
                                                <p className="font-normal">
                                                    Huruf
                                                </p>
                                                <p>
                                                    {
                                                        dataMahasiswa.index_nilai_ppkpm
                                                    }
                                                </p>
                                            </li>
                                            <li>
                                                <p className="font-normal">
                                                    Status
                                                </p>
                                                <Chip
                                                    color={`${
                                                        dataMahasiswa.nilai_ppkpm >
                                                        68
                                                            ? "success"
                                                            : "error"
                                                    }`}
                                                    label={`${
                                                        dataMahasiswa.nilai_ppkpm >
                                                        68
                                                            ? "Lulus"
                                                            : "Tidak Lulus"
                                                    }`}
                                                />
                                            </li>
                                        </ul>
                                        <div>
                                            {dataMahasiswa.nilai_ppkpm > 68 && (
                                                <Button
                                                    sx={{
                                                        textTransform:
                                                            "capitalize",
                                                        color: "white",
                                                    }}
                                                    disableElevation
                                                    size="small"
                                                    variant="contained"
                                                    onClick={(e) =>
                                                        printCertificate()
                                                    }
                                                >
                                                    Cetak Sertifikat
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>

                    <div className="h-72 w-0"></div>
                </div>
            </main>
            <Footer currentTab={3} />
        </ThemeProvider>
    );
};

export default Nilai;
