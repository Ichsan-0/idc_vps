<?php

namespace App\Http\Controllers;

use App\Models\Bimbingan;
use App\Models\LamaranKPM;
use App\Models\LamaranPPL;
use App\Models\Mahasiswa;
use App\Models\Sekolah;
use App\Models\TempatKPM;
use App\Models\User;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class BimbinganController extends Controller
{
    /**
     * Helper to get supervisor user for a given class.
     */
    private function getSupervisorForClass($tipe, $id_kelas)
    {
        if ($tipe === 'kpm') {
            $tempat = TempatKPM::find($id_kelas);
            if (!$tempat) return null;
            return User::where('username', $tempat->username_supervisor)
                ->orWhere('id', $tempat->id_supervisor ?? null)
                ->first();
        } else {
            $sekolah = Sekolah::find($id_kelas);
            if (!$sekolah) return null;
            return User::where('username', $sekolah->username_supervisor)
                ->orWhere('id', $sekolah->id_supervisor ?? null)
                ->first();
        }
    }

    /**
     * Mahasiswa: Get list of bimbingan and stats.
     */
    public function getMahasiswaBimbingan(Request $request)
    {
        try {
            $request->validate([
                'tipe' => 'required|in:kpm,ppl',
                'id_kelas' => 'required',
            ]);

            $user = Auth::user();
            $tipe = $request->tipe;
            $id_kelas = $request->id_kelas;

            $bimbingans = Bimbingan::where('username_mahasiswa', $user->username)
                ->where('tipe', $tipe)
                ->where('id_kelas', $id_kelas)
                ->orderBy('bimbingan_ke', 'asc')
                ->get()
                ->map(function ($item) {
                    $item->file_url = $item->file_lampiran ? Storage::url($item->file_lampiran) : null;
                    return $item;
                });

            $totalApproved = $bimbingans->where('status', 'approved')->count();
            $totalPending = $bimbingans->where('status', 'pending')->count();
            $totalRejected = $bimbingans->where('status', 'rejected')->count();
            $minRequired = 4;
            $maxBimbinganKe = $bimbingans->max('bimbingan_ke') ?? 0;

            $supervisor = $this->getSupervisorForClass($tipe, $id_kelas);

            $kelasName = '';
            if ($tipe === 'kpm') {
                $tempat = TempatKPM::find($id_kelas);
                $kelasName = $tempat ? $tempat->name : 'Kelas KPM';
            } else {
                $sekolah = Sekolah::find($id_kelas);
                $kelasName = $sekolah ? $sekolah->name : 'Sekolah PPL';
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'list' => $bimbingans,
                    'stats' => [
                        'total_submitted' => $bimbingans->count(),
                        'total_approved' => $totalApproved,
                        'total_pending' => $totalPending,
                        'total_rejected' => $totalRejected,
                        'min_required' => $minRequired,
                        'is_fulfilled' => $totalApproved >= $minRequired,
                        'percentage' => min(100, round(($totalApproved / $minRequired) * 100)),
                        'next_bimbingan_ke' => $maxBimbinganKe + 1,
                    ],
                    'supervisor' => $supervisor ? [
                        'name' => $supervisor->name,
                        'username' => $supervisor->username,
                        'email' => $supervisor->email,
                    ] : null,
                    'kelas' => [
                        'id' => $id_kelas,
                        'name' => $kelasName,
                        'tipe' => $tipe,
                    ],
                ],
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Mahasiswa: Store a new bimbingan entry.
     */
    public function storeMahasiswaBimbingan(Request $request)
    {
        try {
            $request->validate([
                'tipe' => 'required|in:kpm,ppl',
                'id_kelas' => 'required',
                'bimbingan_ke' => 'required|integer|min:1',
                'tanggal' => 'required|date',
                'judul' => 'required|string|max:255',
                'deskripsi' => 'required|string',
            ]);

            $user = Auth::user();
            $supervisor = $this->getSupervisorForClass($request->tipe, $request->id_kelas);

            $bimbingan = Bimbingan::create([
                'tipe' => $request->tipe,
                'id_kelas' => $request->id_kelas,
                'username_mahasiswa' => $user->username,
                'username_supervisor' => $supervisor ? $supervisor->username : null,
                'bimbingan_ke' => $request->bimbingan_ke,
                'tanggal' => $request->tanggal,
                'judul' => $request->judul,
                'deskripsi' => $request->deskripsi,
                'status' => 'pending',
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Detail bimbingan berhasil disimpan. Menunggu validasi dari dosen supervisor.',
                'data' => $bimbingan,
            ], 201);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Mahasiswa: Update an existing bimbingan entry (if pending or rejected).
     */
    public function updateMahasiswaBimbingan(Request $request, $id)
    {
        try {
            $request->validate([
                'bimbingan_ke' => 'required|integer|min:1',
                'tanggal' => 'required|date',
                'judul' => 'required|string|max:255',
                'deskripsi' => 'required|string',
            ]);

            $user = Auth::user();
            $bimbingan = Bimbingan::where('id', $id)
                ->where('username_mahasiswa', $user->username)
                ->firstOrFail();

            if ($bimbingan->status === 'approved') {
                return response()->json([
                    'success' => false,
                    'message' => 'Bimbingan yang sudah disetujui tidak dapat diubah.',
                ], 403);
            }

            $bimbingan->bimbingan_ke = $request->bimbingan_ke;
            $bimbingan->tanggal = $request->tanggal;
            $bimbingan->judul = $request->judul;
            $bimbingan->deskripsi = $request->deskripsi;
            $bimbingan->status = 'pending'; // Reset to pending for supervisor review
            $bimbingan->save();

            return response()->json([
                'success' => true,
                'message' => 'Detail bimbingan berhasil diperbarui. Menunggu validasi dari dosen supervisor.',
                'data' => $bimbingan,
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Mahasiswa: Delete a pending bimbingan entry.
     */
    public function deleteMahasiswaBimbingan($id)
    {
        try {
            $user = Auth::user();
            $bimbingan = Bimbingan::where('id', $id)
                ->where('username_mahasiswa', $user->username)
                ->firstOrFail();

            if ($bimbingan->status === 'approved') {
                return response()->json([
                    'success' => false,
                    'message' => 'Bimbingan yang sudah disetujui tidak dapat dihapus.',
                ], 403);
            }

            $bimbingan->delete();

            return response()->json([
                'success' => true,
                'message' => 'Bimbingan berhasil dihapus',
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Supervisor: Get students list and their bimbingan records in a class.
     */
    public function getSupervisorBimbingan(Request $request, $tipe, $id_kelas)
    {
        try {
            $user = Auth::user();

            // Verify supervisor permissions
            if ($tipe === 'kpm') {
                $kelasObj = TempatKPM::findOrFail($id_kelas);
                $isAllowed = ($kelasObj->username_supervisor === $user->username || $kelasObj->id_supervisor == $user->id);
            } else {
                $kelasObj = Sekolah::findOrFail($id_kelas);
                $isAllowed = ($kelasObj->username_supervisor === $user->username || $kelasObj->id_supervisor == $user->id);
            }

            // Fetch students in this class
            if ($tipe === 'kpm') {
                $students = LamaranKPM::join('users as u', 'lamaran_kpm_tbl.username_mahasiswa', '=', 'u.username')
                    ->leftJoin('mahasiswa_tbl as m', 'lamaran_kpm_tbl.username_mahasiswa', '=', 'm.nim')
                    ->leftJoin('prodi_tbl as p', 'm.id_prodi', '=', 'p.id')
                    ->where('lamaran_kpm_tbl.id_tempat_kpm', $id_kelas)
                    ->where('lamaran_kpm_tbl.status', 'accepted')
                    ->select(
                        'u.username as nim',
                        'u.name as nama_mahasiswa',
                        'u.email',
                        'm.no_hp_wa as no_hp',
                        'p.name as nama_prodi'
                    )
                    ->orderBy('u.name', 'asc')
                    ->get();
            } else {
                $students = LamaranPPL::join('lowongan_ppl_tbl as l_ppl', 'lamaran_ppl_tbl.id_lowongan_ppl', '=', 'l_ppl.id')
                    ->join('users as u', 'lamaran_ppl_tbl.username_mahasiswa', '=', 'u.username')
                    ->leftJoin('mahasiswa_tbl as m', 'lamaran_ppl_tbl.username_mahasiswa', '=', 'm.nim')
                    ->leftJoin('prodi_tbl as p', 'm.id_prodi', '=', 'p.id')
                    ->where('l_ppl.id_sekolah', $id_kelas)
                    ->where('lamaran_ppl_tbl.status', 'accepted')
                    ->select(
                        'u.username as nim',
                        'u.name as nama_mahasiswa',
                        'u.email',
                        'm.no_hp_wa as no_hp',
                        'p.name as nama_prodi'
                    )
                    ->orderBy('u.name', 'asc')
                    ->get();
            }

            // Fetch all bimbingans for this class
            $allBimbingans = Bimbingan::where('tipe', $tipe)
                ->where('id_kelas', $id_kelas)
                ->orderBy('bimbingan_ke', 'asc')
                ->get()
                ->map(function ($b) {
                    $b->file_url = $b->file_lampiran ? Storage::url($b->file_lampiran) : null;
                    return $b;
                })
                ->groupBy('username_mahasiswa');

            $minRequired = 4;
            $studentsData = $students->map(function ($mhs) use ($allBimbingans, $minRequired) {
                $bimbingans = $allBimbingans->get($mhs->nim, collect());
                $approvedCount = $bimbingans->where('status', 'approved')->count();
                $pendingCount = $bimbingans->where('status', 'pending')->count();
                $rejectedCount = $bimbingans->where('status', 'rejected')->count();

                return [
                    'nim' => $mhs->nim,
                    'nama' => $mhs->nama_mahasiswa,
                    'email' => $mhs->email,
                    'no_hp' => $mhs->no_hp,
                    'prodi' => $mhs->nama_prodi,
                    'total_submitted' => $bimbingans->count(),
                    'approved_count' => $approvedCount,
                    'pending_count' => $pendingCount,
                    'rejected_count' => $rejectedCount,
                    'is_fulfilled' => $approvedCount >= $minRequired,
                    'bimbingans' => $bimbingans->values(),
                ];
            });

            $totalStudents = $studentsData->count();
            $fulfilledCount = $studentsData->where('is_fulfilled', true)->count();
            $totalPendingValidations = $allBimbingans->flatten()->where('status', 'pending')->count();

            return response()->json([
                'success' => true,
                'data' => [
                    'kelas' => [
                        'id' => $id_kelas,
                        'name' => $kelasObj->name,
                        'tipe' => $tipe,
                    ],
                    'stats' => [
                        'total_students' => $totalStudents,
                        'fulfilled_students' => $fulfilledCount,
                        'pending_validations' => $totalPendingValidations,
                        'min_required' => $minRequired,
                    ],
                    'students' => $studentsData,
                ],
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Supervisor: Validate (approve or reject) a student's bimbingan entry.
     */
    public function validateSupervisorBimbingan(Request $request, $id)
    {
        try {
            $request->validate([
                'status' => 'required|in:approved,rejected,pending',
                'catatan_supervisor' => 'nullable|string',
            ]);

            $user = Auth::user();
            $bimbingan = Bimbingan::findOrFail($id);

            // Update bimbingan
            $bimbingan->status = $request->status;
            $bimbingan->catatan_supervisor = $request->catatan_supervisor;
            $bimbingan->username_supervisor = $user->username;
            $bimbingan->validated_at = ($request->status === 'approved') ? now() : null;
            $bimbingan->save();

            $bimbingan->file_url = $bimbingan->file_lampiran ? Storage::url($bimbingan->file_lampiran) : null;

            return response()->json([
                'success' => true,
                'message' => $request->status === 'approved'
                    ? 'Bimbingan berhasil disetujui / divalidasi'
                    : 'Bimbingan ditandai perlu revisi',
                'data' => $bimbingan,
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }
}
