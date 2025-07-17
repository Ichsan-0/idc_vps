<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <style>
        body {
            padding: 0cm 0.5cm 0cm 0.5;
            color: black;
            background-color: white;
        }

        ul,
        ol {
            list-style: none;
            padding: 0;
            margin: 0;
        }

        .header-table {
            width: 100%;
            table-layout: fixed;
            text-align: center;
        }

        .header-table img {
            width: 5cm;
            height: auto;
        }

        .separator {
            border: none;
            border-top: 1px solid black;
        }

        .separator.thick {
            border-top: 2px solid black;
        }

        .content-table {
            font-size: 14px;
            width: 100%;
        }

        .signature {
            text-align: right;
            position: relative;
        }

        .signature img {
            width: 4cm;
            position: absolute;
            right: 0;
            top: 4px;
        }

        .centered-table {
            border-collapse: collapse;
            border: 1px solid gray;
            font-size: 14px;
            margin: 16px auto;
            text-align: center;
        }

        .centered-table th,
        .centered-table td {
            border: 1px solid gray;
            padding: 8px;
            font-weight: 400;
        }
    </style>
</head>

<body>
    <table class="header-table">
        <tr>
            <td style="width: 20%;"><img src="images/logo/Lambang_UIN_Ar-Raniry.png" /></td>
            <td style="width: 70%; font-weight: 600;">
                <ol>
                    <li>KEMENTRIAN AGAMA REPUBLIK INDONESIA</li>
                    <li>UNIVERSITAS ISLAM NEGERI AR-RANIRY BANDA ACEH</li>
                    <li>FAKULTAS TARBIYAH DAN KEGURUAN</li>
                    <li>INSTRUCTIONAL DEVELOPMENT CENTER</li>
                    <li style="font-size: 12px; font-weight: 400;">
                        Jl. Syeikh Abdul Rauf Kopelma Darussalam Banda Aceh Telp.(065) 7553030: www.ftk.ar-raniry.ac.id
                    </li>
                </ol>
            </td>
        </tr>
    </table>
    <hr class="separator" />
    <hr class="separator thick" />


    <!-- <td style="text-align: right;">Banda Aceh, 24 Maret 2025</td> -->
    <p style="text-align: right;">Banda Aceh, 24 Maret 2025</p>



    <table class="content-table">
        <tr>
            <td>Nomor</td>
            <td>:</td>
            <td> {{$kode.$base_number." ".$kode_universitas.$kode_idc.$kode_jenis_surat.$bulan_tahun}}</td>
        </tr>
        <tr>
            <td>Lampiran</td>
            <td>:</td>
            <td>-</td>
        </tr>
        <tr>
            <td>Perihal</td>
            <td>:</td>
            <td>Nilai PPKPM Semester Genap 2024/2025</td>
        </tr>
    </table>

    <p>Kepada Yth</p>
    <p style="font-weight: 600;">Ketua Prodi {{$nama_prodi}}</p>
    <p style="font-weight: 600; margin-top: 0px;">di-</p>
    <p style="font-weight: 600; margin-left: 16px;">Tempat</p>
    <p style="font-style: italic;">Assalamu'alaikum Wr.Wb.</p>
    <p>Dengan Hormat,</p>
    <p style="text-align: justify;">
        Sehubungan dengan berakhirnya Kuliah Praktik Profesi Keguruan UIN Ar-Raniry Banda Aceh Semester Genap 2024/2025,
        maka ketua IDC Fakultas Tarbiyah dan Keguruan UIN Ar-Raniry Banda Aceh dengan ini mengirimkan nilai PPKPM untuk
        keperluan Sidang Munaqasah Skripsi.
    </p>

    <table class="content-table" style="margin-left: 16px;">
        <tr>
            <td>Nama</td>
            <td>:</td>
            <td>{{$nama_mahasiswa}}</td>
        </tr>
        <tr>
            <td>NIM</td>
            <td>:</td>
            <td>{{$nim}}</td>
        </tr>
        <tr>
            <td>Program Studi</td>
            <td>:</td>
            <td>{{$nama_prodi}}</td>
        </tr>
        <tr>
            <td>Rincian Nilai</td>
            <td>:</td>
        </tr>
    </table>

    <table class="centered-table">
        <thead>
            <tr>
                <th>Nilai KPM</th>
                <th>Nilai PPL</th>
                <th>Nilai PPKPM</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>{{$SM_KPM}}</td>
                <td>{{$SM_PPL}}</td>
                <td>{{$nilai_ppkpm}}</td>
            </tr>
        </tbody>
    </table>

    <p>Demikian Surat ini dikeluarkan untuk dapat dipergunakan seperlunya.</p>
    <p style="font-style: italic;">Wassalamu'alaikum Wr.Wb.</p>

    <div class="signature">
        <p>Banda Aceh, 24 Maret 2025<br>Ketua IDC</p>
        <img src="images/ttd/ttd-aiyub.png" />
        <p>Dr. Aiyub, S.Ag., M.Ag.</p>
    </div>
    <div style="font-size: x-small;">
        <p>Tembusan</p>
        <ol style="list-style: decimal;">
            <li>Wakil Dekan Bidang Akademik dan Kelembagaan FTK UIN Ar-Raniry</li>
            <li>Arsip</li>
        </ol>
    </div>
</body>

</html>