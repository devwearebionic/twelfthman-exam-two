<?php namespace App;


use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;


class Image extends Model {
	protected $table = 'images';
	protected $fillable = ['status','name','description','path'];
}