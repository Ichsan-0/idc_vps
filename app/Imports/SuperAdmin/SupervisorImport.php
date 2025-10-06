<?php

namespace App\Imports\SuperAdmin;

use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\ToCollection;

class SupervisorImport implements ToCollection
{
    /**
    * @param Collection $collection
    */
    public function collection(Collection $collection)
    {
        //
    }
}
