<?php

namespace App\Imports;

use App\Models\Sekolah;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\ToModel;


class TempatPPLImport implements ToCollection, ToModel
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

            Sekolah::create([
                'name' => $row[1],
                'provinsi' => $row[2],
                'kabupaten' => $row[3],
                'kecamatan' => $row[4],
                'username_supervisor' => $row[5],

            ]);
        }
    }
}
