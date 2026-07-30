<?php
require 'vendor/autoload.php';
$app = require 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

try {
    // Test basic query pada view
    $rows = DB::table('nilai_ppkpm_view')->limit(3)->get();
    echo "Query OK, rows count: " . count($rows) . "\n";
    if (count($rows) > 0) {
        echo "Columns: " . implode(', ', array_keys((array)$rows[0])) . "\n";
        echo "Sample row:\n";
        print_r($rows[0]);
    }
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . " Line: " . $e->getLine() . "\n";
}

echo "\n--- Test paginate ---\n";
try {
    $data = DB::table('nilai_ppkpm_view')->paginate(50);
    echo "Paginate OK. Total: " . $data->total() . "\n";
} catch (Exception $e) {
    echo "Paginate ERROR: " . $e->getMessage() . "\n";
}

echo "\n--- Test with gelombang filter ---\n";
try {
    $gelombangList = DB::table('gelombang_tbl')->get();
    echo "Gelombang count: " . count($gelombangList) . "\n";
    if (count($gelombangList) > 0) {
        $firstId = $gelombangList[0]->id;
        echo "First gelombang id: $firstId\n";
        $filtered = DB::table('nilai_ppkpm_view')
            ->where('id_gelombang_tertinggi', $firstId)
            ->paginate(50);
        echo "Filtered total: " . $filtered->total() . "\n";
    }
} catch (Exception $e) {
    echo "Filter ERROR: " . $e->getMessage() . "\n";
}
