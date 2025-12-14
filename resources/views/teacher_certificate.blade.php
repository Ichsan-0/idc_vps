<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{$name}}</title>
    <style>
        /* RESET SEMUA MARGIN DAN PADDING */
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        html,
        body {
            width: 100%;
            height: 100%;
            font-family: sans-serif;
        }

        body {
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            background-color: #f5f5f5;
        }

        .certificate-container {
            display: flex;
            flex-direction: column;
            align-items: center;
        }

        /* Container untuk setiap sertifikat */
        .certificate-page {
            position: relative;
            width: 100%;
            max-width: 862px;
            aspect-ratio: 862 / 620.51;
        }

        /* Template gambar */
        .template-image {
            width: 100%;
            height: 100%;
            display: block;
            object-fit: contain;
        }

        /* Container untuk semua teks overlay */
        .text-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
        }

        /* Style untuk semua teks sertifikat */
        .certificate-text {
            position: absolute;
            left: 50%;
            transform: translateX(-50%);
            text-align: center;
            margin: 0;
            padding: 0;
            line-height: 1;
            z-index: 10;
        }

        /* Container untuk nomor dan subtitle */
        #nomor-container {
            top: 40%;
            width: auto;
            white-space: nowrap;
        }

        /* Nomor sertifikat */
        .nomor-text {
            font-size: 10px;
            margin: 0;
            padding: 0;
            display: block;
            line-height: 1;
        }

        /* Subtitle "Diberikan Kepada" */
        .subtitle-text {
            font-size: 11px;
            margin: 0;
            padding: 0;
            display: block;
            line-height: 1.2;
        }

        /* Container untuk nama dan jabatan */
        #nama-container {
            top: 46%;
            width: 80%;
        }

        /* Container untuk signature */
        #signature-container {
            top: 68%;
            text-align: left;
            transform: none;
            left: auto;
            right: 23%;
        }

        /* Nama */
        .nama-text {
            font-size: 16px;
            font-weight: bold;
            margin: 0;
            padding: 0;
            display: block;
            line-height: 1;
            text-shadow: 1px 1px 2px rgba(255, 255, 255, 0.8);
        }

        /* Jabatan */
        .jabatan-text {
            font-size: 12px;
            margin: 0;
            font-weight: bold;
            padding: 0;
            display: block;
            line-height: 1.2;
        }

        .description-text {
            font-size: 12px;
            margin: 5px 0 0 0;
            font-weight: normal;
            padding: 0;
            display: block;
            line-height: 1.3;
        }

        /* Signature line styles */
        .signature-line {
            margin-top: 40px;
            /* Jarak untuk tanda tangan */
            width: 100%;
        }

        /* Tanggal signature */
        .signature-date {
            font-size: 13px;
            /* margin-bottom: 20px; */
        }

        .signature-jabatan {
            font-size: 13px;
            /* margin-bottom: 20px; */
        }

        /* STYLES KHUSUS UNTUK PAGE2 - TIDAK MEMPENGARUHI PAGE1 */
        /* Container untuk signature di page2 */
        #signature-left-page2 {
            position: absolute;
            top: 68%;
            left: 23%;
            text-align: left;
            z-index: 10;
        }

        #signature-right-page2 {
            position: absolute;
            top: 68%;
            right: 23%;
            text-align: left;
            z-index: 10;
        }

        /* Title container untuk page2 */
        #title2-container {
            position: absolute;
            top: 20%;
            left: 10%;
            text-align: left;
            transform: none;
            z-index: 10;
        }

        /* Styles untuk signature di page2 */
        .signature-date2 {
            font-size: 13px;
            margin-bottom: 5px;
        }

        .signature-jabatan2 {
            font-size: 13px;
            margin-top: 80px;
            /* Space untuk tanda tangan */
        }

        /* Print styles */
        @media print {
            body {
                background-color: white;
            }

            .certificate-container {
                padding: 0;
            }

            .certificate-page {
                page-break-after: always;
            }
        }
    </style>
</head>

<body>
    <div class="certificate-container">
        <!-- Halaman 1 -->
        <div class="certificate-page" id="page1">
            <img class="template-image" src="{{ asset('images/certificate/TemplateGuru1.jpg') }}" alt="Certificate Template 1">

            <!-- Container untuk semua teks -->
            <div class="text-overlay">
                <!-- Container untuk nomor dan subtitle -->
                <div id="nomor-container" class="certificate-text">
                    <span class="nomor-text">Nomor: {{$certificate_number}}</span>
                    <span class="subtitle-text">Diberikan Kepada</span>
                </div>

                <!-- Container untuk nama dan jabatan -->
                <div id="nama-container" class="certificate-text">
                    <span class="nama-text">{{$name}}</span>
                    <span class="jabatan-text">{{$jabatan}}</span>
                    <span class="description-text">dalam kegiatan Praktik Pengalaman Lapangan (PPL) {{$nama_gelombang}} <br /> Mahasiswa FTK UIN Ar-raniry Banda Aceh di Kota Banda Aceh dan Kabupaten Aceh Besar <br /> Sejak tanggal {{$periode_ppl}}</span>
                </div>

                <!-- Container untuk signature -->
                <div id="signature-container" class="certificate-text">
                    <div class="signature-date">Banda Aceh, {{$tanggal_surat}}</div>
                    <div class="signature-jabatan">Ketua IDC,</div>
                </div>
            </div>
        </div>

        <!-- Halaman 2 -->
        <div class="certificate-page" id="page2">
            <img class="template-image" src="{{ asset('images/certificate/TemplateGuru2.jpg') }}" alt="Certificate Template 2">
            <div class="text-overlay">
                <!-- Title/Date Container di kiri atas -->
                <div id="title2-container">
                    <div class="title2-text">Kegiatan BImbingan PEengalaman Lapaongan</div>
                </div>

                <!-- Signature Container kiri -->
                <div id="signature-left-page2">
                    <div class="signature-date2">Banda Aceh, {{$tanggal_surat}}</div>
                    <div class="signature-jabatan2">Ketua IDC,</div>
                </div>

                <!-- Signature Container kanan -->
                <div id="signature-right-page2">
                    <div class="signature-date2">Banda Aceh, {{$tanggal_surat}}</div>
                    <div class="signature-jabatan2">Ketua IDC,</div>
                </div>
            </div>
        </div>
    </div>
</body>

</html>