<?php

namespace Database\Seeders;

use App\Models\Data;
use App\Models\Sertifikat;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{

    public function run(): void
    {

        $users = [
            ['name' => 'Rifa Ulkhairi', 'email' => 'rifaulkhairi05@gmail.com', 'username' => 'rifaulkhairi05@gmail.com', 'role' => 'admin'],
            ['name' => 'Rifa Ulkhairi', 'email' => 'supervisor@gmail.com', 'username' => '200205002', 'role' => 'supervisor'],


        ];

        foreach ($users as $user) {
            User::factory()->create($user);
        }
        Sertifikat::create([
            'kode' => 'B-',
            'kode_universitas' => '/Un.08',
            'kode_idc' => '/IDC',
            'kode_jenis_surat' => '/Kp.07.6',
            'bulan_tahun' => '/12/2024'
        ]);

        Data::create();
    }
}
