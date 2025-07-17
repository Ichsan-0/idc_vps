<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Admin\TempatKPM;
use App\Http\Controllers\Controller;
use App\Http\Middleware\User;
use Illuminate\Http\Request;
use App\Models\Comment;
use App\Http\Resources\CommentResource;

use function Laravel\Prompts\select;

class CommentController extends Controller
{
    // Public Comment: Create
    public function createPublicComment(Request $request)
    {
        try {

            $comment = Comment::create([
                'id_kelas' => $request->id_kelas,
                'id_tugas' => $request->id_tugas,
                'created_by' => $request->created_by,
                'message' => $request->message,
                'tipe' => 'public',
            ]);
            return new CommentResource(true, 'Comment Public Berhasil dibuat!', $comment);
        } catch (\Exception $e) {
            return new CommentResource(false, $e->getMessage(), $e->getCode());
        }
    }

    // Public Comment: Query
    public function getPublicComments(Request $request)
    {
        try {

            $comments = Comment::where('tipe', 'public')
                ->when($request->id_kelas, fn($q) => $q->where('id_kelas', $request->id_kelas))
                ->when($request->id_tugas, fn($q) => $q->where('id_tugas', $request->id_tugas))
                ->orderBy('created_at', 'asc')
                ->join('users as us', 'comment.created_by', '=', 'us.username')
                ->select('comment.message', 'comment.created_at', 'us.name as created_by_name')
                ->get();
            return new CommentResource(true, 'List Comment!', $comments);
        } catch (\Exception $e) {
            return new CommentResource(false, $e->getMessage(), $e->getCode());
        }
    }

    // Private Comment: Create
    public function createPrivateComment(Request $request)
    {
        try {

            $comment = Comment::create([
                'id_kelas' => $request->id_kelas,
                'id_tugas' => $request->id_tugas,
                'created_by' => $request->created_by,
                'receiver' => $request->receiver,
                'message' => $request->message,
                'tipe' => 'private',
            ]);
            return new CommentResource(true, 'Comment Private Berhasil dibuat!', $comment);
        } catch (\Exception $e) {
            return new CommentResource(false, $e->getMessage(), $e->getCode());
        }
    }

    // Private Comment: Query
    public function getPrivateComments(Request $request)
    {
        try {


            // $supervisor = TempatKPM::join('users as us', 'tempat_kpm_tbl.username_supervisor', 'us.username')
            //         ->where('id', $request->id_kelas)        
            //         ->select('us.name')
            //         ->first();
            $comments = Comment::where('tipe', 'private')
                ->when($request->id_kelas, fn($q) => $q->where('id_kelas', $request->id_kelas))
                ->when($request->id_tugas, fn($q) => $q->where('id_tugas', $request->id_tugas))
                ->leftJoin('users as us', 'comment.receiver', '=', 'us.username')
                ->leftJoin('users as usr', 'comment.created_by', '=', 'usr.username')
                ->where(function ($subQuery) use ($request) {
                    $subQuery->where('created_by', $request->created_by)
                        ->orWhere('receiver', $request->created_by);
                })
                ->select(
                    'us.name as receiver_by_name',
                    'usr.name as created_by_name',
                    'comment.*'
                )
                ->orderBy('created_at', 'asc')
                ->get();
            return new CommentResource(true, 'List Comment!', $comments);
        } catch (\Exception $e) {
            return new CommentResource(false, $e->getMessage(), $e->getCode());
        }
    }
}
