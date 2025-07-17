import OperatorSekolahLayout from "@/Layouts/OperatorSekolahLayout";
import { Head, Link } from "@inertiajs/react";
import { NavigateNext } from "@mui/icons-material";
import { Breadcrumbs, Button } from "@mui/material";
import axios from "axios";
import React from "react";
import { useState } from "react";
import { ThreeDot } from "react-loading-indicators";

function DetailKepsekPamong({ data, base_url }) {
    const [loading, setLoading] = useState(false);
    const [responseError, setResponseError] = useState(null);


    const downloadCertificate = async () => {
        try {
            setLoading(true);
            const response = await axios.post(
                "/api/certificate/teacher/download",
                {
                    id:data?.id,
                },
                {
                    responseType: "blob",
                }
            );

            const blob = new Blob([response.data], {
                type: "application/pdf",
            });

            const downloadUrl = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = downloadUrl;
            let filename = "";

            const contentDisposition = response.headers["content-disposition"];
    

            if (contentDisposition) {
                const match = contentDisposition.match(/filename="?([^"]+)"?/);
                if (match) {
                    filename = match[1];
                }
            }

            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(downloadUrl);
        } catch (err) {
            setLoading(false);
        } finally {
            setLoading(false);
        }
    };


    return (
        <OperatorSekolahLayout>
            <Head title={`${data.name || "Detail"}`} />
            <section className="flex flex-col gap-y-3">
                <Breadcrumbs label="breadcrumbs" separator={<NavigateNext />}>
                    <Link href="/operator-sekolah/data/kepsek-pamong">
                        Kepsek Pamong
                    </Link>
                    <Link
                        href="/operator-sekolah/kepsek-pamong"
                        className="text-primary"
                    >
                        Detail
                    </Link>
                </Breadcrumbs>
                {loading && (
                    <div className="absolute z-10 w-full h-full flex items-center justify-center bg-white/70">
                        <ThreeDot color="#4F61E3" size="medium" />
                    </div>
                )}
                <div className="p-5 bg-white border ">
                    <table className="table-auto">
                        <tbody>
                            <tr>
                                <td className="pr-3 text-right align-top font-semibold">
                                    Nama
                                </td>
                                <td className="mr-4 text-left align-top">
                                    {data?.name}
                                </td>
                            </tr>
                            <tr>
                                <td className="pr-3 text-right align-top font-semibold">
                                    Nama di Buku Rekening
                                </td>
                                <td className="mr-4 text-left align-top">
                                    {data?.nama_di_buku_rekening}
                                </td>
                            </tr>
                            <tr>
                                <td className="pr-3 text-right align-top font-semibold">
                                    Pangkat & Golongan
                                </td>
                                <td className="mr-4 text-left align-top">
                                    {data?.pangkat_dan_golongan}
                                </td>
                            </tr>
                            <tr>
                                <td className="pr-3 text-right align-top font-semibold">
                                    NIP
                                </td>
                                <td className="mr-4 text-left align-top">
                                    {data?.nip}
                                </td>
                            </tr>
                            <tr>
                                <td className="pr-3 text-right align-top font-semibold">
                                    Jabatan
                                </td>
                                <td className="mr-4 text-left align-top">
                                    {data?.jabatan}
                                </td>
                            </tr>
                            <tr>
                                <td className="pr-3 text-right align-top font-semibold">
                                    Nama Sekolah
                                </td>
                                <td className="mr-4 text-left align-top">
                                    {data?.nama_sekolah}
                                </td>
                            </tr>
                            <tr>
                                <td className="pr-3 text-right align-top font-semibold">
                                    Nama Bank
                                </td>
                                <td className="mr-4 text-left align-top">
                                    {data?.nama_bank}
                                </td>
                            </tr>
                            <tr>
                                <td className="pr-3 text-right align-top font-semibold">
                                    No Rekening
                                </td>
                                <td className="mr-4 text-left align-top">
                                    {data?.no_rekening}
                                </td>
                            </tr>
                            <tr>
                                <td className="pr-3 text-right align-top font-semibold">
                                    No NPWP
                                </td>
                                <td className="mr-4 text-left align-top">
                                    {data?.no_npwp}
                                </td>
                            </tr>
                            <tr>
                                <td className="pr-3 text-right align-top font-semibold">
                                    Dokumen
                                </td>
                                <td className="mr-4 text-left align-top">
                                    <a
                                        target="_blank"
                                        href={`${base_url}/storage/${data?.link_document.replace(
                                            "public/",
                                            ""
                                        )}`}
                                        className="px-2 bg-primary text-white py-1 rounded-md"
                                    >
                                        dokumen
                                    </a>
                                </td>
                            </tr>
                            <tr>
                                <td className="pr-3 text-right align-top font-semibold">
                                    Sertifikat
                                </td>
                                <td className="mr-4 text-left align-top py-2">
                                    <Button
                                        onClick={downloadCertificate}
                                        size="small"
                                        sx={{ textTransform: "capitalize" }}
                                        variant="contained"
                                        disableElevation
                                        color="primary"
                                    >
                                        Cetak Sertifikat
                                    </Button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>
        </OperatorSekolahLayout>
    );
}

export default DetailKepsekPamong;
