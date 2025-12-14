<?php

namespace App\Services\Wilayah;

class Wilayah
{
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

    private static function ut(string $ko = '', string $dt = '', string $te = '', bool $kon = true): array
    {
        if ($kon) {
            $hs = self::inti($dt, $te);

            if ($ko !== '') {
                $ss = array_values(array_filter($hs, fn ($d) => $d[$te] === $ko));
                return count($ss) ? $ss : [];
            }

            return $hs;
        }

        $provinsi = require __DIR__ . '/provinsi.php';
        return self::inti($provinsi, '', false);
    }

    public static function provinsi(): array
    {
        return self::ut('', '', '', false);
    }

    public static function kabupaten(string $kode = ''): array
    {
        return self::ut($kode, require __DIR__ . '/kabupaten.php', 'kode_provinsi');
    }

    public static function kecamatan(string $kode = ''): array
    {
        return self::ut($kode, require __DIR__ . '/kecamatan.php', 'kode_kabupaten');
    }

    public static function desa(string $kode = ''): array
    {
        return self::ut($kode, require __DIR__ . '/desa.php', 'kode_kecamatan');
    }
    
    // Helper method untuk mendapatkan nama berdasarkan kode
    public static function getNamaProvinsi($kode)
    {
        $provinsi = self::provinsi();
        $result = array_filter($provinsi, fn($item) => $item['kode'] == $kode);
        return count($result) ? reset($result)['nama'] : null;
    }
    
    public static function getNamaKabupaten($kode)
    {
        $kabupaten = self::kabupaten();
        $result = array_filter($kabupaten, fn($item) => $item['kode'] == $kode);
        return count($result) ? reset($result)['nama'] : null;
    }
    
    public static function getNamaKecamatan($kode)
    {
        $kecamatan = self::kecamatan();
        $result = array_filter($kecamatan, fn($item) => $item['kode'] == $kode);
        return count($result) ? reset($result)['nama'] : null;
    }
    
    public static function getNamaDesa($kode)
    {
        $desa = self::desa();
        $result = array_filter($desa, fn($item) => $item['kode'] == $kode);
        return count($result) ? reset($result)['nama'] : null;
    }
}