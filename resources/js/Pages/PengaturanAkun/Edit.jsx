import React from "react";
import { Head, useForm, usePage } from "@inertiajs/react";
import OperatorSekolahLayout from "@/Layouts/OperatorSekolahLayout";
import OperatorKecamatanLayout from "@/Layouts/OperatorKecamatanLayout";
import HomeClassroomLayout from "@/Layouts/SupervisorKPM/Classroom/HomeClassroomLayout";
import Sidebar from "@/Components/supervisor/Sidebar/Sidebar";
import SupervisorHeader from "@/Components/supervisor/Header/Header";
import Input from "@/Components/InputField";
import Label from "@/Components/Label";
import InputError from "@/Components/InputError";
import Button from "@/Components/Button";
import LoaderOnButton from "@/Components/LoaderOnButtn";

const SettingsForm = ({ user, roleLabel, affiliation }) => {
    const { data, setData, patch, processing, errors, reset, recentlySuccessful } = useForm({
        name: user?.name || "",
        username: user?.username || "",
        email: user?.email || "",
        current_password: "",
        password: "",
        password_confirmation: "",
    });

    const flash = usePage().props.flash?.message;
    const flashMessage = typeof flash === "string" ? { success: flash } : flash;
    const isSupervisor = user?.role === "supervisor" || user?.role === "supervisor_kpm";
    const affiliationLabel = user?.role === "opt-sekolah" ? "Sekolah" : "Kecamatan";

    const submit = (e) => {
        e.preventDefault();
        patch("/pengaturan-akun", {
            preserveScroll: true,
            onSuccess: () => {
                reset("current_password", "password", "password_confirmation");
            },
        });
    };

    return (
        <div className="mx-auto w-full max-w-3xl space-y-6 py-2">
            <Head title="Pengaturan Akun" />

            <div>
                <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
                    Pengaturan Akun
                </h1>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Kelola data pribadi, username, email, dan password akun Anda.
                </p>
            </div>

            {flashMessage?.success && (
                <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700 dark:border-green-900/50 dark:bg-green-950/30 dark:text-green-300">
                    {flashMessage.success}
                </div>
            )}

            {flashMessage?.error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
                    {flashMessage.error}
                </div>
            )}

            {recentlySuccessful && !flashMessage?.success && (
                <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
                    Perubahan berhasil disimpan.
                </div>
            )}

            <form onSubmit={submit} className="space-y-6">
                <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                    <div className="border-b border-gray-100 pb-4 dark:border-gray-800">
                        <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                            Data Pribadi
                        </h2>
                        <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                            Informasi akun dan data pribadi yang terdaftar di sistem.
                        </p>
                    </div>

                    <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
                        <div className="md:col-span-2">
                            <Label htmlFor="name">
                                Nama Lengkap <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="name"
                                name="name"
                                value={data.name}
                                onChange={(e) => setData("name", e.target.value)}
                                error={!!errors.name}
                                placeholder="Nama lengkap"
                            />
                            {errors.name && <InputError message={errors.name} />}
                        </div>

                        <div>
                            <Label htmlFor="username">
                                {isSupervisor ? "NIP / Username" : "Username"}{" "}
                                <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="username"
                                name="username"
                                value={data.username}
                                onChange={(e) => setData("username", e.target.value)}
                                error={!!errors.username}
                                placeholder="Username"
                            />
                            {errors.username && <InputError message={errors.username} />}
                            <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">
                                Username digunakan untuk login. Perubahan akan mengubah kredensial login Anda.
                            </p>
                        </div>

                        <div>
                            <Label htmlFor="email">
                                Email <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                value={data.email}
                                onChange={(e) => setData("email", e.target.value)}
                                error={!!errors.email}
                                placeholder="nama@example.com"
                            />
                            {errors.email && <InputError message={errors.email} />}
                        </div>

                        <div>
                            <Label>Role</Label>
                            <div className="flex h-11 items-center rounded-lg border border-gray-200 bg-gray-50 px-4 text-sm font-medium text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
                                {roleLabel}
                            </div>
                        </div>

                        {affiliation && (
                            <div>
                                <Label>{affiliationLabel}</Label>
                                <div className="flex h-11 items-center rounded-lg border border-gray-200 bg-gray-50 px-4 text-sm font-medium text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
                                    {affiliation}
                                </div>
                            </div>
                        )}
                    </div>
                </section>

                <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                    <div className="border-b border-gray-100 pb-4 dark:border-gray-800">
                        <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                            Keamanan Akun
                        </h2>
                        <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                            Kosongkan kolom password jika tidak ingin mengganti password.
                        </p>
                    </div>

                    <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
                        <div className="md:col-span-2">
                            <Label htmlFor="current_password">Password Saat Ini</Label>
                            <Input
                                id="current_password"
                                name="current_password"
                                type="password"
                                value={data.current_password}
                                onChange={(e) => setData("current_password", e.target.value)}
                                error={!!errors.current_password}
                                placeholder="Wajib diisi jika mengganti password"
                            />
                            {errors.current_password && (
                                <InputError message={errors.current_password} />
                            )}
                        </div>

                        <div>
                            <Label htmlFor="password">Password Baru</Label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                value={data.password}
                                onChange={(e) => setData("password", e.target.value)}
                                error={!!errors.password}
                                placeholder="Minimal 8 karakter"
                            />
                            {errors.password && <InputError message={errors.password} />}
                        </div>

                        <div>
                            <Label htmlFor="password_confirmation">Konfirmasi Password Baru</Label>
                            <Input
                                id="password_confirmation"
                                name="password_confirmation"
                                type="password"
                                value={data.password_confirmation}
                                onChange={(e) => setData("password_confirmation", e.target.value)}
                                error={!!errors.password}
                                placeholder="Ulangi password baru"
                            />
                        </div>
                    </div>
                </section>

                <div className="flex items-center justify-end gap-3">
                    <Button
                        type="submit"
                        disabled={processing}
                        className="!bg-brand-500 hover:!bg-brand-600"
                    >
                        {processing ? <LoaderOnButton /> : "Simpan Pengaturan"}
                    </Button>
                </div>
            </form>
        </div>
    );
};

const Edit = (props) => {
    const content = <SettingsForm {...props} />;

    if (props.user?.role === "opt-sekolah") {
        return <OperatorSekolahLayout>{content}</OperatorSekolahLayout>;
    }

    if (props.user?.role === "opt-kecamatan") {
        return <OperatorKecamatanLayout>{content}</OperatorKecamatanLayout>;
    }

    if (props.user?.role === "supervisor_kpm") {
        return <HomeClassroomLayout>{content}</HomeClassroomLayout>;
    }

    if (props.user?.role === "supervisor") {
        return (
            <section className="main flex">
                <div className="sidebarWrapper flex bg-[#1c2434]">
                    <Sidebar tabId={0} />
                </div>
                <div className="flex-grow ml-72">
                    <SupervisorHeader />
                    <div className="p-4 md:p-6">{content}</div>
                </div>
            </section>
        );
    }

    return content;
};

export default Edit;
