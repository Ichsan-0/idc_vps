import React, { useEffect, useState } from "react";
import { Head, useForm } from "@inertiajs/react";
import AdminLayout from "@/Layouts/Admin/AdminLayout";
import PageBreadcrumb from "@/Components/PageBreadcrumb";
import {
    AlertTriangle,
    CheckCircle2,
    FileText,
    Info,
    Link2,
    MessageCircle,
    RotateCcw,
    Save,
    UserPlus,
    X,
    XCircle,
} from "lucide-react";

const Toggle = ({ checked, onChange, disabled = false }) => (
    <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={onChange}
        disabled={disabled}
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-4 focus:ring-brand-100 disabled:cursor-not-allowed disabled:opacity-60 ${
            checked ? "bg-brand-500" : "bg-slate-200"
        }`}
    >
        <span
            className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                checked ? "translate-x-[22px]" : "translate-x-0.5"
            }`}
        />
    </button>
);

const TOAST_STYLES = {
    success: {
        wrapper: "border-emerald-200 bg-emerald-50 text-emerald-800",
        icon: CheckCircle2,
    },
    error: {
        wrapper: "border-rose-200 bg-rose-50 text-rose-800",
        icon: XCircle,
    },
    info: {
        wrapper: "border-blue-200 bg-blue-50 text-blue-800",
        icon: Info,
    },
};

const toBool = (value) => value === true || value === 1 || value === "1";

