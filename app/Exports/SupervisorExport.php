<?php

namespace App\Exports;

use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;

class SupervisorExport implements FromCollection, WithHeadings
{
    /**
     * @return \Illuminate\Support\Collection
     */
    public function collection()
    {
        return DB::table('users as us')
            ->selectRaw(
                'ROW_NUMBER() OVER (ORDER BY us.id) AS row_index,
                us.name,
                us.email,
                us.username,
                us.username as password'
            )
            ->where('us.role', 'supervisor_kpm')->get();
    }
    public function headings(): array
    {
        return ['No', 'Nama', 'Email', 'Username', 'Password'];
    }
}
