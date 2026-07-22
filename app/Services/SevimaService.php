<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class SevimaService
{
    protected $baseUrl;
    protected $appKey;
    protected $secretKey;

    public function __construct()
    {
        $this->baseUrl   = config('services.sevima.base_url');
        $this->appKey    = config('services.sevima.app_key');
        $this->secretKey = config('services.sevima.app_secret');
    }

    protected function request($endpoint)
    {
        return Http::withoutVerifying()
            ->timeout(15)
            ->withHeaders([
                'X-App-Key'    => $this->appKey,
                'X-Secret-Key' => $this->secretKey,
                'Accept'       => 'application/json',
            ])->get($this->baseUrl . $endpoint);
    }

    public function getMahasiswa()
    {
        return $this->request('/mahasiswa');
    }

    public function getMahasiswaByNim($nim)
    {
        return $this->request('/mahasiswa/' . $nim);
    }

    public function getPerwalianMahasiswa($nim)
    {
        return $this->request('/mahasiswa/' . $nim . '/perwalian');
    }

    public function getTranskripMahasiswa($nim)
    {
        return $this->request('/mahasiswa/' . $nim . '/transkrip');
    }

    public function getBaseUrl()
    {
        return $this->baseUrl;
    }
}
