import { useMemo } from "react";
import { kabupaten, kecamatan, desa } from "daftar-wilayah-indonesia";
import LowonganPPLCard from "./LowonganPPLCard";
import LowonganKPMSkeleton from "../LowonganKPM/LowonganKPMCardSkeleton";

export default function LowonganList({ data, loading }) {
    // Pre-cache kabupaten Aceh ("11")
    const kabupatenMap = useMemo(() => {
        const list = kabupaten("11");
        return Object.fromEntries(list.map((item) => [item.kode, item.nama]));
    }, []);

    // Pre-cache semua kecamatan dari semua regency dalam data
    const kecamatanMap = useMemo(() => {
        const map = {};
        data.forEach((ppl) => {
            if (!map[ppl.regency]) {
                const list = kecamatan(ppl.regency);
                list.forEach((item) => {
                    map[item.kode] = item.nama;
                });
            }
        });
        return map;
    }, [data]);

    // Pre-cache semua desa dari semua sub_district dalam data
    const desaMap = useMemo(() => {
        const map = {};
        data.forEach((ppl) => {
            if (!map[ppl.sub_district]) {
                const list = desa(ppl.sub_district);
                list.forEach((item) => {
                    map[item.kode] = item.nama;
                });
            }
        });
        return map;
    }, [data]);

    // Optimized getLocationDetails
    const getLocationDetails = (ppl) => {
        // console.log("Debug:", {
        //     ppl: ppl,
        //     regency: ppl.regency,
        //     kab: kabupatenMap[ppl.regency],
        //     sub_district: ppl.sub_district,
        //     kec: kecamatanMap[ppl.sub_district],
        //     village: ppl.village,
        //     des: desaMap[ppl.village],
        // });
        const kab = kabupatenMap[ppl.regency] || "";
        const kec = kecamatanMap[ppl.sub_district] || "";
        const des = desaMap[ppl.village] || "";
        return `${kab}, ${kec}, ${des}`;
    };

    return (
        <div className="flex flex-col gap-y-3">
            {loading
                ? [...Array(10)].map((_, i) => <LowonganKPMSkeleton key={i} />)
                : data.map((ppl, index) => (
                      <LowonganPPLCard
                          key={ppl.id}
                          ppl={ppl}
                          index={index}
                          locationDetails={getLocationDetails(ppl)}
                      />
                  ))}
        </div>
    );
}
