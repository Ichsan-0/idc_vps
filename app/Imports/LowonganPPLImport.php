<?php

namespace App\Imports;

use App\Models\LowonganPPL;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\ToModel;


class LowonganPPLImport implements ToCollection, ToModel
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
            LowonganPPL::create([
                'name' => $row[2],
                'id_sekolah' => $row[0],
            ]);
        }
    }
}
