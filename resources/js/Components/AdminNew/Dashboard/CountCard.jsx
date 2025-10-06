import Badge from "@/Components/Badge";
import {
    ArrowDownIcon,
    ArrowUpIcon,
    BuildingLibraryIcon,
    DocumentIcon,
    DocumentPlusIcon,
    HomeIcon,
    UsersIcon,
} from "@heroicons/react/24/outline";
import {
    ApprovalRounded,
    ErrorRounded,
    Female,
    Male,
    SupervisorAccount,
} from "@mui/icons-material";
import { IoEnter } from "react-icons/io5";
import { PiEmpty } from "react-icons/pi";

export default function CountCard({ data = [] }) {
    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6">
            {/* <!-- Metric Item Start --> */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
                <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
                    <UsersIcon className="text-gray-800 size-6 dark:text-white/90" />
                </div>

                <div className="flex items-end justify-between mt-5">
                    <div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                            Pengguna
                        </span>
                        <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
                            {data?.pengguna}
                        </h4>
                    </div>
                    <Badge color="success">
                        <ArrowUpIcon />
                        00.0%
                    </Badge>
                </div>
            </div>
            {/* <!-- Metric Item End --> */}

            {/* <!-- Metric Item Start --> */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
                <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
                    <BuildingLibraryIcon className="text-gray-800 size-6 dark:text-white/90" />
                </div>
                <div className="flex items-end justify-between mt-5">
                    <div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                            Sekolah
                        </span>
                        <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
                            {data?.sekolah}
                        </h4>
                    </div>

                    <Badge color="success">
                        <ArrowDownIcon />
                        00.0%
                    </Badge>
                </div>
            </div>
            {/* <!-- Metric Item End --> */}

            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
                <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
                    <HomeIcon className="text-gray-800 size-6 dark:text-white/90" />
                </div>
                <div className="flex items-end justify-between mt-5">
                    <div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                            Desa
                        </span>
                        <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
                            {data?.jumlah_desa}
                        </h4>
                    </div>

                    <Badge color="success">
                        <ArrowDownIcon />
                        00.0%
                    </Badge>
                </div>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
                <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
                    <DocumentIcon className="text-gray-800 size-6 dark:text-white/90" />
                </div>
                <div className="flex items-end justify-between mt-5">
                    <div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                            Lowongan PPL
                        </span>
                        <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
                            {data?.jumlah_desa}
                        </h4>
                    </div>

                    <Badge color="success">
                        <ArrowDownIcon />
                        00.0%
                    </Badge>
                </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
                <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
                    <SupervisorAccount className="text-gray-800 size-6 dark:text-white/90" />
                </div>
                <div className="flex items-end justify-between mt-5">
                    <div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                            Total Supervisor
                        </span>
                        <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
                            {data?.supervisor}
                        </h4>
                    </div>

                    <Badge color="success">
                        <ArrowDownIcon />
                        00.0%
                    </Badge>
                </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
                <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
                    <SupervisorAccount className="text-gray-800 size-6 dark:text-white/90" />
                </div>
                <div className="flex items-end justify-between mt-5">
                    <div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                            Total Pendaftar
                        </span>
                        <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
                            {data?.mahasiswappl}
                        </h4>
                    </div>

                    <Badge color="success">
                        <ArrowDownIcon />
                        00.0%
                    </Badge>
                </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
                <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
                    <ApprovalRounded className="text-gray-800 size-6 dark:text-white/90" />
                </div>
                <div className="flex items-end justify-between mt-5">
                    <div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                            Lulus Biodata
                        </span>
                        <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
                            {data?.mahasiswa_lulus_biodata}
                        </h4>
                    </div>

                    <Badge color="success">
                        <ArrowDownIcon />
                        00.0%
                    </Badge>
                </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
                <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
                    <Female className="text-gray-800 size-6 dark:text-white/90" />
                </div>
                <div className="flex items-end justify-between mt-5">
                    <div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                            Perempuan
                        </span>
                        <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
                            {data?.jumlah_wanita}
                        </h4>
                    </div>

                    <Badge color="success">
                        <ArrowDownIcon />
                        00.0%
                    </Badge>
                </div>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
                <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
                    <Male className="text-gray-800 size-6 dark:text-white/90" />
                </div>
                <div className="flex items-end justify-between mt-5">
                    <div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                            Laki-Laki
                        </span>
                        <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
                            {data?.jumlah_pria}
                        </h4>
                    </div>

                    <Badge color="success">
                        <ArrowDownIcon />
                        00.0%
                    </Badge>
                </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
                <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
                    <ErrorRounded className="text-gray-800 size-6 dark:text-white/90" />
                </div>
                <div className="flex items-end justify-between mt-5">
                    <div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                            Tidak Lulus Biodata
                        </span>
                        <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
                            {data?.jumlah_wanita}
                        </h4>
                    </div>

                    <Badge color="success">
                        <ArrowDownIcon />
                        00.0%
                    </Badge>
                </div>
            </div>
             <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
                <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
                    <PiEmpty className="text-gray-800 size-6 dark:text-white/90" />
                </div>
                <div className="flex items-end justify-between mt-5">
                    <div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                            Belum Lengkap Biodata
                        </span>
                        <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
                            {data?.mahasiswa_belum_lengkap_biodata}
                        </h4>
                    </div>

                    <Badge color="success">
                        <ArrowDownIcon />
                        00.0%
                    </Badge>
                </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
                <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
                    <PiEmpty className="text-gray-800 size-6 dark:text-white/90" />
                </div>
                <div className="flex items-end justify-between mt-5">
                    <div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                            Total Butuh Review Biodata
                        </span>
                        <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
                            {data?.mahasiswa_review}
                        </h4>
                    </div>

                    <Badge color="success">
                        <ArrowDownIcon />
                        00.0%
                    </Badge>
                </div>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
                <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
                    <IoEnter className="text-gray-800 size-6 dark:text-white/90" />
                </div>
                <div className="flex items-end justify-between mt-5">
                    <div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                            Lamaran PPL Masuk
                        </span>
                        <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
                            {data?.jumlah_lamaran_ppl_masuk}
                        </h4>
                    </div>

                    <Badge color="success">
                        <ArrowDownIcon />
                        00.0%
                    </Badge>
                </div>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
                <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
                    <IoEnter className="text-gray-800 size-6 dark:text-white/90" />
                </div>
                <div className="flex items-end justify-between mt-5">
                    <div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                            Lamaran KPM Masuk
                        </span>
                        <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
                            {data?.jumlah_lamaran_kpm_masuk}
                        </h4>
                    </div>

                    <Badge color="success">
                        <ArrowDownIcon />
                        00.0%
                    </Badge>
                </div>
            </div>
        </div>
    );
}
