import React, { useEffect, useMemo, useState } from "react";
import { Head, Link } from "@inertiajs/react";
import axios from "axios";
import Header from "@/Components/frontpage/Header";
import ButtomFooter from "@/Components/frontpage/ButtomFooter";
import Navigation from "@/Components/Mahasiswa/Navigation";
import {
    AlertCircle,
    ArrowRight,
    Award,
    BookOpenCheck,
    CheckCircle2,
    ClipboardCheck,
    Clock3,
    Download,
    GraduationCap,
    Home,
    ListChecks,
    Loader2,
    LockKeyhole,
    MessageSquareText,
    Printer,
    School,
    ShieldCheck,
    Sparkles,
    XCircle,
} from "lucide-react";

const getIndexNilai = (score) => {
    if (score >= 85) return "A";
    if (score >= 80) return "A-";
    if (score >= 75) return "B+";
    if (score >= 70) return "B";
    if (score >= 65) return "B-";
    if (score >= 60) return "C+";
    if (score >= 55) return "C";
    if (score >= 50) return "C-";
    if (score >= 45) return "D";
    return "E";
};

const numberFormat = new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: 2,
});

const requirementIcon = (kind) => {
    if (kind === "scores") return ClipboardCheck;
    if (kind === "bimbingan") return MessageSquareText;
    return ListChecks;
};

