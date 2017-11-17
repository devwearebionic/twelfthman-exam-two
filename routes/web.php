<?php

/*
|--------------------------------------------------------------------------
| Application Routes
|--------------------------------------------------------------------------
|
| Here is where you can register all of the routes for an application.
| It is a breeze. Simply tell Lumen the URIs it should respond to
| and give it the Closure to call when that URI is requested.
|
*/



$app->group(['prefix'	=>	'api/v1','namespace' => 'Api\V1'], function() use($app){
	$app->get('/', function() use($app){
		return [
			'status'	=> true,
			'message'	=> 'Welcome to the main API.'
		];
	});


	$app->get('main','ApiController@getMain');
	$app->get('gallery/{id}/download','ApiController@getDownload');
	$app->get('gallery/{status}/{page}','ApiController@getGallery');
	$app->get('gallery/{status}','ApiController@getGallery');
	$app->post('gallery/{id}/{action}','ApiController@postAction');
	$app->post('gallery/upload','ApiController@postUpload');

	$app->get('{slug:.+}', function(){
        return [
            'status'    => false,
            'message'   => 'API doesn\'t exists.'
        ];
	});
});



$app->get('/', 'PageController@getIndex');
$app->get('{slug:.+}', 'PageController@getIndex');