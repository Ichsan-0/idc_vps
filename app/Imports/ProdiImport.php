<?php

namespace App\Imports;

use App\Models\Prodi;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\ToModel;

class ProdiImport implements ToCollection, ToModel
{

    private $current = 0;


    /**
     * @param Collection $collection
     */
    public function collection(Collection $collection) {}

    public function model(array $row)
    {
        $this->current += 1;
        if ($this->current > 1) {
            $prodimodel = new Prodi;
            $prodimodel->name = $row[1];
            $prodimodel->kode = $row[2];
            $prodimodel->save();
        }
    }
}