const Setting = ({ flash, settings }) => {
    const [toast, setToast] = useState({
        open: false,
        message: "",
        severity: "success",
    });

    const defaults = {
        buka_pendaftaran: toBool(settings?.buka_pendaftaran),
        buka_lengkapi_profil: toBool(settings?.buka_lengkapi_profil),
        buka_lamaran_kpm: toBool(settings?.buka_lamaran_kpm),
        buka_lamaran_ppl: toBool(settings?.buka_lamaran_ppl),
        link_grup: settings?.link_grup ?? "",
    };

    const { data, setData, post, processing } = useForm(defaults);

    useEffect(() => {
        if (!flash?.message) return;

        let message = "";
        let severity = "info";

        if (typeof flash.message === "string") {
            message = flash.message;
        } else if (typeof flash.message === "object") {
            if (flash.message.success) {
                message = flash.message.success;
                severity = "success";
            } else if (flash.message.error) {
                message = flash.message.error;
                severity = "error";
            } else if (flash.message.info) {
                message = flash.message.info;
            }
        }

        if (message) {
            setToast({ open: true, message, severity });
        }
    }, [flash]);

    useEffect(() => {
        if (!toast.open) return;

        const timer = setTimeout(
            () => setToast((prev) => ({ ...prev, open: false })),
            4000
        );

        return () => clearTimeout(timer);
    }, [toast.open]);

    const handleSubmit = (event) => {
        event.preventDefault();

        post("/admin/settings/update", {
            preserveScroll: true,
            onSuccess: () =>
                setToast({
                    open: true,
                    message: "Pengaturan berhasil disimpan.",
                    severity: "success",
                }),
            onError: () =>
                setToast({
                    open: true,
                    message: "Terjadi kesalahan saat menyimpan pengaturan.",
                    severity: "error",
                }),
        });
    };

    const handleReset = () => {
        setData({
            buka_pendaftaran: toBool(settings?.buka_pendaftaran),
            buka_lengkapi_profil: toBool(settings?.buka_lengkapi_profil),
            buka_lamaran_kpm: toBool(settings?.buka_lamaran_kpm),
            buka_lamaran_ppl: toBool(settings?.buka_lamaran_ppl),
            link_grup: settings?.link_grup ?? "",
        });
    };

    const activeCount = [
        data.buka_pendaftaran,
        data.buka_lengkapi_profil,
        data.buka_lamaran_kpm,
        data.buka_lamaran_ppl,
    ].filter(toBool).length;

    const status =
        activeCount === 4
            ? {
                  key: "active",
                  label: "Aktif",
                  icon: CheckCircle2,
                  iconTone: "bg-emerald-50 text-emerald-600",
                  badge: "bg-emerald-50 text-emerald-700 ring-emerald-200",
                  bar: "bg-emerald-500",
              }
            : activeCount > 0
            ? {
                  key: "partial",
                  label: "Parsial",
                  icon: AlertTriangle,
                  iconTone: "bg-amber-50 text-amber-600",
                  badge: "bg-amber-50 text-amber-700 ring-amber-200",
                  bar: "bg-amber-500",
              }
            : {
                  key: "inactive",
                  label: "Nonaktif",
                  icon: XCircle,
                  iconTone: "bg-rose-50 text-rose-600",
                  badge: "bg-rose-50 text-rose-700 ring-rose-200",
                  bar: "bg-rose-500",
              };

    const StatusIcon = status.icon;

    const groups = [
        {
            title: "Pendaftaran Umum",
            description: "Pengaturan pendaftaran dan registrasi",
            icon: UserPlus,
            tone: "bg-blue-50 text-blue-600",
            items: [
                {
                    key: "buka_pendaftaran",
                    label: "Buka Pendaftaran",
                    description: "Aktifkan pendaftaran untuk mahasiswa baru",
                },
                {
                    key: "buka_lengkapi_profil",
                    label: "Terima Biodata",
                    description: "Izinkan mahasiswa melengkapi profil",
                },
            ],
        },
        {
            title: "Lamaran Kegiatan",
            description: "Pengaturan periode lamaran KPM dan PPL",
            icon: FileText,
            tone: "bg-violet-50 text-violet-600",
            items: [
                {
                    key: "buka_lamaran_kpm",
                    label: "Buka Lamaran KPM",
                    description: "Aktifkan pengajuan lamaran KPM",
                },
                {
                    key: "buka_lamaran_ppl",
                    label: "Buka Lamaran PPL",
                    description: "Aktifkan pengajuan lamaran PPL",
                },
            ],
        },
    ];

    const ToastIcon = TOAST_STYLES[toast.severity]?.icon || Info;

    return (
        <AdminLayout title="Pengaturan Sistem">
            <Head title="Pengaturan Sistem" />

            {toast.open && (
                <div
                    className={`fixed right-4 top-4 z-[200] flex w-[calc(100%-2rem)] max-w-sm items-start gap-3 rounded-2xl border px-4 py-3 shadow-lg shadow-slate-900/10 ${
                        TOAST_STYLES[toast.severity]?.wrapper ||
                        TOAST_STYLES.info.wrapper
                    }`}
                >
                    <ToastIcon className="mt-0.5 h-5 w-5 shrink-0" />
                    <p className="flex-1 text-sm font-medium">
                        {toast.message}
                    </p>
                    <button
                        type="button"
                        onClick={() =>
                            setToast((prev) => ({ ...prev, open: false }))
                        }
                        className="rounded-lg p-1 opacity-70 transition hover:bg-white/50 hover:opacity-100"
                        aria-label="Tutup notifikasi"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            )}

            <div className="flex flex-col gap-y-4">
                <PageBreadcrumb
                    pageTitle="Pengaturan Sistem"
                    home="/admin/dashboard"
                />

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Status & aksi */}
                    <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)] sm:p-6">
                        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                            <div className="flex items-start gap-4">
                                <span
                                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${status.iconTone}`}
                                >
                                    <StatusIcon className="h-6 w-6" />
                                </span>

                                <div>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h2 className="text-base font-semibold text-slate-900">
                                            Status Sistem
                                        </h2>
                                        <span
                                            className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset ${status.badge}`}
                                        >
                                            {status.label}
                                        </span>
                                    </div>
                                    <p className="mt-1 text-sm text-slate-500">
                                        {activeCount} dari 4 fitur aktif.
                                        Perubahan berlaku setelah disimpan.
                                    </p>

                                    <div className="mt-3 flex items-center gap-1.5">
                                        {[0, 1, 2, 3].map((index) => (
                                            <span
                                                key={index}
                                                className={`h-1.5 w-10 rounded-full ${
                                                    index < activeCount
                                                        ? status.bar
                                                        : "bg-slate-100"
                                                }`}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                                <button
                                    type="button"
                                    onClick={handleReset}
                                    disabled={processing}
                                    className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    <RotateCcw className="h-4 w-4" />
                                    Reset
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="inline-flex h-10 items-center gap-2 rounded-xl bg-brand-500 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {processing ? (
                                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                                    ) : (
                                        <Save className="h-4 w-4" />
                                    )}
                                    {processing
                                        ? "Menyimpan..."
                                        : "Simpan Perubahan"}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Kartu pengaturan */}
                    <div className="grid gap-5 lg:grid-cols-3">
                        {groups.map((group) => {
                            const GroupIcon = group.icon;

                            return (
                                <div
                                    key={group.title}
                                    className="flex flex-col rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)]"
                                >
                                    <div className="flex items-start gap-3 border-b border-slate-100 pb-4">
                                        <span
                                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${group.tone}`}
                                        >
                                            <GroupIcon className="h-5 w-5" />
                                        </span>
                                        <div>
                                            <h3 className="text-sm font-semibold text-slate-900">
                                                {group.title}
                                            </h3>
                                            <p className="mt-0.5 text-xs text-slate-500">
                                                {group.description}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-2 divide-y divide-slate-100">
                                        {group.items.map((item) => (
                                            <div
                                                key={item.key}
                                                className="flex items-start justify-between gap-4 py-3.5"
                                            >
                                                <div className="min-w-0">
                                                    <p className="text-sm font-medium text-slate-700">
                                                        {item.label}
                                                    </p>
                                                    <p className="mt-0.5 text-xs leading-relaxed text-slate-500">
                                                        {item.description}
                                                    </p>
                                                </div>
                                                <Toggle
                                                    checked={toBool(
                                                        data[item.key]
                                                    )}
                                                    disabled={processing}
                                                    onChange={() =>
                                                        setData(
                                                            item.key,
                                                            !toBool(
                                                                data[item.key]
                                                            )
                                                        )
                                                    }
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}

                        {/* Komunikasi */}
                        <div className="flex flex-col rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
                            <div className="flex items-start gap-3 border-b border-slate-100 pb-4">
                                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                                    <MessageCircle className="h-5 w-5" />
                                </span>
                                <div>
                                    <h3 className="text-sm font-semibold text-slate-900">
                                        Komunikasi
                                    </h3>
                                    <p className="mt-0.5 text-xs text-slate-500">
                                        Pengaturan tautan dan komunikasi
                                    </p>
                                </div>
                            </div>

                            <div className="pt-4">
                                <label
                                    htmlFor="link_grup"
                                    className="text-sm font-medium text-slate-700"
                                >
                                    Link Grup WhatsApp
                                </label>
                                <div className="relative mt-2">
                                    <Link2 className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                    <input
                                        id="link_grup"
                                        type="url"
                                        value={data.link_grup}
                                        disabled={processing}
                                        onChange={(event) =>
                                            setData(
                                                "link_grup",
                                                event.target.value
                                            )
                                        }
                                        placeholder="https://chat.whatsapp.com/..."
                                        className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-brand-400 focus:ring-4 focus:ring-brand-100 disabled:bg-slate-50"
                                    />
                                </div>
                                <p className="mt-2 text-xs leading-relaxed text-slate-400">
                                    Tautan ini dibagikan kepada mahasiswa
                                    sebagai kanal komunikasi resmi.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Info */}
                    <div className="flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50/60 p-4">
                        <Info className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
                        <div>
                            <p className="text-sm font-semibold text-blue-800">
                                Informasi Pengaturan
                            </p>
                            <ul className="mt-1 list-disc space-y-0.5 pl-4 text-xs leading-relaxed text-blue-700/80">
                                <li>
                                    Perubahan pengaturan akan langsung berlaku
                                    setelah disimpan.
                                </li>
                                <li>
                                    Pastikan untuk menginformasikan perubahan
                                    kepada pengguna terkait.
                                </li>
                            </ul>
                        </div>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
};

export default Setting;
