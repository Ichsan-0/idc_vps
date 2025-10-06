import { useMemo } from "react";
import LownganKPMCard from "@/Components/Mahasiswa/LownganKPMCard";
import LowonganKPMSkeleton from "./LowonganKPMCardSkeleton";
import { kabupaten, kecamatan, desa } from "daftar-wilayah-indonesia";

export default function LowonganList({ data, loading }) {
    // Pre-cache kabupaten Aceh ("11")
    const kabupatenMap = useMemo(() => {
        const list = kabupaten("11");
        return Object.fromEntries(list.map(item => [item.kode, item.nama]));
    }, []);

    // Pre-cache semua kecamatan dari semua regency dalam data
    const kecamatanMap = useMemo(() => {
        const map = {};
        data.forEach((kpm) => {
            if (!map[kpm.regency]) {
                const list = kecamatan(kpm.regency);
                list.forEach(item => {
                    map[item.kode] = item.nama;
                });
            }
        });
        return map;
    }, [data]);

    // Pre-cache semua desa dari semua sub_district dalam data
    const desaMap = useMemo(() => {
        const map = {};
        data.forEach((kpm) => {
            if (!map[kpm.sub_district]) {
                const list = desa(kpm.sub_district);
                list.forEach(item => {
                    map[item.kode] = item.nama;
                });
            }
        });
        return map;
    }, [data]);

    // Optimized getLocationDetails
    const getLocationDetails = (kpm) => {
        const kab = kabupatenMap[kpm.regency] || "";
        const kec = kecamatanMap[kpm.sub_district] || "";
        const des = desaMap[kpm.village] || "";
        return `${kab}, ${kec}, ${des}`;
    };

    return (
        <div className="flex flex-col gap-y-3">
            {loading
                ? [...Array(10)].map((_, i) => <LowonganKPMSkeleton key={i} />)
                : data.map((kpm, index) => (
                      <LownganKPMCard
                          key={kpm.id}
                          kpm={kpm}
                          index={index}
                          locationDetails={getLocationDetails(kpm)}
                      />
                  ))}
        </div>
    );
}
