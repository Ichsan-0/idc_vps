<?php

namespace App\Imports;

use App\Models\User;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Hash;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\ToModel;


class SupervisorImport implements ToCollection, ToModel
{
    private $current = 0;

    /**
     * @param Collection $collection
     */
    public function collection(Collection $collection)
    {
        //
    }
    public function model(array $row)
    {

        $this->current += 1;
        if ($this->current > 1) {

            User::create([
                'name' => $row[1],
                'email' => $row[3],
                'username' => $row[4],
                'role' => 'supervisor_kpm',
                'password' => Hash::make($row[4]),
            ]);
        }
    }
}
