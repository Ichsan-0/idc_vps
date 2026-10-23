import React from "react";
import { Head, Link, router, usePage } from "@inertiajs/react";
import {
    ArrowRight,
    Clock3,
    GraduationCap,
    ShieldCheck,
    Wrench,
} from "lucide-react";

export default function Maintenance() {
    const { auth } = usePage().props;
    const isSuperAdmin = !!auth?.user?.is_superadmin;

    return (
        <>
            <Head title="Web Sedang Maintenance" />

            <div className="relative min-h-screen overflow-hidden bg-slate-950">
                <img
                    src="/assets/landmark-uinar-scaled.jpg"
                    alt="Kampus UIN Ar-Raniry"
                    className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-[#06359f]/95 via-[#06359f]/80 to-emerald-950/90" />
                <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
                <div className="pointer-events-none absolute -right-16 bottom-0 h-80 w-80 rounded-full bg-emerald-400/10 blur-3xl" />

                <div className="relative flex min-h-screen items-center justify-center px-4 py-10">
                    <div className="w-full max-w-xl">
                        <div className="mb-6 flex items-center justify-center gap-3">
                            <img
                                src="/Lambang_UIN_Ar-Raniry.png"
                                alt="Lambang UIN Ar-Raniry"
                                className="h-12 w-12 object-contain"
                            />
                            <div className="text-left">
                                <p className="text-lg font-extrabold tracking-tight text-white">
                                    IDC
                                </p>
                                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/60">
                                    Instructional Development Center
                                </p>
                            </div>
                        </div>

                        <div className="rounded-3xl border border-white/20 bg-white/95 p-6 shadow-2xl shadow-slate-950/40 backdrop-blur sm:p-10">
                            <div className="flex flex-col items-center text-center">
                                <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 ring-8 ring-amber-50/60">
                                    <Wrench className="h-8 w-8" />
                                </span>

                                <span className="mt-5 inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-amber-700">
                                    <Clock3 className="h-3.5 w-3.5" />
                                    Mode Maintenance
                                </span>

                                <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
                                    Mohon maaf, web IDC sedang maintenance
                                </h1>
                                <p className="mt-3 max-w-md text-sm leading-relaxed text-slate-500">
                                    Silakan menunggu beberapa saat. Kami sedang
                                    melakukan pemeliharaan sistem agar layanan
                                    kembali berjalan optimal.
                                </p>

                                <div className="mt-6 w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left">
                                    <div className="flex items-start gap-3">
                                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-[#06359f] shadow-sm">
                                            <ShieldCheck className="h-4 w-4" />
                                        </span>
                                        <div>
                                            <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
                                                Tertanda
                                            </p>
                                            <p className="mt-0.5 text-sm font-semibold text-slate-800">
                                                Tim Teknis Muhammad Ichsan
                                            </p>
                                            <p className="mt-0.5 text-xs text-slate-500">
                                                IDC FTK UIN Ar-Raniry Banda Aceh
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {isSuperAdmin ? (
                                    <div className="mt-6 flex flex-col items-center gap-2">
                                        <p className="text-[11px] text-slate-400">
                                            Anda masih login sebagai Super Admin.
                                        </p>
                                        <Link
                                            href="/admin/dashboard"
                                            className="inline-flex items-center gap-1.5 rounded-xl bg-[#06359f] px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#042574]"
                                        >
                                            <ShieldCheck className="h-4 w-4" />
                                            Buka Panel Admin
                                            <ArrowRight className="h-3.5 w-3.5" />
                                        </Link>
                                        <button
                                            type="button"
                                            onClick={() => router.post(route("logout"))}
                                            className="text-[11px] font-medium text-slate-400 transition hover:text-slate-600"
                                        >
                                            Logout
                                        </button>
                                    </div>
                                ) : auth?.user ? (
                                    <button
                                        type="button"
                                        onClick={() => router.post(route("logout"))}
                                        className="mt-6 inline-flex items-center gap-1.5 text-xs font-semibold text-[#06359f] transition hover:text-[#042574]"
                                    >
                                        Silahkan logout untuk mengakses web
                                        <ArrowRight className="h-3.5 w-3.5" />
                                    </button>
                                ) : (
                                    <Link
                                        href="/login"
                                        className="mt-6 inline-flex items-center gap-1.5 text-xs font-semibold text-[#06359f] transition hover:text-[#042574]"
                                    >
                                        <GraduationCap className="h-4 w-4" />
                                        Login Admin
                                        <ArrowRight className="h-3.5 w-3.5" />
                                    </Link>
                                )}
                            </div>
                        </div>

                        <p className="mt-5 text-center text-[11px] text-white/50">
                            © {new Date().getFullYear()} IDC FTK UIN Ar-Raniry
                            Banda Aceh
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}
