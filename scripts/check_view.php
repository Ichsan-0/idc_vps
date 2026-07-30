<?php
require 'vendor/autoload.php';
$app = require 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

try {
    $views = DB::select("SHOW FULL TABLES WHERE Table_type = 'VIEW'");
    if (count($views) === 0) {
        echo "NO VIEWS FOUND\n";
    } else {
        foreach ($views as $v) {
            $vals = array_values((array)$v);
            echo $vals[0] . "\n";
        }
    }
} catch (Exception $e) {
    echo 'Error: ' . $e->getMessage() . "\n";
}
