<?php

namespace App\Imports;

use App\Models\Mahasiswa;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\ToModel;


class MahasiswaImport implements ToCollection, ToModel
{
    private $current = 0;


    /**
     * @param Collection $collection
     */
    public function collection(Collection $collection)
    {
    }

    public function model(array $row)
    {
        // dd($row);
        $this->current += 1;
        // dd($this->current);
        DB::transaction(function () use ($row) {
            $user = User::create([
                'name' => $row[1],
                'email' => $row[2] . '@student.ar-raniry.ac.id',
                'username' => $row[2],
                'role' => 'user',
                'password' => Hash::make($row[2]),
            ]);


            Mahasiswa::create([
                'nim' => $row[2],
                'id_prodi' => $row[5],
                'no_hp_wa' => $row[7],
                'id_lowongan_ppl' => $row[6],

            ]);
        });
    }
}
