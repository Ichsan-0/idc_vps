<?php

namespace App\Http\Controllers;


use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class testcontroller extends Controller
{
    public function index()
    {
        $password = Hash::make('199006182019032016');
        dd($password);
    }
}
