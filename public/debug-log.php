<?php
header('Content-Type: text/plain; charset=utf-8');

echo "=========================================\n";
echo "          IDC SERVER DIAGNOSTICS         \n";
echo "=========================================\n\n";

// 1. Cek Kredensial Env Sevima
echo "[1] MEMERIKSA KONFIGURASI SEVIMA:\n";
echo "SEVIMA_BASE_URL: " . env('SEVIMA_BASE_URL', 'https://api.sevimaplatform.com/siakadcloud/v1') . "\n";
echo "SEVIMA_APP_KEY: " . (env('SEVIMA_APP_KEY') ? substr(env('SEVIMA_APP_KEY'), 0, 5) . '...' : 'KOSONG / TIDAK TERBACA') . "\n";
echo "SEVIMA_APP_SECRET: " . (env('SEVIMA_APP_SECRET') ? substr(env('SEVIMA_APP_SECRET'), 0, 5) . '...' : 'KOSONG / TIDAK TERBACA') . "\n\n";

// 2. Cek Koneksi ke API Sevima dari PHP Web Server
echo "[2] MENCOBA HIT API SEVIMA DARI WEB SERVER (GET /mahasiswa/220212005):\n";
$baseUrl = env('SEVIMA_BASE_URL', 'https://api.sevimaplatform.com/siakadcloud/v1');
$appKey = env('SEVIMA_APP_KEY');
$secretKey = env('SEVIMA_APP_SECRET');

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $baseUrl . "/mahasiswa/220212005");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); // Sesuai withoutVerifying()
curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
curl_setopt($ch, CURLOPT_TIMEOUT, 10);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "X-App-Key: " . $appKey,
    "X-Secret-Key: " . $secretKey,
    "Accept: application/json"
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlErrNo = curl_errno($ch);
$curlError = curl_error($ch);
curl_close($ch);

if ($curlErrNo) {
    echo "CURL ERROR (#$curlErrNo): $curlError\n\n";
} else {
    echo "HTTP STATUS: $httpCode\n";
    echo "RESPONSE BODY:\n$response\n\n";
}

// 3. Dump 50 Baris Terakhir Laravel Log
echo "[3] 50 BARIS TERAKHIR DARI LARAVEL.LOG:\n";
echo "-----------------------------------------\n";
$logPath = __DIR__ . '/../storage/logs/laravel.log';
if (file_exists($logPath)) {
    $lines = file($logPath);
    $count = count($lines);
    $start = max(0, $count - 50);
    for ($i = $start; $i < $count; $i++) {
        echo $lines[$i];
    }
} else {
    echo "File log tidak ditemukan di: $logPath\n";
}
echo "-----------------------------------------\n";
