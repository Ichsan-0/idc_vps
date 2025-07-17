<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

use App\Models\Task;
use App\Models\TempatKPM;
use App\Http\Resources\TaskResource;
use Carbon\Carbon;
use Carbon\CarbonTimeZone;
use DateTime;
use DateTimeZone;
use Exception;

class TaskController extends Controller
{

    public function getTask($id)
    {
        $data = [];
        try {
            $data['data'] = Task::find($id);

            $date = Carbon::createFromFormat('Y-m-d H:i:s', $data['data']['tenggat'], 'UTC');

            $data['data']['tenggat'] = $date->toDateString();
            $data['success']  = true;
            $data['message'] = 'Berhasil';
            return response()->json($data);
        } catch (Exception $e) {
            $data['success']  = false;
            $data['message'] = $e->getMessage();
            return response()->json($data);
        }
    }

    public function createTasksByClass(Request $request)
    {
        try {
            $dateTime = Carbon::createFromFormat('D, d M Y H:i:s e', $request->tenggat)
                ->setTimezone(new CarbonTimeZone('Asia/Jakarta'));
            $task = Task::create([
                'name' => $request->name,
                'tenggat' => $dateTime,
                'tipe' => $request->tipe,
            ]);
            return new TaskResource(true, 'Tugas Berhasil dibuat!', $task);
        } catch (\Exception $e) {
            return new TaskResource(false, $e->getMessage(), $e->getCode());
        }
    }

    public function editTasksByClass(Request $request, $id)
    {


        try {
            $dateTime = Carbon::createFromFormat('D, d M Y H:i:s e', $request->tenggat)
                ->setTimezone(new CarbonTimeZone('Asia/Jakarta'));

            $task = [
                'name' => $request->name,
                'tenggat' => $dateTime,
                'tipe' => $request->tipe,
            ];



            $data = Task::find($id);

            if ($data) {
                // Update data user
                $data->update($task);

                // Response sukses
                return new TaskResource(true, 'Tugas Berhasil diedit', $task);
            }

            return new TaskResource(true, 'Tugas Tidak Ditemukan!', null);
        } catch (\Exception $e) {
            return new TaskResource(false, $e->getMessage(), $e->getCode());
        }
    }

    public function queryTasks(Request $request)
    {
        $query = Task::query();

        if ($request->has('search_key') && !empty($request->search_key)) {
            $query->where(function ($subQuery) use ($request) {
                $subQuery->where('task', 'like', '%' . $request->search_key . '%');
            });
        }

        $query->selectRaw(
            'ROW_NUMBER() OVER (ORDER BY task.id ASC) AS row_index,
            task.name,
            task.id,
            task.tenggat,
            task.tipe'
        );

        $data = $query->paginate(10);

        return response()->json($data);
    }

    public function deleteTasksByClass($id)
    {
        try {
            $task = Task::find($id);
            if ($task) {
                $result = $task->delete();
                if ($result) {
                    return new TaskResource(true, 'Berhasil Menghapus Tugas', null);
                }
            }
            return new TaskResource(false, 'Gagal Menghapus Tugas', null);
        } catch (\Exception $e) {
            return new TaskResource(false, $e->getMessage(), $e->getCode());
        }
    }

    public function getTasksByClass($id)
    {

        try {
            $data_kelas = TempatKPM::where('id', $id)
                ->selectRaw(
                    'tempat_kpm_tbl.id,
                tempat_kpm_tbl.name'
                )
                ->first();

            $data_kelas['tasks'] = Task::orderBy('created_at', 'desc')->get();

            if (!$data_kelas) {
                return response()->json(['message' => 'Data tidak ditemukan'], 404);
                return new TaskResource(true, 'Data tidak ditemukan', 404);
            }

            return new TaskResource(true, 'List Data', $data_kelas);
        } catch (\Exception $e) {
            return new TaskResource(false, $e->getMessage(), $e->getCode());
        }
    }

    public function getTaskDetails($id_kelas, $id_tugas)
    {
        try {
            $data_tugas = TempatKPM::where('id', $id_kelas)
                ->selectRaw(
                    'tempat_kpm_tbl.id,
                tempat_kpm_tbl.name'
                )
                ->first();


            if ($data_tugas) {
                $data_tugas['tasks'] = Task::where('id', $id_tugas)->first();
            } else {
                return new TaskResource(true, 'Data tidak ditemukan', 404);
            }

            return new TaskResource(true, 'List Data', $data_tugas);
        } catch (\Exception $e) {
            return new TaskResource(false, $e->getMessage(), $e->getCode());
        }
    }

    public function detail(Request $request)
    {
        return Inertia::render('Mahasiswa/Classroom/DetailTask', ['base_url' => url('/')]);
    }
}
