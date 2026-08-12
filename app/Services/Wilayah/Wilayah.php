<?php

namespace App\Services\Wilayah;

class Wilayah
{
    private static $cachedProvinsi = null;
    private static $cachedKabupaten = null;
    private static $cachedKecamatan = null;
    private static $cachedDesa = null;

    private static $provinsiMap = null;
    private static $kabupatenMap = null;
    private static $kecamatanMap = null;
    private static $desaMap = null;

    private static function m(string $o = ''): string
    {
        $b = explode(' ', $o);
        $t = [];

        foreach ($b as $d) {
            $t[] = ucfirst(strtolower($d));
        }

        return implode(' ', $t);
    }

    private static function me(array $dt = [], bool $ke = false, string $ked = ''): array
    {
        $ha = [];

        foreach ($dt as $daa) {
            $du = explode(',', $daa);
            
            // Debug: cek apakah array memiliki cukup elemen
            if (count($du) < 2) {
                continue; // Skip data yang tidak valid
            }
            
            if ($ke) {
                // Untuk data dengan 3 bagian (kode, kode_parent, nama)
                if (count($du) >= 3) {
                    $ha[] = [
                        'kode' => $du[0],
                        $ked => $du[1],
                        'nama' => self::m($du[2]),
                    ];
                }
            } else {
                // Untuk data dengan 2 bagian (kode, nama)
                $ha[] = [
                    'kode' => $du[0],
                    'nama' => self::m($du[1]),
                ];
            }
        }

        return $ha;
    }

    private static function inti(string $d = '', string $k = '', bool $ko = true): array
    {
        return self::me(explode('-', $d), $ko, $k);
    }

    public static function provinsi(): array
    {
        if (self::$cachedProvinsi === null) {
            $provinsi = require __DIR__ . '/provinsi.php';
            self::$cachedProvinsi = self::inti($provinsi, '', false);
        }
        return self::$cachedProvinsi;
    }

    public static function kabupaten(string $kode = ''): array
    {
        if (self::$cachedKabupaten === null) {
            $kabupaten = require __DIR__ . '/kabupaten.php';
            self::$cachedKabupaten = self::inti($kabupaten, 'kode_provinsi');
        }

        if ($kode !== '') {
            $ss = array_values(array_filter(self::$cachedKabupaten, fn ($d) => $d['kode_provinsi'] === $kode));
            return count($ss) ? $ss : [];
        }

        return self::$cachedKabupaten;
    }

    public static function kecamatan(string $kode = ''): array
    {
        if (self::$cachedKecamatan === null) {
            $kecamatan = require __DIR__ . '/kecamatan.php';
            self::$cachedKecamatan = self::inti($kecamatan, 'kode_kabupaten');
        }

        if ($kode !== '') {
            $ss = array_values(array_filter(self::$cachedKecamatan, fn ($d) => $d['kode_kabupaten'] === $kode));
            return count($ss) ? $ss : [];
        }

        return self::$cachedKecamatan;
    }

    public static function desa(string $kode = ''): array
    {
        if (self::$cachedDesa === null) {
            $desa = require __DIR__ . '/desa.php';
            self::$cachedDesa = self::inti($desa, 'kode_kecamatan');
        }

        if ($kode !== '') {
            $ss = array_values(array_filter(self::$cachedDesa, fn ($d) => $d['kode_kecamatan'] === $kode));
            return count($ss) ? $ss : [];
        }

        return self::$cachedDesa;
    }
    
    // Helper method untuk mendapatkan nama berdasarkan kode
    public static function getNamaProvinsi($kode)
    {
        if (self::$provinsiMap === null) {
            self::$provinsiMap = [];
            foreach (self::provinsi() as $item) {
                self::$provinsiMap[$item['kode']] = $item['nama'];
            }
        }
        return self::$provinsiMap[$kode] ?? null;
    }
    
    public static function getNamaKabupaten($kode)
    {
        if (self::$kabupatenMap === null) {
            self::$kabupatenMap = [];
            foreach (self::kabupaten() as $item) {
                self::$kabupatenMap[$item['kode']] = $item['nama'];
            }
        }
        return self::$kabupatenMap[$kode] ?? null;
    }
    
    public static function getNamaKecamatan($kode)
    {
        if (self::$kecamatanMap === null) {
            self::$kecamatanMap = [];
            foreach (self::kecamatan() as $item) {
                self::$kecamatanMap[$item['kode']] = $item['nama'];
            }
        }
        return self::$kecamatanMap[$kode] ?? null;
    }
    
    public static function getNamaDesa($kode)
    {
        if (self::$desaMap === null) {
            self::$desaMap = [];
            foreach (self::desa() as $item) {
                self::$desaMap[$item['kode']] = $item['nama'];
            }
        }
        return self::$desaMap[$kode] ?? null;
    }
}