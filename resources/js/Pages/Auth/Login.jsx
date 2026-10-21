import { useEffect, useState } from "react";
import { Head, Link, useForm } from "@inertiajs/react";
import InputError from "@/Components/InputError";
import DeveloperCredit from "@/Components/DeveloperCredit";
import {
    ArrowRight,
    Eye,
    EyeOff,
    GraduationCap,
    LockKeyhole,
    MapPin,
    ShieldCheck,
    Sparkles,
    UserRound,
} from "lucide-react";

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        username: "",
        password: "",
        remember: false,
    });
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        return () => {
            reset("password");
        };
    }, []);

    const submit = (e) => {
        e.preventDefault();
        post(route("login"));
    };

    const features = [
        { icon: GraduationCap, text: "PPL & KPM terintegrasi" },
        { icon: ShieldCheck, text: "Penilaian multi-stakeholder" },
        { icon: MapPin, text: "Penempatan sekolah & gampong" },
    ];

    return (
        <>
            <Head title="Masuk" />

            <div className="relative min-h-screen overflow-x-hidden bg-slate-50">
                {/* Dekorasi latar */}
                <div className="pointer-events-none absolute inset-0 overflow-hidden">
                    <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-[#06359f]/10 blur-3xl" />
                    <div className="absolute -bottom-24 right-0 h-80 w-80 rounded-full bg-emerald-400/10 blur-3xl" />
                </div>

                <div className="relative mx-auto grid min-h-screen w-full max-w-[1600px] lg:grid-cols-[1.05fr_0.95fr]">
                    {/* Panel form */}
                    <div className="flex min-h-screen flex-col px-4 py-8 sm:px-8 lg:px-16 xl:px-24">
                        <div className="flex items-center gap-3">
                            <img
                                src="/Lambang_UIN_Ar-Raniry.png"
                                alt="Lambang UIN Ar-Raniry"
                                className="h-14 w-14 shrink-0 object-contain"
                            />
                            <div className="min-w-0">
                                <p className="text-lg font-extrabold tracking-tight text-[#06359f]">
                                    IDC
                                </p>
                                <p className="truncate text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500 sm:text-[11px]">
                                    Instructional Development Center
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-1 items-center justify-center py-10">
                            <div className="w-full max-w-md">
                                <div className="mb-8">
                                    <span className="inline-flex items-center gap-2 rounded-full border border-[#06359f]/15 bg-[#06359f]/5 px-3 py-1 text-xs font-semibold text-[#06359f]">
                                        <Sparkles className="h-3.5 w-3.5" />
                                        Portal PPKPM FTK
                                    </span>
                                    <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                                        Selamat datang kembali
                                    </h1>
                                    <p className="mt-2 text-sm leading-relaxed text-slate-500">
                                        Masuk untuk mengelola PPL, KPM, bimbingan,
                                        dan penilaian dalam satu platform.
                                    </p>
                                </div>

                                {status && (
                                    <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                                        {status}
                                    </div>
                                )}

                                <form onSubmit={submit} className="space-y-5">
                                    <div>
                                        <label
                                            htmlFor="username"
                                            className="mb-1.5 block text-sm font-semibold text-slate-700"
                                        >
                                            Username
                                        </label>
                                        <div className="relative">
                                            <UserRound className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                            <input
                                                id="username"
                                                type="text"
                                                autoComplete="username"
                                                value={data.username}
                                                onChange={(e) =>
                                                    setData("username", e.target.value)
                                                }
                                                placeholder="Masukkan username / NIP"
                                                className={`h-12 w-full rounded-xl border bg-white pl-11 pr-4 text-sm text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 focus:ring-4 ${
                                                    errors.username
                                                        ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                                                        : "border-slate-200 focus:border-[#06359f] focus:ring-[#06359f]/10"
                                                }`}
                                            />
                                        </div>
                                        <InputError
                                            message={errors.username}
                                            className="mt-2"
                                        />
                                    </div>

                                    <div>
                                        <div className="mb-1.5 flex items-center justify-between gap-3">
                                            <label
                                                htmlFor="password"
                                                className="block text-sm font-semibold text-slate-700"
                                            >
                                                Password
                                            </label>
                                            {canResetPassword && (
                                                <Link
                                                    href={route("password.request")}
                                                    className="text-xs font-semibold text-[#06359f] hover:underline"
                                                >
                                                    Lupa password?
                                                </Link>
                                            )}
                                        </div>
                                        <div className="relative">
                                            <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                            <input
                                                id="password"
                                                type={showPassword ? "text" : "password"}
                                                autoComplete="current-password"
                                                value={data.password}
                                                onChange={(e) =>
                                                    setData("password", e.target.value)
                                                }
                                                placeholder="Masukkan password"
                                                className={`h-12 w-full rounded-xl border bg-white pl-11 pr-12 text-sm text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 focus:ring-4 ${
                                                    errors.password
                                                        ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                                                        : "border-slate-200 focus:border-[#06359f] focus:ring-[#06359f]/10"
                                                }`}
                                            />
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setShowPassword((value) => !value)
                                                }
                                                aria-label={
                                                    showPassword
                                                        ? "Sembunyikan password"
                                                        : "Tampilkan password"
                                                }
                                                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                                            >
                                                {showPassword ? (
                                                    <EyeOff className="h-4 w-4" />
                                                ) : (
                                                    <Eye className="h-4 w-4" />
                                                )}
                                            </button>
                                        </div>
                                        <InputError
                                            message={errors.password}
                                            className="mt-2"
                                        />
                                    </div>

                                    <label className="flex w-fit cursor-pointer items-center gap-2.5 text-sm text-slate-600">
                                        <input
                                            type="checkbox"
                                            checked={data.remember}
                                            onChange={(e) =>
                                                setData("remember", e.target.checked)
                                            }
                                            className="h-4 w-4 rounded border-slate-300 accent-[#06359f] focus:ring-[#06359f]/30"
                                        />
                                        Ingat saya
                                    </label>

                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#06359f] text-sm font-bold text-white shadow-[0_14px_30px_-14px_rgba(6,53,159,0.6)] transition hover:bg-[#042574] disabled:cursor-not-allowed disabled:opacity-70"
                                    >
                                        {processing ? (
                                            <>
                                                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                                                Memproses...
                                            </>
                                        ) : (
                                            <>
                                                Masuk ke Portal
                                                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                                            </>
                                        )}
                                    </button>
                                </form>

                                <div className="mt-6 flex flex-col items-center gap-2 text-sm sm:flex-row sm:justify-between">
                                    <span className="text-slate-500">
                                        Belum punya akun?
                                    </span>
                                    <Link
                                        href={route("verifikasi.mahasiswa")}
                                        className="font-semibold text-[#06359f] hover:underline"
                                    >
                                        Daftar sebagai mahasiswa
                                    </Link>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col items-center gap-1 lg:items-start">
                            <p className="text-center text-[11px] text-slate-400 lg:text-left">
                                © {new Date().getFullYear()} IDC FTK UIN Ar-Raniry. All
                                rights reserved.
                            </p>
                            <DeveloperCredit
                                variant="light"
                                className="text-center text-[11px] leading-relaxed lg:text-left"
                            />
                        </div>
                    </div>

                    {/* Panel visual */}
                    <div className="relative hidden overflow-hidden lg:block">
                        <img
                            src="/assets/landmark-uinar-scaled.jpg"
                            alt="Kampus UIN Ar-Raniry Banda Aceh"
                            className="absolute inset-0 h-full w-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-br from-[#06359f]/95 via-[#06359f]/75 to-emerald-950/80" />

                        <div className="relative flex h-full flex-col justify-between p-10 xl:p-14">
                            <div className="flex justify-end">
                                <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-white/90 backdrop-blur">
                                    Portal Resmi IDC FTK
                                </span>
                            </div>

                            <div className="max-w-lg">
                                <h2 className="text-3xl font-extrabold leading-tight text-white xl:text-4xl">
                                    Satu platform untuk seluruh proses akademik
                                    PPKPM.
                                </h2>
                                <p className="mt-4 text-sm leading-relaxed text-white/80">
                                    Kelola pendaftaran, penempatan, bimbingan,
                                    hingga nilai PPL dan KPM secara terintegrasi
                                    dan transparan.
                                </p>

                                <div className="mt-8 space-y-3">
                                    {features.map(({ icon: Icon, text }) => (
                                        <div
                                            key={text}
                                            className="flex items-center gap-3 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-sm"
                                        >
                                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/15">
                                                <Icon className="h-4 w-4 text-white" />
                                            </span>
                                            <span className="text-sm font-medium text-white">
                                                {text}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <p className="text-xs text-white/60">
                                Fakultas Tarbiyah dan Keguruan · UIN Ar-Raniry
                                Banda Aceh
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
