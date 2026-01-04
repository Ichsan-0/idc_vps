<!DOCTYPE html>
<html lang="id">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <title>{{ $name }}</title>

    <style>
        @page {
            size: 862.01pt 620.51pt;
            margin: 0;
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: sans-serif;
            margin: 0;
        }

        /* ================= PAGE WRAPPER ================= */
        .certificate-page {
            position: relative;
            width: 862.01pt;
            height: 620.51pt;
            overflow: hidden;
        }

        /* ================= BACKGROUND IMAGE ================= */
        .template-image {
            position: absolute;
            top: 0;
            left: 0;
            width: 862.01pt;
            height: 620.51pt;
        }

        /* ================= TEXT OVERLAY ================= */
        .text-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
        }

        .certificate-text {
            position: absolute;
            left: 50%;
            transform: translateX(-50%);
            text-align: center;
        }

        /* ================= PAGE 1 ================= */
        #nomor-container {
            top: 248pt;
        }

        .nomor-text {
            font-size: 10pt;
            font-weight: bold;
        }

        .subtitle-text {
            font-size: 11pt;
            margin-top: 5pt;
        }

        #nama-container {
            top: 285pt;
            width: 80%;
        }

        .nama-text {
            font-size: 16pt;
            font-weight: bold;
        }

        .jabatan-text {
            font-size: 12pt;
            margin-top: 8pt;
            font-weight: bold;
        }

        .description-text {
            font-size: 10pt;
            margin-top: 10pt;
            line-height: 1.3;
        }

        #signature-container {
            top: 422pt;
            right: 210pt;
            left: auto;
            transform: none;
            text-align: left;
        }

        .signature-date,
        .signature-jabatan {
            font-size: 12pt;
        }

        /* ================= PAGE 2 ================= */
        #title2-container {
            position: absolute;
            top: 43pt;
            left: 95pt;
            width: 70%;
            text-align: left;
        }

        .title2-text {
            font-size: 12pt;
            font-weight: bold;
            line-height: 1.4;
        }

        #signature-right-page2 {
            position: absolute;
            top: 496pt;
            right: 50pt;
            text-align: left;
        }

        .signature-date2,
        .signature-jabatan2 {
            font-size: 12pt;
        }
    </style>
</head>

<body>

    <!-- ================= PAGE 1 ================= -->
    <div class="certificate-page">
        <img class="template-image"
             src="{{ public_path('images/certificate/TemplateGuru1.jpg') }}">

        <div class="text-overlay">
            <div id="nomor-container" class="certificate-text">
                <div class="nomor-text">Nomor: {{ $certificate_number }}</div>
                <div class="subtitle-text">Diberikan Kepada</div>
            </div>

            <div id="nama-container" class="certificate-text">
                <div class="nama-text">{{ $name }}</div>
                <div class="jabatan-text">{{ $jabatan }}</div>
                <div class="description-text">
                    dalam kegiatan Praktik Pengalaman Lapangan (PPL) {{ $nama_gelombang }}<br>
                    Mahasiswa FTK UIN Ar-raniry Banda Aceh di Kota Banda Aceh dan Kabupaten Aceh Besar<br>
                    Sejak tanggal {{ $periode_ppl }}
                </div>
            </div>

            <div id="signature-container" class="certificate-text">
                <div class="signature-date">Banda Aceh, {{ $tanggal_surat }}</div>
                <div class="signature-jabatan">Ketua IDC,</div>
            </div>
        </div>
    </div>

    <!-- ===== PAGE BREAK MANUAL (PALING AMAN DI DOMPDF) ===== -->
    <div style="page-break-before: always;"></div>

    <!-- ================= PAGE 2 ================= -->
    <div class="certificate-page">
        <img class="template-image"
             src="{{ public_path('images/certificate/TemplateGuru2.jpg') }}">

        <div class="text-overlay">
            <div id="title2-container">
                <div class="title2-text">
                    Kegiatan Bimbingan Praktik Pengalaman Lapangan (PPL)<br>
                    Mahasiswa Fakultas Tarbiyah dan Keguruan UIN Ar-raniry Banda Aceh<br>
                    {{ $nama_gelombang }}
                </div>
            </div>

            <div id="signature-right-page2">
                <div class="signature-date2">Banda Aceh, {{ $tanggal_surat }}</div>
                <div class="signature-jabatan2">Ketua IDC,</div>
            </div>
        </div>
    </div>

</body>
</html>
