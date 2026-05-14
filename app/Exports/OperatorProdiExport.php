<?php

namespace App\Exports;

use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;

class OperatorProdiExport implements FromCollection, WithHeadings
{
    public function collection()
    {
        return DB::table('users as us')
            ->selectRaw(
                'ROW_NUMBER() OVER (ORDER BY us.id) AS row_index,
                us.name,
                us.email,
                us.username,
                "ppkpm2025" as password'
            )
            ->where('us.role', 'opt-sekolah')->get();
    }
    public function headings(): array
    {
        return ['No', 'Nama Sekolah', 'Email', 'Username', 'Password'];
    }
}
