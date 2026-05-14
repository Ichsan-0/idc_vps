<!DOCTYPE html>
<html lang="en">

<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <title>{{$name}}</title>
    <style>
        /* RESET UNTUK DOMPDF */
        * {
            margin: 0 !important;
            padding: 0 !important;
            box-sizing: border-box !important;
        }

        body {
            width: 862.01pt !important;
            height: 620.51pt !important;
            margin: 0 auto !important;
            padding: 0 !important;
            font-family: sans-serif !important;
            background: white !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            overflow: hidden !important;
            /* TAMBAHKAN INI */
        }

        /* Container utama - diatur sesuai ukuran kertas */
        .certificate-container {
            width: 100% !important;
            height: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            position: relative !important;
            display: block !important;
            overflow: hidden !important;
            /* TAMBAHKAN INI */
        }

        /* Container untuk setiap sertifikat */
        .certificate-page {
            position: relative !important;
            width: 100% !important;
            height: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            page-break-after: always !important;
            page-break-inside: avoid !important;
            overflow: hidden !important;
            /* TAMBAHKAN INI */
        }

        /* Template gambar - isi seluruh halaman */
        .template-image {
            width: 100% !important;
            height: 100% !important;
            display: block !important;
            object-fit: contain !important;
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
        }

        /* Container untuk semua teks overlay */
        .text-overlay {
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            height: 100% !important;
            z-index: 10 !important;
            overflow: hidden !important;
            /* TAMBAHKAN INI */
        }

        /* Style untuk semua teks sertifikat */
        .certificate-text {
            position: absolute !important;
            left: 50% !important;
            transform: translateX(-50%) !important;
            text-align: center !important;
            margin: 0 !important;
            padding: 0 !important;
            line-height: 1 !important;
            z-index: 20 !important;
        }

        /* ========== PAGE 1 STYLES ========== */
        #nomor-container {
            top: 248pt !important;
            width: auto !important;
            white-space: nowrap !important;
        }

        .nomor-text {
            font-size: 10pt !important;
            margin: 0 !important;
            padding: 0 !important;
            display: block !important;
            line-height: 1 !important;
            color: #000000 !important;
            font-weight: bold !important;
        }

        .subtitle-text {
            font-size: 11pt !important;
            margin: 5pt 0 0 0 !important;
            padding: 0 !important;
            display: block !important;
            line-height: 1.2 !important;
            color: #000000 !important;
        }

        #nama-container {
            top: 285pt !important;
            width: 80% !important;
        }

        .nama-text {
            font-size: 16pt !important;
            font-weight: bold !important;
            margin: 0 !important;
            padding: 0 !important;
            display: block !important;
            line-height: 1 !important;
            color: #000000 !important;
            text-shadow: 1px 1px 2px rgba(255, 255, 255, 0.8) !important;
        }

        .jabatan-text {
            font-size: 12pt !important;
            margin: 8pt 0 0 0 !important;
            font-weight: bold !important;
            padding: 0 !important;
            display: block !important;
            line-height: 1.2 !important;
            color: #000000 !important;
        }

        .description-text {
            font-size: 10pt !important;
            margin: 10pt 0 0 0 !important;
            font-weight: normal !important;
            padding: 0 !important;
            display: block !important;
            line-height: 1.3 !important;
            color: #000000 !important;
        }

        #signature-container {
            top: 422pt !important;
            text-align: left !important;
            transform: none !important;
            left: auto !important;
            right: 210pt !important;
        }

        .signature-date {
            font-size: 12pt !important;
            color: #000000 !important;
        }

        .signature-jabatan {
            font-size: 12pt !important;
            color: #000000 !important;
        }

        /* ========== PAGE 2 STYLES ========== */
        #title2-container {
            position: absolute !important;
            top: 43pt !important;
            left: 95pt !important;
            text-align: left !important;
            transform: none !important;
            z-index: 20 !important;
            width: 70% !important;
        }

        .title2-text {
            font-weight: bold !important;
            font-size: 12pt !important;
            color: #000000 !important;
            line-height: 1.4 !important;
        }

        #signature-right-page2 {
            position: absolute !important;
            top: 496pt !important;
            right: 50pt !important;
            text-align: left !important;
            z-index: 20 !important;
        }

        .signature-date2 {
            font-size: 12pt !important;
            color: #000000 !important;
        }

        .signature-jabatan2 {
            font-size: 12pt !important;
            color: #000000 !important;
        }

        /* ========== PRINT STYLES ========== */
        @media print {
            @page {
                size: 862.01pt 620.51pt !important;
                margin: 0 !important;
                padding: 0 !important;
            }

            body {
                width: 862.01pt !important;
                height: 620.51pt !important;
                margin: 0 !important;
                padding: 0 !important;
                background-color: white !important;
                overflow: hidden !important;
            }

            .certificate-container {
                padding: 0 !important;
                overflow: hidden !important;
            }

            /* HANYA PAGE 2 YANG TIDAK ADA PAGE-BREAK SETELAHNYA */
            #page1 {
                page-break-after: always !important;
            }

            #page2 {
                page-break-after: auto !important;
                /* TIDAK ADA PAGE BREAK SETELAH PAGE 2 */
            }

            .certificate-page {
                page-break-inside: avoid !important;
            }
        }
    </style>
</head>

<body>
    <!-- HILANGKAN WHITESPACE ANTARA TAG -->
    <div class="certificate-container"><!-- Halaman 1 -->
        <div class="certificate-page" id="page1"><img class="template-image" src="{{ public_path('images/certificate/TemplateGuru1.jpg') }}" alt="Certificate Template 1"><!-- Container untuk semua teks -->
            <div class="text-overlay"><!-- Container untuk nomor dan subtitle -->
                <div id="nomor-container" class="certificate-text"><span class="nomor-text">Nomor: {{$certificate_number}}</span><span class="subtitle-text">Diberikan Kepada</span></div><!-- Container untuk nama dan jabatan -->
                <div id="nama-container" class="certificate-text"><span class="nama-text">{{$name}}</span><span class="jabatan-text">{{$jabatan}}</span><span class="description-text">dalam kegiatan Praktik Pengalaman Lapangan (PPL) {{$nama_gelombang}} <br /> Mahasiswa FTK UIN Ar-raniry Banda Aceh di Kota Banda Aceh dan Kabupaten Aceh Besar <br /> Sejak tanggal {{$periode_ppl}}</span></div><!-- Container untuk signature -->
                <div id="signature-container" class="certificate-text">
                    <div class="signature-date">Banda Aceh, {{$tanggal_surat}}</div>
                    <div class="signature-jabatan">Ketua IDC,</div>
                </div>
            </div>
        </div><!-- Halaman 2 -->
        <div class="certificate-page" id="page2"><img class="template-image" src="{{ public_path('images/certificate/TemplateGuru2.jpg') }}" alt="Certificate Template 2">
            <div class="text-overlay"><!-- Title/Date Container di kiri atas -->
                <div id="title2-container">
                    <div class="title2-text">Kegiatan Bimbingan Praktik Pengalaman Lapangan(PPL) <br /> Mahasiswa Fakultas Tarbiyah dan Keguruan UIN Ar-raniry Banda Aceh <br /> {{$nama_gelombang}}</div>
                </div><!-- Signature Container kanan -->
                <div id="signature-right-page2">
                    <div class="signature-date2">Banda Aceh, {{$tanggal_surat}}</div>
                    <div class="signature-jabatan2">Ketua IDC,</div>
                </div>
            </div>
        </div>
    </div>
</body>

</html>