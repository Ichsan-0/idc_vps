<?php

namespace App\Imports\SuperAdmin;

use App\Models\Mahasiswa;
use App\Models\User;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Hash;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class MahasiswaImport implements ToCollection
{
    public function collection(Collection $rows)
    {
        $users = [];
        $mahasiswa = [];

        $rows = $rows->skip(1);

        foreach ($rows as $row) {
            if (empty($row[1])) continue;

            $users[] = [
                'name' => $row[1],
                'email' => $row[2] . '@student.ar-raniry.ac.id',
                'username' => $row[2],
                'role' => 'user',
                'password' => Hash::make($row[2]),

            ];

            $mahasiswa[] = [
                'nim' => $row[2],
                'id_prodi' => $row[5],
                'no_hp_wa' => $row[6],
                'cluster_kegiatan' => $row[7]

            ];
        }

        User::insert($users);
        Mahasiswa::insert($mahasiswa);
    }
}

