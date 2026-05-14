import { useMemo } from "react";
import { kabupaten, kecamatan, desa } from "daftar-wilayah-indonesia";
import LowonganPPLCard from "./LowonganPPLCard";
import LowonganKPMSkeleton from "../LowonganKPM/LowonganKPMCardSkeleton";

export default function LowonganList({ data, loading }) {
    // Handle null/undefined data
    const safeData = useMemo(() => {
        if (!data || !Array.isArray(data)) {
            return [];
        }
        return data;
    }, [data]);

    // Pre-cache kabupaten Aceh ("11")
    const kabupatenMap = useMemo(() => {
        try {
            const list = kabupaten("11");
            if (!Array.isArray(list)) {
                console.warn("kabupaten API tidak mengembalikan array");
                return {};
            }
            return Object.fromEntries(
                list
                    .filter(item => item?.kode && item?.nama)
                    .map((item) => [item.kode, item.nama])
            );
        } catch (error) {
            console.error("Error loading kabupaten:", error);
            return {};
        }
    }, []);

    // Pre-cache semua kecamatan dari semua regency dalam data
    const kecamatanMap = useMemo(() => {
        const map = {};
        
        if (!Array.isArray(safeData) || safeData.length === 0) {
            return map;
        }

        const processedRegencies = new Set();
        
        safeData.forEach((ppl) => {
            const regencyCode = ppl?.regency;
            if (regencyCode && !processedRegencies.has(regencyCode)) {
                processedRegencies.add(regencyCode);
                try {
                    const list = kecamatan(regencyCode);
                    if (Array.isArray(list)) {
                        list.forEach((item) => {
                            if (item?.kode && item?.nama) {
                                map[item.kode] = item.nama;
                            }
                        });
                    }
                } catch (error) {
                    console.error(`Error loading kecamatan for regency ${regencyCode}:`, error);
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

        const processedSubDistricts = new Set();
        
        safeData.forEach((ppl) => {
            const subDistrictCode = ppl?.sub_district;
            if (subDistrictCode && !processedSubDistricts.has(subDistrictCode)) {
                processedSubDistricts.add(subDistrictCode);
                try {
                    const list = desa(subDistrictCode);
                    if (Array.isArray(list)) {
                        list.forEach((item) => {
                            if (item?.kode && item?.nama) {
                                map[item.kode] = item.nama;
                            }
                        });
                    }
                } catch (error) {
                    console.error(`Error loading desa for sub_district ${subDistrictCode}:`, error);
                }
            }
        });
        return map;
    }, [safeData]);

    // Optimized getLocationDetails dengan null safety
    const getLocationDetails = (ppl) => {
        if (!ppl) {
            return "Data tidak tersedia";
        }
        
        const kab = ppl.regency ? kabupatenMap[ppl.regency] || "" : "";
        const kec = ppl.sub_district ? kecamatanMap[ppl.sub_district] || "" : "";
        const des = ppl.village ? desaMap[ppl.village] || "" : "";
        
        // Filter out empty strings dan gabungkan
        const parts = [kab, kec, des].filter(part => part && part.trim() !== "");
        
        if (parts.length === 0) {
            return "Lokasi belum tersedia";
        }
        
        return parts.join(", ");
    };

    // Tampilkan skeleton saat loading
    if (loading) {
        return (
            <div className="flex flex-col gap-y-3">
                {[...Array(10)].map((_, i) => (
                    <LowonganKPMSkeleton key={`skeleton-${i}`} />
                ))}
            </div>
        );
    }

    // Tampilkan pesan jika tidak ada data
    if (!Array.isArray(safeData) || safeData.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500">
                Tidak ada data lowongan PPL yang tersedia
            </div>
        );
    }

    // Tampilkan data
    return (
        <div className="flex flex-col gap-y-3">
            {safeData.map((ppl, index) => (
                <LowonganPPLCard
                    key={ppl?.id ? `ppl-${ppl.id}` : `ppl-${index}`}
                    ppl={ppl || {}}
                    index={index}
                    locationDetails={getLocationDetails(ppl)}
                />
            ))}
        </div>
    );
}