const StatusPill = ({ lulus }) => (
    <span
        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-wide ring-1 ring-inset ${
            lulus
                ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                : "bg-rose-50 text-rose-700 ring-rose-200"
        }`}
    >
        {lulus ? (
            <CheckCircle2 className="h-3.5 w-3.5" />
        ) : (
            <XCircle className="h-3.5 w-3.5" />
        )}
        {lulus ? "Lulus" : "Belum lulus"}
    </span>
);

const ScoreCard = ({
    title,
    subtitle,
    icon: Icon,
    score,
    tone,
    details = [],
}) => (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
        <div className={`h-1.5 w-full ${tone.bar}`} />
        <div className="p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                    <span
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${tone.icon}`}
                    >
                        <Icon className="h-5 w-5" />
                    </span>
                    <div>
                        <h2 className="text-base font-bold text-slate-900">
                            {title}
                        </h2>
                        <p className="mt-0.5 text-xs text-slate-500">
                            {subtitle || "-"}
                        </p>
                    </div>
                </div>

                <div className="text-right">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                        Nilai
                    </p>
                    <p className={`text-3xl font-extrabold tracking-tight ${tone.text}`}>
                        {numberFormat.format(Number(score) || 0)}
                    </p>
                </div>
            </div>

            <div className="mt-5 space-y-3">
                {details.map((detail) => (
                    <div key={detail.label}>
                        <div className="flex items-center justify-between gap-3 text-xs">
                            <span className="flex items-center gap-2 font-medium text-slate-600">
                                <span
                                    className={`h-2 w-2 rounded-full ${detail.dot}`}
                                />
                                {detail.label}
                                <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500">
                                    {detail.weight}
                                </span>
                            </span>
                            <span className="font-bold tabular-nums text-slate-800">
                                {numberFormat.format(
                                    Number(detail.value) || 0
                                )}
                            </span>
                        </div>
                        <div className={`mt-1.5 h-1.5 w-full overflow-hidden rounded-full ${detail.track}`}>
                            <div
                                className={`h-full rounded-full ${detail.fill}`}
                                style={{
                                    width: `${Math.min(
                                        100,
                                        Math.max(
                                            0,
                                            Number(detail.value) || 0
                                        )
                                    )}%`,
                                }}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

export default function Nilai({ access_token, auth }) {
    const [loading, setLoading] = useState(true);
    const [downloading, setDownloading] = useState(false);
    const [dataMahasiswa, setDataMahasiswa] = useState(null);
    const [eligibility, setEligibility] = useState(null);
    const [toast, setToast] = useState({
        open: false,
        message: "",
        severity: "info",
    });

    const showToast = (message, severity = "info") =>
        setToast({ open: true, message, severity });

    useEffect(() => {
        if (!toast.open) return;

        const timer = setTimeout(
            () => setToast((prev) => ({ ...prev, open: false })),
            4000
        );

        return () => clearTimeout(timer);
    }, [toast.open]);

    const authHeaders = access_token
        ? { Authorization: `Bearer ${access_token}` }
        : {};

    const getNilai = async () => {
        try {
            setLoading(true);
            const response = await axios.get("/api/student/nilai", {
                headers: authHeaders,
                params: { nim: auth?.user?.username },
            });

            setDataMahasiswa(response.data?.data?.mahasiswa ?? null);
            setEligibility(response.data?.data?.eligibility ?? null);
        } catch (error) {
            showToast(
                error.response?.data?.data?.message ||
                    error.response?.data?.message ||
                    "Gagal memuat data nilai.",
                "error"
            );
            setEligibility(null);
            setDataMahasiswa(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getNilai();
    }, []);

    const isEligible = eligibility?.eligible === true;
    const finalScore = Number(dataMahasiswa?.nilai_ppkpm) || 0;
    const isLulus = isEligible && finalScore > 68;
    const grade = dataMahasiswa?.index_nilai_ppkpm || getIndexNilai(finalScore);

    const clusterLabel = useMemo(() => {
        const cluster = String(eligibility?.cluster || "").toUpperCase();
        if (cluster.includes("PPKPM")) return "PPKPM (PPL + KPM)";
        if (cluster === "PPL") return "PPL";
        if (cluster === "KPM") return "KPM";
        return cluster || "-";
    }, [eligibility]);

    const handlePrintCertificate = async () => {
        if (!dataMahasiswa?.open_print_certificate) {
            showToast("Cetak sertifikat belum dibuka.", "warning");
            return;
        }

        try {
            setDownloading(true);
            const response = await axios.post(
                "/api/certificate/download",
                { nim: auth?.user?.username },
                { responseType: "blob", headers: authHeaders }
            );

            const contentType = response.headers["content-type"] || "";
            if (!contentType.includes("application/pdf")) {
                throw new Error(
                    "Sertifikat belum tersedia. Silakan coba lagi sesaat lagi."
                );
            }

            const blob = new Blob([response.data], { type: contentType });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;

            const contentDisposition =
                response.headers["content-disposition"] || "";
            const filenameMatch = contentDisposition.match(
                /filename="?(.+)"?/
            );
            link.download = filenameMatch
                ? filenameMatch[1]
                : "sertifikat_ppkpm.pdf";

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            showToast("Sertifikat berhasil diunduh.", "success");
        } catch (error) {
            showToast(
                error.response?.data?.message ||
                    error.message ||
                    "Gagal mengunduh sertifikat.",
                "error"
            );
        } finally {
            setDownloading(false);
        }
    };

    const kpmTaskUrl = eligibility?.classes?.kpm
        ? `/student/classroom/${eligibility.classes.kpm}/task`
        : null;
    const pplTaskUrl = eligibility?.classes?.ppl
        ? "/student/classroom-ppl/tasks"
        : null;

    return (
        <>
            <Head title="Nilai PPKPM" />
            <Header />

            {toast.open && (
                <div
                    className={`fixed right-4 top-20 z-[200] flex w-[calc(100%-2rem)] max-w-sm items-start gap-3 rounded-2xl border px-4 py-3 shadow-lg shadow-slate-900/10 ${
                        toast.severity === "error"
                            ? "border-rose-200 bg-rose-50 text-rose-800"
                            : toast.severity === "success"
                            ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                            : "border-amber-200 bg-amber-50 text-amber-800"
                    }`}
                >
                    <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                    <p className="flex-1 text-sm font-medium">
                        {toast.message}
                    </p>
                </div>
            )}

            <main className="min-h-screen bg-slate-50 pb-24 pt-20">
                <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
                    {/* Hero */}
                    <section className="relative mt-6 overflow-hidden rounded-3xl bg-gradient-to-br from-[#06359f] via-[#06359f] to-[#0b7a63] p-6 text-white shadow-xl shadow-[#06359f]/15 sm:p-8">
                        <div className="pointer-events-none absolute -right-10 -top-16 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
                        <div className="pointer-events-none absolute -bottom-20 left-1/3 h-56 w-56 rounded-full bg-emerald-300/10 blur-3xl" />

                        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                            <div>
                                <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-white/85 backdrop-blur">
                                    <Sparkles className="h-3.5 w-3.5" />
                                    Hasil Penilaian
                                </span>
                                <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
                                    Nilai PPKPM
                                </h1>
                                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/75">
                                    Rekap nilai KPM dan PPL berdasarkan tugas,
                                    penilaian supervisor, pamong, dan bimbingan
                                    yang telah diselesaikan.
                                </p>

                                <div className="mt-5 flex flex-wrap items-center gap-2 text-xs">
                                    <span className="rounded-full bg-white/10 px-3 py-1.5 font-medium text-white/85 ring-1 ring-inset ring-white/15">
                                        {auth?.user?.name || "Mahasiswa"}
                                    </span>
                                    <span className="rounded-full bg-white/10 px-3 py-1.5 font-medium text-white/85 ring-1 ring-inset ring-white/15">
                                        {clusterLabel}
                                    </span>
                                    {auth?.user?.username && (
                                        <span className="rounded-full bg-white/10 px-3 py-1.5 font-mono text-[11px] font-medium text-white/75 ring-1 ring-inset ring-white/15">
                                            {auth.user.username}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="flex h-24 w-24 shrink-0 items-center justify-center self-start rounded-3xl bg-white/10 text-white ring-1 ring-inset ring-white/20 backdrop-blur lg:self-center">
                                <GraduationCap className="h-12 w-12" />
                            </div>
                        </div>
                    </section>

                    {loading ? (
                        <div className="mt-5 grid gap-4 lg:grid-cols-2">
                            {[0, 1, 2].map((item) => (
                                <div
                                    key={item}
                                    className="h-48 animate-pulse rounded-3xl border border-slate-200 bg-white"
                                />
                            ))}
                        </div>
                    ) : !eligibility ? (
                        <div className="mt-5 rounded-3xl border border-rose-100 bg-rose-50/70 p-6">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />
                                <div>
                                    <h2 className="text-sm font-bold text-rose-800">
                                        Data nilai gagal dimuat
                                    </h2>
                                    <p className="mt-1 text-sm text-rose-700">
                                        Silakan muat ulang halaman atau coba
                                        beberapa saat lagi.
                                    </p>
                                    <button
                                        type="button"
                                        onClick={getNilai}
                                        className="mt-3 rounded-xl bg-rose-600 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-rose-700"
                                    >
                                        Coba lagi
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : !isEligible ? (
                        <>
                            {/* Gate */}
                            <section className="mt-5 overflow-hidden rounded-3xl border border-amber-200/80 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
                                <div className="flex flex-col gap-4 border-b border-amber-100 bg-amber-50/60 p-6 sm:flex-row sm:items-start">
                                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-600">
                                        <LockKeyhole className="h-6 w-6" />
                                    </span>
                                    <div>
                                        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-white px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-700">
                                            <Clock3 className="h-3 w-3" />
                                            Menunggu Kelengkapan
                                        </span>
                                        <h2 className="mt-3 text-xl font-extrabold tracking-tight text-slate-900">
                                            Nilai belum dapat ditampilkan
                                        </h2>
                                        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600">
                                            Anda wajib menyelesaikan{" "}
                                            <span className="font-semibold text-slate-800">
                                                seluruh tugas yang tersedia
                                            </span>{" "}
                                            dan mengisi bimbingan ke supervisor
                                            minimal{" "}
                                            <span className="font-semibold text-slate-800">
                                                4 kali
                                            </span>{" "}
                                            sebelum nilai ditampilkan.
                                        </p>
                                    </div>
                                </div>

                                <div className="grid gap-3 p-5 sm:grid-cols-2 lg:grid-cols-3">
                                    {eligibility.requirements.map(
                                        (requirement) => {
                                            const Icon = requirementIcon(
                                                requirement.kind
                                            );
                                            const ratio =
                                                requirement.required > 0
                                                    ? Math.min(
                                                          100,
                                                          Math.round(
                                                              (requirement.completed /
                                                                  requirement.required) *
                                                                  100
                                                          )
                                                      )
                                                    : 100;

                                            return (
                                                <div
                                                    key={requirement.key}
                                                    className={`rounded-2xl border p-4 ${
                                                        requirement.met
                                                            ? "border-emerald-100 bg-emerald-50/50"
                                                            : "border-slate-200 bg-slate-50/60"
                                                    }`}
                                                >
                                                    <div className="flex items-start justify-between gap-2">
                                                        <span
                                                            className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                                                                requirement.met
                                                                    ? "bg-emerald-100 text-emerald-600"
                                                                    : "bg-white text-slate-500"
                                                            }`}
                                                        >
                                                            <Icon className="h-4 w-4" />
                                                        </span>
                                                        {requirement.met ? (
                                                            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                                                        ) : (
                                                            <Clock3 className="h-5 w-5 text-amber-500" />
                                                        )}
                                                    </div>
                                                    <p className="mt-3 text-xs font-semibold text-slate-700">
                                                        {requirement.label}
                                                    </p>
                                                    <p className="mt-1 text-[11px] text-slate-500">
                                                        {requirement.kind ===
                                                            "bimbingan" &&
                                                        requirement.submitted !==
                                                            undefined
                                                            ? `${requirement.submitted} diajukan · ${requirement.completed} disetujui`
                                                            : `${requirement.completed} / ${requirement.required}`}
                                                    </p>
                                                    <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                                                        <div
                                                            className={`h-full rounded-full ${
                                                                requirement.met
                                                                    ? "bg-emerald-500"
                                                                    : "bg-amber-500"
                                                            }`}
                                                            style={{
                                                                width: `${ratio}%`,
                                                            }}
                                                        />
                                                    </div>
                                                    {!requirement.met && (
                                                        <p className="mt-2 text-[11px] leading-relaxed text-slate-400">
                                                            {requirement.hint}
                                                        </p>
                                                    )}
                                                </div>
                                            );
                                        }
                                    )}
                                </div>

                                <div className="flex flex-col gap-2 border-t border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
                                    <p className="text-xs text-slate-500">
                                        Setelah semua syarat terpenuhi, nilai
                                        akan muncul otomatis di halaman ini.
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {eligibility.needs_kpm &&
                                            kpmTaskUrl && (
                                                <Link
                                                    href={kpmTaskUrl}
                                                    className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#06359f] px-4 text-xs font-semibold text-white shadow-sm transition hover:bg-[#042574]"
                                                >
                                                    <BookOpenCheck className="h-4 w-4" />
                                                    Buka Classroom KPM
                                                    <ArrowRight className="h-3.5 w-3.5" />
                                                </Link>
                                            )}
                                        {eligibility.needs_ppl &&
                                            pplTaskUrl && (
                                                <Link
                                                    href={pplTaskUrl}
                                                    className="inline-flex h-10 items-center gap-2 rounded-xl bg-emerald-600 px-4 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700"
                                                >
                                                    <School className="h-4 w-4" />
                                                    Buka Classroom PPL
                                                    <ArrowRight className="h-3.5 w-3.5" />
                                                </Link>
                                            )}
                                    </div>
                                </div>
                            </section>

                            {eligibility.missing?.length > 0 && (
                                <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
                                    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                                        Yang perlu diselesaikan
                                    </p>
                                    <ul className="mt-2 space-y-1.5">
                                        {eligibility.missing.map((item) => (
                                            <li
                                                key={item}
                                                className="flex items-start gap-2 text-xs text-slate-600"
                                            >
                                                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </>
                    ) : (
                        <>
                            {/* Final score */}
                            <section
                                className={`mt-5 overflow-hidden rounded-3xl border shadow-[0_1px_2px_rgba(16,24,40,0.04)] ${
                                    isLulus
                                        ? "border-emerald-200 bg-gradient-to-br from-emerald-50 to-white"
                                        : "border-rose-200 bg-gradient-to-br from-rose-50 to-white"
                                }`}
                            >
                                <div className="flex flex-col gap-6 p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between">
                                    <div className="flex items-start gap-4">
                                        <span
                                            className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${
                                                isLulus
                                                    ? "bg-emerald-100 text-emerald-600"
                                                    : "bg-rose-100 text-rose-600"
                                            }`}
                                        >
                                            <Award className="h-7 w-7" />
                                        </span>
                                        <div>
                                            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                                                Nilai Akhir PPKPM
                                            </p>
                                            <div className="mt-1 flex flex-wrap items-end gap-3">
                                                <p
                                                    className={`text-5xl font-extrabold tracking-tight ${
                                                        isLulus
                                                            ? "text-emerald-700"
                                                            : "text-rose-700"
                                                    }`}
                                                >
                                                    {numberFormat.format(
                                                        finalScore
                                                    )}
                                                </p>
                                                <span className="rounded-xl bg-white px-2.5 py-1 text-sm font-bold text-slate-700 ring-1 ring-inset ring-slate-200">
                                                    {grade}
                                                </span>
                                                <StatusPill lulus={isLulus} />
                                            </div>
                                            <p className="mt-2 text-sm text-slate-500">
                                                {isLulus
                                                    ? "Selamat! Seluruh syarat penilaian telah terpenuhi."
                                                    : "Nilai akhir belum mencapai batas kelulusan (68)."}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-stretch gap-2 sm:flex-row lg:flex-col lg:items-end">
                                        {isLulus &&
                                        dataMahasiswa?.open_print_certificate ? (
                                            <button
                                                type="button"
                                                onClick={
                                                    handlePrintCertificate
                                                }
                                                disabled={downloading}
                                                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#06359f] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#042574] disabled:cursor-not-allowed disabled:opacity-60"
                                            >
                                                {downloading ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <Printer className="h-4 w-4" />
                                                )}
                                                {downloading
                                                    ? "Mengunduh..."
                                                    : "Cetak Sertifikat"}
                                            </button>
                                        ) : isLulus ? (
                                            <span className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-400">
                                                <Download className="h-4 w-4" />
                                                Sertifikat Belum Dibuka
                                            </span>
                                        ) : null}

                                        <span className="text-center text-[11px] text-slate-400 lg:text-right">
                                            Batas kelulusan: 68
                                        </span>
                                    </div>
                                </div>
                            </section>

                            {/* Score cards */}
                            <div className="mt-4 grid gap-4 lg:grid-cols-2">
                                {eligibility.needs_ppl && (
                                    <ScoreCard
                                        title="Praktik Pengalaman Lapangan"
                                        subtitle={
                                            dataMahasiswa?.nama_tempat_ppl ||
                                            "PPL"
                                        }
                                        icon={School}
                                        score={dataMahasiswa?.SM_PPL}
                                        tone={{
                                            bar: "bg-gradient-to-r from-emerald-400 to-emerald-600",
                                            icon: "bg-emerald-50 text-emerald-600",
                                            text: "text-emerald-700",
                                        }}
                                        details={[
                                            {
                                                label: "Nilai Pamong",
                                                weight: "75%",
                                                value: dataMahasiswa?.nilai_pamong,
                                                dot: "bg-emerald-500",
                                                track: "bg-emerald-100",
                                                fill: "bg-emerald-500",
                                            },
                                            {
                                                label: "Nilai Supervisor PPL",
                                                weight: "25%",
                                                value: dataMahasiswa?.nilai_supervisor_ppl,
                                                dot: "bg-teal-400",
                                                track: "bg-teal-100",
                                                fill: "bg-teal-500",
                                            },
                                        ]}
                                    />
                                )}

                                {eligibility.needs_kpm && (
                                    <ScoreCard
                                        title="Kuliah Pengabdian Masyarakat"
                                        subtitle={
                                            dataMahasiswa?.nama_tempat_kpm ||
                                            "KPM"
                                        }
                                        icon={Home}
                                        score={dataMahasiswa?.SM_KPM}
                                        tone={{
                                            bar: "bg-gradient-to-r from-blue-400 to-[#06359f]",
                                            icon: "bg-blue-50 text-[#06359f]",
                                            text: "text-[#06359f]",
                                        }}
                                        details={[
                                            {
                                                label: "Nilai Keuchik",
                                                weight: "75%",
                                                value: dataMahasiswa?.nilai_keuchik,
                                                dot: "bg-[#06359f]",
                                                track: "bg-blue-100",
                                                fill: "bg-[#06359f]",
                                            },
                                            {
                                                label: "Nilai Supervisor KPM",
                                                weight: "25%",
                                                value: dataMahasiswa?.nilai_supervisor_kpm,
                                                dot: "bg-sky-400",
                                                track: "bg-sky-100",
                                                fill: "bg-sky-500",
                                            },
                                        ]}
                                    />
                                )}
                            </div>

                            {/* Completed requirements */}
                            <section className="mt-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
                                <div className="flex items-center gap-2">
                                    <ShieldCheck className="h-5 w-5 text-emerald-500" />
                                    <h2 className="text-sm font-bold text-slate-800">
                                        Syarat penilaian terpenuhi
                                    </h2>
                                </div>
                                <div className="mt-3 flex flex-wrap gap-2">
                                    {eligibility.requirements.map(
                                        (requirement) => (
                                            <span
                                                key={requirement.key}
                                                className="inline-flex items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700"
                                            >
                                                <CheckCircle2 className="h-3 w-3" />
                                                {requirement.label}
                                            </span>
                                        )
                                    )}
                                </div>
                            </section>

                            <p className="mt-4 flex items-start gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-[11px] leading-relaxed text-slate-500">
                                <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                                Nilai akhir dihitung otomatis dari komponen
                                KPM dan PPL. Hubungi admin jika ada nilai yang
                                tidak sesuai.
                            </p>
                        </>
                    )}
                </div>
            </main>

            <ButtomFooter />
            <Navigation />
        </>
    );
}
