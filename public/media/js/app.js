"use strict";
var __action,__template,__target_url,__script,self,action;

window.sac = {

	loadconfig: function(url_path){
		$.get(url_path,function(data){
			__script = $(data).filter('#config');
			eval( __script.text() );
			sac.init();
		});
	},

	handlebars_custom : function() {
		Handlebars.registerHelper('url',function(){
			return config.url;
		});
		
	},

	xhr: function() {
        var xhr = new window.XMLHttpRequest();
        xhr.upload.addEventListener("progress", function(evt) {
            if (evt.lengthComputable) {
                var percentComplete = evt.loaded / evt.total;
                NProgress.set(percentComplete);
            }
       }, false);

       xhr.addEventListener("progress", function(evt) {
           if (evt.lengthComputable) {
               var percentComplete = evt.loaded / evt.total;
                NProgress.set(percentComplete);
           }
       }, false);

       return xhr;
	},

	before_dom_loaded: function(response) {

	},

	after_dom_loaded: function(response) {
		NProgress.done();

		$('a[data-push-state]').each(function(i,o){
			if( $(o).attr('href') == document.location.href ) {
				$(o).addClass('active');
			} else {
				$(o).removeClass('active');
			}
		});

		if( response.next != '' ) {
			$('.loadmore').html('<a href="'+ response.next +'" class="btn btn-success loader">Load more</a>');
		} else {
			$('.loadmore').empty();	
		}

		if( typeof response.website.callback !== "undefined" ) {
			eval( response.website.callback );
		}

		/* cacher */
		$('.image-pane img').each(function(i,o){
			var self = o;

			if( !sac.cache[ $(o).attr('data-src') ] ) {
				console.log('Generate blob');
				var xhr = new XMLHttpRequest();
				xhr.open("GET", $(o).attr('data-src'));
				xhr.responseType = "blob";
				xhr.onload = function(e) {
					var urlCreator = window.URL || window.webkitURL;
					var imageUrl = urlCreator.createObjectURL(this.response);
					sac.cache[ $(self).attr('data-src') ] = imageUrl;
					$(self).attr('src',imageUrl)
				};
				xhr.send();
			} else {
				console.log('Used the generated blob.')
				$(self).attr('src',sac.cache[ $(self).attr('data-src') ]);
			}


		});

	},

	cache: {},

	init: function() {
		NProgress.inc();
		$.ajax({
		    xhr 			: sac.xhr,
		    type  			: 'GET',
		    url 			: config.api,
			success			: function(response){
				sac.gateway(response);
			},
			error 			: function(response, error_type, type){
				sac.gateway(response.responseJSON);
			}
		});

	},

	gateway: function(response) {
		if( typeof response.website !== 'undefined' ) {

			__action = ( typeof response.website.action !== "undefined" ? response.website.action : 'default' );


			switch(__action) {
				case "redirect": 
					history.pushState({}, '', response.website.redirect);
					sac.loadconfig(response.website.redirect);
				break;

				case "default":
				default:

					// check if the element to where the template to append exists
					if( $(response.website.handler).length ) {
						sac.render_main(response);
					} else if( $(response.website.parent.handler).length ) {
						sac.render_parent(response);
					} else if( $(response.website.grandparent.handler).length ) {
						sac.render_grandparent(response);
					} else {
						console.log('cant render website parameter.');
					}

				break;
			}


		} else {
			console.log("Please contact the Admin, API doesn't have a parameter for website.");
		}
	},

	recursive_render: function(response, html, handler) {
		$(handler).html( html );
	},

	render : function( response ){
		sac.before_dom_loaded(response);
		__template = response.website.template;
		var template = Handlebars.compile( $('#'+__template).html() );
		var html = template( response );
		$('title').text( response.website.title );
		$(response.website.handler).html( html );
		sac.after_dom_loaded(response);
	},

	append : function( response ){
		sac.before_dom_loaded(response);
		__template = response.website.template;
		var template = Handlebars.compile( $('#'+__template).html() );
		var html = template( response );
		$('title').text( response.website.title );
		$(response.website.handler).append( html );
		sac.after_dom_loaded(response);
	},


	render_main: function(response){
		__template = response.website.template;
		if($('#'+__template).length) {
			sac.render(response);
		} else {
			$.get( config.url + '/handlebars/' + __template + '.html', function(result){
				$('<script>').attr('type','text/x-handlebars-template').attr('id',__template).html(result).appendTo('body');
				sac.render(response);
			});	
		}
	},

	render_parent: function(response) {
		var __parent_template = response.website.parent.template;

		// render parent, if parent doesn't include on page yet.
		if($('#'+__parent_template).length){
			var template = Handlebars.compile( $('#'+response.website.parent.template).html() );
			var html = template( response );
			sac.recursive_render(response, html, response.website.parent.handler);
			sac.render_main(response);
		} else{
			$.get( config.url + '/handlebars/' + __parent_template + '.html', function(result){
				$('<script>').attr('type', 'text/x-handlebars-template').attr('id', __parent_template).html(result).appendTo('body'); // add handlebar template at the bottom of the page
				var template = Handlebars.compile( $('#'+response.website.parent.template).html() );
				var html = template( response );
				sac.recursive_render(response, html, response.website.parent.handler);
				sac.render_main(response); // render requested template
			});
		}
	},

	render_grandparent: function(response) {
		__grandparent_template = response.website.grandparent.template;

		if($('#'+__grandparent_template).length){

			var template = Handlebars.compile( $('#'+response.website.grandparent.template).html() );
			var html = template( response );
			sac.recursive_render(response, html, response.website.grandparent.handler);
			sac.render_parent(response);

		} else {
			
			$.get( config.url + '/handlebars/' + __grandparent_template + '.html', function(result){
				$('<script>').attr('type','text/x-handlebars-template').attr('id',__grandparent_template).html(result).appendTo('body'); // add handlebar template at the bottom of the page
				var template = Handlebars.compile( $('#'+response.website.grandparent.template).html() );
				var html = template( response );
				sac.recursive_render(response, html, response.website.grandparent.handler);
				sac.render_parent(response);
			});
		}
	},


	ajax_post: function(url,params) {

		if( typeof params === "undefined" ) { params=""; }

		$.ajax({
		    xhr 			: sac.xhr,
		    type  			: 'POST',
		    url 			: url,
		    data 			: params,
			success			: function(response){
				if( response.status ) {
					sweetAlert("Success", response.message, "success");
				} else {
					sweetAlert("Error", response.message, "error");
				}
				sac.loadconfig( document.location.href );


				if( typeof response.website.callback !== "undefined" ) {
					eval( response.website.callback );
				}
			},
			error 			: function(response, error_type, type){
				sweetAlert("Ops", "Something went wrong.", "error");
			}
		});
	},

	loadmore: function(url){
		$.ajax({
		    xhr 			: sac.xhr,
		    type  			: 'GET',
		    url 			: url,
			success			: function(response){
				sac.append(response);
			},
			error 			: function(response, error_type, type){
				sweetAlert("Ops", "Something went wrong.", "error");
			}
		});
	},

	clearUpload: function(target) {
		$(target).find('input[type=text],input[type=file]').val('');
	}
};


