<?php

namespace App\Http\Controllers;

class PageController extends Controller
{
    /**
     * Create a new controller instance.
     *
     * @return void
     */
    public function __construct() {
        //
    }

    public function getIndex($slug="main") {
        return view('index', ['api'=>url("api/v1/$slug")]);
    }

    public function getError() {

    }
}
