import { useMemo } from "react";
import LownganKPMCard from "@/Components/Mahasiswa/LownganKPMCard";
import LowonganKPMSkeleton from "./LowonganKPMCardSkeleton";
import { kabupaten, kecamatan, desa } from "daftar-wilayah-indonesia";

export default function LowonganList({ data, loading }) {
    // Handle null/undefined data
    const safeData = useMemo(() => data || [], [data]);

    // Pre-cache kabupaten Aceh ("11")
    const kabupatenMap = useMemo(() => {
        try {
            const list = kabupaten("11");
            return Object.fromEntries(
                list.map(item => [item.kode, item.nama])
            );
        } catch (error) {
            console.error("Error loading kabupaten:", error);
            return {};
        }
    }, []);

    // Pre-cache semua kecamatan dari semua regency dalam data
    const kecamatanMap = useMemo(() => {
        const map = {};
        
        // Validasi data sebelum diproses
        if (!Array.isArray(safeData) || safeData.length === 0) {
            return map;
        }

        safeData.forEach((kpm) => {
            if (kpm?.regency && !map[kpm.regency]) {
                try {
                    const list = kecamatan(kpm.regency);
                    list?.forEach(item => {
                        if (item?.kode && item?.nama) {
                            map[item.kode] = item.nama;
                        }
                    });
                } catch (error) {
                    console.error(`Error loading kecamatan for regency ${kpm.regency}:`, error);
                }
            }
        });
        return map;
    }, [safeData]);

    // Pre-cache semua desa dari semua sub_district dalam data
    const desaMap = useMemo(() => {
        const map = {};
        
        if (!Array.isArray(safeData) || safeData.length === 0) {
            return map;
        }

        safeData.forEach((kpm) => {
            if (kpm?.sub_district && !map[kpm.sub_district]) {
                try {
                    const list = desa(kpm.sub_district);
                    list?.forEach(item => {
                        if (item?.kode && item?.nama) {
                            map[item.kode] = item.nama;
                        }
                    });
                } catch (error) {
                    console.error(`Error loading desa for sub_district ${kpm.sub_district}:`, error);
                }
            }
        });
        return map;
    }, [safeData]);

    // Optimized getLocationDetails dengan null safety
    const getLocationDetails = (kpm) => {
        if (!kpm) return "";
        
        const kab = kabupatenMap[kpm.regency] || "";
        const kec = kecamatanMap[kpm.sub_district] || "";
        const des = desaMap[kpm.village] || "";
        
        // Hapus bagian yang kosong
        const parts = [kab, kec, des].filter(part => part && part.trim());
        return parts.join(", ") || "Lokasi tidak tersedia";
    };

    return (
        <div className="flex flex-col gap-y-3">
            {loading
                ? [...Array(10)].map((_, i) => <LowonganKPMSkeleton key={i} />)
                : safeData.map((kpm, index) => (
                      <LownganKPMCard
                          key={kpm?.id || index}
                          kpm={kpm}
                          index={index}
                          locationDetails={getLocationDetails(kpm)}
                      />
                  ))}
        </div>
    );
}