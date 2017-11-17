<?php

use Illuminate\Database\Seeder;
use App\Image;

class DatabaseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run() {

    	$data = [
    		[
    			'status'		=> 'active',
    			'name'			=> 'Image 1',
    			'description'	=> 'Image 1',
    			'path'			=> 'uploads/image-1.jpg',
    		],
    		[
    			'status'		=> 'active',
    			'name'			=> 'Image 2',
    			'description'	=> 'Image 2',
    			'path'			=> 'uploads/image-2.jpg',
    		],
    		[
    			'status'		=> 'active',
    			'name'			=> 'Image 3',
    			'description'	=> 'Image 3',
    			'path'			=> 'uploads/image-3.jpg',
    		],
    		[
    			'status'		=> 'active',
    			'name'			=> 'Image 4',
    			'description'	=> 'Image 4',
    			'path'			=> 'uploads/image-4.jpg',
    		],
    		[
    			'status'		=> 'active',
    			'name'			=> 'Image 5',
    			'description'	=> 'Image 5',
    			'path'			=> 'uploads/image-5.jpg',
    		],
    	];


    	Image::insert($data);
        // $this->call('UsersTableSeeder');
    }
}
