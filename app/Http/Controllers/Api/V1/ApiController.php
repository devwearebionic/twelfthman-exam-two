<?php

namespace App\Http\Controllers\Api\V1;


use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Image; 
use Eventviva\ImageResize;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\File;


class ApiController extends Controller
{
    /**
     * Create a new controller instance.
     *
     * @return void
     */
    public function __construct() {
        //
    }

    public function getMain() {
        return [
            'status'    => true,
            'result'    => [
            ],
            'website'   => [
                'title'     => 'Homepage',
                'template'  => 'tmpl-homepage',
                'handler'       => '#main-page',
            ]

        ];
    }

    public function getGallery($status="active",$page=1) {
        $ds = DIRECTORY_SEPARATOR;
        $next = $page+1;
        $prev = 0;
        if($page>1) {
            $prev = $page-1;
        }



        $images = Image::where('status',$status);
        $count = $images->count();
        
        $limit = 8;
        $skip = ( $page*$limit ) - $limit; 


        $images = $images->take($limit)->skip($skip);


        if(@eval("\$pages = ceil($count / $limit);")===FALSE){
            $pages = 1;
        }


        $upload_dir = 'uploads/thumbnail';

        
        $images = $images->orderBy('id','DESC')->get()->map(function($q) use($status,$upload_dir){
            $w = 360;
            $h = 360;
            $__image = $upload_dir."/{$w}x{$h}-" . basename($q->path);

            $q->setAttribute( 'name', substr($q->name, 0, 8) );


            if( !file_exists($__image) ) {
                // generate thumbnail
                $_image =  new ImageResize( $q->path );
                $_image->crop($w, $h, ImageResize::CROPCENTER);
                $_image->save( $__image );
            }

            $q->setAttribute('path', url( $q->path ));
            $q->setAttribute('thumbnail', url( $__image ));

            if($status == 'active') {
                $q->setAttribute('actions',[
                    [
                        'label'     => 'Delete',
                        'name'      => 'delete',
                        'api'       => url('api/v1/gallery/'.$q->id.'/delete'),
                        'icon'      => 'fa-trash-o',
                        'method'    => 'post',
                        'confirm'   => true,
                        'question'  => 'Are you sure you want to delete this image?'
                    ],
                    [
                        'label'     => 'Download',
                        'name'      => 'download',
                        'api'       => url('api/v1/gallery/'.$q->id.'/download'),
                        'icon'      => 'fa-download',
                        'method'    => 'get',
                        'confirm'   => false
                    ]
                ]);
            } else {
                $q->setAttribute('actions',[
                    [
                        'label'     => 'Restore',
                        'name'      => 'restore',
                        'api'       => url('api/v1/gallery/'.$q->id.'/restore'),
                        'icon'      => 'fa-undo',
                        'method'    => 'post',
                        'confirm'   => true,
                        'question'  => 'Are you sure you want to restore this image?'
                    ]
                ]);
            }

            return $q;
        })->toArray();

        $next = url("api/v1/gallery/$status/$next");
        $prev = url("api/v1/gallery/$status/$prev");
        if( $page >= $pages ) { $next = ""; }
        if( $page <= 1 ) { $prev = ""; }

        return [
            'status'    => true,
            'count'     => $count,
            'pages'     => $pages,
            'page'      => $page,
            'next'      => $next,
            'prev'      => $prev,
            'result'    => $images,
            'website'   => [
                'title'     => 'Gallery Page',
                'template'  => 'tmpl-gallery-pane',
                'handler'       => '#gallery-list',
                'parent'        => [
                    'template'      => 'tmpl-gallery',
                    'handler'       => '#main-page'
                ],
            ]
        ];   
    }


    public function postAction(Request $request, $id, $action) {

        $image = Image::where( 'id', $id );
        if( !$_image = $image->first() ) {
            return [
                'status'    => false,
                'message'   => 'Image does not exists.'
            ];
        }

        switch( $action ){
            case "restore":
            $status = "active";
            break;

            case "delete":
            $status = "deleted";
            break;

            default:
            return [
                'status'    => false,
                'message'   => 'Cannot perform the requested action.'
            ];
            break;
        }

        if( $_image->status == $status ) {
            return [
                'status'    => false,
                'message'   => "Image is already {$action}d."
            ];
        }

        $image->update(['status' => $status]);

        return [
            'status'    => true,
            'message'   => "Image successfully {$action}d."
        ];
    }

    public function getDownload($id) {
        $image = Image::find( $id );
        return response()->download( public_path($image->path) );
    }


    public function postUpload(Request $request) {
        $file = $request['image'];


        $upload_dir = public_path('uploads');

        if( !file_exists($upload_dir) ) {
            File::makeDirectory($upload_dir, 0775, true);
        }


        if( !$file->getSize() ) {
            return [
                'status'    => false,
                'message'   => 'Upload Size Exceed'
            ];
        }

        $filename = $file->getClientOriginalName();
        if( file_exists( $upload_dir . '/' . $file->getClientOriginalName() ) ) {
            $filename = time() . '-' . $file->getClientOriginalName();
        }


        $file->move( $upload_dir, $filename );

        $image = new Image([
            'status'  => 'active',
            'name'  => $filename,
            'description'  => $filename,
            'path'  => "uploads/$filename"
        ]);

        $image->save();


        return [
            'status'    => true,
            'message'   => 'Successfully uploaded.',
            'website' => [
                'callback'  => 'sac.clearUpload(".uploadform")'
            ]
        ];
    }

}