jQuery(document).ready(function($){

	$(document).on('click','[data-push-state]',function(e) {	
		e.preventDefault();		
		__target_url = $(this).attr('href');
		history.pushState({}, '', __target_url);
		sac.loadconfig( __target_url );
	});


	$(document).on('click','.loader',function(e) {	
		e.preventDefault();
		sac.loadmore( $(this).attr('href') );
	});

	$(document).on('click','[data-method=post]',function(e) {	
		e.preventDefault();		
		var box_confirm 	= $(this).data('confirm');
		var box_title 		= $(this).data('title');
		var box_api 		= $(this).attr('href');
		var box_question 	= $(this).data('question');

		if( box_confirm ) {
			swal({
				title: box_title,
				text: box_question,
				html: true,
				//type: "info",
				closeOnConfirm: false,
				showLoaderOnConfirm: true,
				showCancelButton: true,
				confirmButtonText: "Yes",
				cancelButtonText: "No",
			},
			function(){
				sac.ajax_post(box_api)
			});
		} else {
			sac.ajax_post(box_api)
		}




	});

	$(document).on('click', function(e) {	

		if( $(e.target).hasClass('gallery-actions') || $(e.target).parents('.gallery-actions').length ) {
			
		} else {
		
			$('.image-pane.selected').removeClass('selected');
			$('.gallery-actions').removeClass('active');

			var show_action = true;

			if( typeof $(e.target).attr('data-action') !== "undefined" ) {
				var target_element = $(e.target);
			} else if($(e.target).parents('a.image-pane').length) {
				var target_element = $(e.target).parents('a.image-pane');
			} else {
				show_action = false;
			}

			if(show_action) {
				target_element.addClass('selected');
				$( target_element.attr('data-target') ).addClass('active');
			}
		}

	});


	$(document).on('submit','.livepost',function(e){
		e.preventDefault();
		self = $(this);
		action = self.attr('action');

		self.find('[type=submit]').button('loading');
		
		NProgress.inc();
		$.ajax({
		    xhr 			: sac.xhr,
		    url 			: action,
		    type  			: 'POST',
		    data 			: new FormData( this ),
            processData		: false,
            contentType		: false,
			success			: function(response){
				if( response.status ) {
					sweetAlert("Success", response.message, "success");
				} else {
					sweetAlert("Error", response.message, "error");
				}

				if( typeof response.website.callback !== "undefined" ) {
					eval( response.website.callback );
				}

				sac.loadconfig( document.location.href );



			},
			error 			: function(response, error_type, type){
				sweetAlert("Ops", "Something went wrong.", "error");
			}
		});


	});

	$(document).on('change','.submitchange',function(){
		var selected_file_name = $(this).val();
		if ( selected_file_name.length > 0 ) {
			$(this).parents('form').trigger('submit');
		}
	});

	$(window).on("popstate", function(e) { var url_path = document.location.href; sac.loadconfig(url_path); });

	sac.handlebars_custom();
	sac.init();

});