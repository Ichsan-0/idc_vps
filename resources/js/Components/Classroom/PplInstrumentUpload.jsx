import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import {
    CheckCircle2,
    ExternalLink,
    FileCheck2,
    FileText,
    RefreshCw,
    UploadCloud,
    XCircle,
} from "lucide-react";

const formatSize = (bytes) => {
    if (!bytes) return "0 KB";

    if (bytes >= 1024 * 1024) {
        return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    }

    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
};

export default function PplInstrumentUpload({
    baseUrl = "",
    initialInstrument = null,
}) {
    const [instrument, setInstrument] = useState(initialInstrument);
    const [selectedFile, setSelectedFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const inputRef = useRef(null);

    useEffect(() => {
        setInstrument(initialInstrument);
    }, [initialInstrument]);

    const handleFileChange = (event) => {
        const file = event.target.files?.[0] || null;

        setError(null);
        setSuccess(null);

        if (!file) {
            setSelectedFile(null);
            return;
        }

        const isPdf =
            file.type === "application/pdf" || /\.pdf$/i.test(file.name);

        if (!isPdf) {
            setError("Instrumen penilaian harus berformat PDF.");
            setSelectedFile(null);
            event.target.value = "";
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            setError("Ukuran berkas maksimal 2 MB.");
            setSelectedFile(null);
            event.target.value = "";
            return;
        }

        setSelectedFile(file);
    };

    const handleUpload = async () => {
        if (!selectedFile) return;

        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const formData = new FormData();
            formData.append("instrument", selectedFile);

            const response = await axios.post(
                `${baseUrl}/api/student/classroom-ppl/instrument`,
                formData
            );

            setInstrument(response.data?.data ?? null);
            setSelectedFile(null);
            setSuccess(
                response.data?.message ||
                    "Instrumen penilaian berhasil diunggah."
            );

            if (inputRef.current) {
                inputRef.current.value = "";
            }
        } catch (err) {
            const validationError =
                err.response?.data?.errors?.instrument?.[0];

            setError(
                validationError ||
                    err.response?.data?.message ||
                    "Gagal mengunggah instrumen penilaian."
            );
        } finally {
            setLoading(false);
        }
    };

    const fileUrl =
        instrument?.url ||
        (instrument?.link
            ? `${baseUrl}/storage/${String(instrument.link).replace(
                  /^public\//,
                  ""
              )}`
            : null);

    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-3">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                        <FileCheck2 className="h-5 w-5" />
                    </span>
                    <div>
                        <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-sm font-bold text-slate-800">
                                Instrumen Penilaian dari Pamong
                            </h3>
                            <span
                                className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ring-1 ring-inset ${
                                    instrument
                                        ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                                        : "bg-amber-50 text-amber-700 ring-amber-200"
                                }`}
                            >
                                {instrument ? "Sudah diunggah" : "Belum diunggah"}
                            </span>
                        </div>
                        <p className="mt-1 max-w-2xl text-xs leading-relaxed text-slate-500">
                            Unggah berkas instrumen penilaian yang diberikan
                            guru pamong (PDF, maks. 2 MB). Berkas ini otomatis
                            dapat dilihat oleh dosen supervisor.
                        </p>
                    </div>
                </div>

                {fileUrl && (
                    <a
                        href={fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 shadow-sm transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600"
                    >
                        <ExternalLink className="h-3.5 w-3.5" />
                        Lihat Berkas
                    </a>
                )}
            </div>

            <div className="mt-4 flex flex-col gap-3 rounded-xl border border-dashed border-slate-300 bg-slate-50/60 p-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-center gap-2.5">
                    <FileText className="h-4 w-4 shrink-0 text-slate-400" />
                    <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-slate-700">
                            {selectedFile
                                ? selectedFile.name
                                : instrument?.nama_file ||
                                  "Belum ada berkas dipilih"}
                        </p>
                        <p className="text-[11px] text-slate-400">
                            {selectedFile
                                ? `${formatSize(
                                      selectedFile.size
                                  )} · siap diunggah`
                                : instrument
                                ? "Berkas saat ini"
                                : "PDF · maks. 2 MB"}
                        </p>
                    </div>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                    <label
                        htmlFor="ppl-instrument-input"
                        className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 shadow-sm transition hover:border-brand-300 hover:text-brand-600"
                    >
                        <UploadCloud className="h-3.5 w-3.5" />
                        {instrument ? "Ganti Berkas" : "Pilih Berkas"}
                    </label>
                    <input
                        ref={inputRef}
                        id="ppl-instrument-input"
                        type="file"
                        accept=".pdf,application/pdf"
                        onChange={handleFileChange}
                        disabled={loading}
                        className="sr-only"
                    />

                    {selectedFile && (
                        <button
                            type="button"
                            onClick={handleUpload}
                            disabled={loading}
                            className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-[#06359f] px-3.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#042574] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {loading ? (
                                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                                <UploadCloud className="h-3.5 w-3.5" />
                            )}
                            {loading ? "Mengunggah..." : "Unggah"}
                        </button>
                    )}
                </div>
            </div>

            {error && (
                <div className="mt-3 flex items-start gap-2 rounded-xl border border-rose-100 bg-rose-50/70 px-3.5 py-2.5 text-xs font-medium text-rose-700">
                    <XCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    {error}
                </div>
            )}

            {success && (
                <div className="mt-3 flex items-start gap-2 rounded-xl border border-emerald-100 bg-emerald-50/70 px-3.5 py-2.5 text-xs font-medium text-emerald-700">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                    {success}
                </div>
            )}
        </div>
    );
}
