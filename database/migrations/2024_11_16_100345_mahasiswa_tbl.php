<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('mahasiswa_tbl', function (Blueprint $table) {
            $table->id();
            $table->string('nim')->unique();
            $table->unsignedBigInteger('id_prodi')->nullable();
            $table->string('jk')->nullable();
            $table->string('no_hp_wa')->nullable();
            $table->string('province_code')->nullable();
            $table->string('regency_code')->nullable();
            $table->string('subdistrict_code')->nullable();
            $table->string('village_code')->nullable();

            $table->string('province_code_now')->nullable();
            $table->string('regency_code_now')->nullable();
            $table->string('subdistrict_code_now')->nullable();
            $table->string('village_code_now')->nullable();
            $table->float('ipk')->nullable();
            $table->string('nilai_micro_teaching')->nullable(); //A, A-, B+, B, B-, C+, C, C-
            $table->string('link_transkrip_nilai')->nullable();
            $table->string('semester')->nullable();
            $table->string('cluster_kegiatan')->nullable(); //PPKPM (PPL + KPM), PPL, KPM
            $table->boolean('valid_data')->nullable();
            $table->boolean('lulus_mk_micro')->nullable();
            $table->boolean('kebenaran_data')->nullable();
            $table->boolean('no_mk')->nullable();
            $table->boolean('bersedia_dimanasaja')->nullable();




            $table->string('link_ket_no_mk')->nullable();
            $table->unsignedBigInteger('id_tempat_kpm')->nullable();
            $table->unsignedBigInteger('id_lowongan_ppl')->nullable();
            $table->double('nilai_supervisor_ppl')->nullable();
            $table->double('nilai_supervisor_kpm')->nullable();
            $table->double('nilai_keuchik')->nullable();
            $table->double('nilai_pamong')->nullable();
            $table->timestamps();
            $table->string('link_instrument_penilaian')->nullable();

            $table->string('kode')->nullable();
            $table->string('status')->nullable(); //submitted, rejected, accepted
            $table->string('keterangan')->nullable();
            $table->unsignedBigInteger('id_gelombang')->nullable();





            $table->foreign('nim')->references('username')->on('users')->onDelete('cascade');
            $table->foreign('id_prodi')->references('id')->on('prodi_tbl')->onDelete('set null');
            $table->foreign('id_tempat_kpm')->references('id')->on('tempat_kpm_tbl')->onDelete('set null');
            $table->foreign('id_lowongan_ppl')->references('id')->on('ppl_tbl')->onDelete('set null');

            $table->foreign('id_gelombang')->references('id')->on('gelombang_tbl')->onDelete('set null')->onUpdate('cascade');
            
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('mahasiswa_tbl');
    }
};
