
/* //////////////////////////////////////////////////////////////////////  VAR  /// */

var breakpoint_mobile = 720;
var timeout_resize;
var delay_resize = 200;
var timeout_move;
var delay_move = 1000;
var height_viewport;
var height_header;
var height_feature;
var height_text;
var deck_active = false;
var feature_ready = false;
var feature_target;
var feature_timeout;
var feature_delay = 400;
var feature_refresh = 300;
var feature_duration = 250;
var grid_count = 0;
var grid_column;
var grid_item;



/* /////////////////////////////////////////////////////////////////////  INIT  /// */

/* ----------------------------------------------------------------------- INIT --- */
function init() {
    'use strict';
	init_media();
	init_control();
	if ($('body').hasClass('page_index')) {
		init_feature();
	}
	if ($('body').hasClass('page_work') || $('body').hasClass('page_news') || $('body').hasClass('page_about')) {
		init_deck();		   
   	}
	if ($('body').hasClass('page_work') || $('body').hasClass('page_news')) {
		init_sort();
		init_filter();
		init_share();	  
		init_search();
   	}
	if ($('body').hasClass('page_work')) {
		init_grid();
	}
	init_subscribe();
}
$(document).on('ready', init);

/* ----------------------------------------------------------------- INIT IMAGE --- */
/* loads high res images */

function init_media() {
	'use strict';
	console.log('init MEDIA');
	$('.media').each(function() {
		var this_target = $(this);
		var this_src = this_target.attr('data-src');
		if (typeof this_src !== typeof undefined && this_src !== false) {	
			if (this_target.hasClass('image')) {
				this_target.css('background-image', 'url(' + this_src + ')');
			} else {
				this_target.children('video').attr('src', this_src);
			}
		}
	});
}

/* --------------------------------------------------------------- INIT CONTROL --- */
/* toggles nav and menu visibility */

function init_control() {
	'use strict';
	console.log('init CONTROL');
	$('.layer').on('click', function() {
		if ($('body').hasClass('view_nav')) {
			$('body').removeClass('view_nav');
		} else {
			$('body').toggleClass('view_layer');
		}
		if ($('body').hasClass('page_work')) {
			init_grid();
		}
	});
	//window.addEventListener('popstate', function(event) {
		//alert('chim');
		//$('body').removeClass('view_nav view_layer');
	//});
	$('.toggle').on('click', function() {
		$('body').toggleClass('view_nav');
	});
	$(window).resize(function() {
		clearTimeout(timeout_resize);
  		$('body').addClass('action_resize');
		timeout_resize = setTimeout(function(){ 
			$('body').removeClass('action_resize'); 
		}, delay_resize);
	});
	$(window).mousemove(function() {
		clearTimeout(timeout_move);
  		$('body').addClass('action_move');
		timeout_move = setTimeout(function(){ 
			$('body').removeClass('action_move'); 
		}, delay_move);
	});
	$('body').removeClass('action_resize');
	$('.back').on('click', function() {
		$('body').removeClass('view_detail');
		if ($('body').hasClass('page_news')) {
			if(news_title) {
				document.getElementsByTagName('title')[0].innerHTML = 'Build — ' + news_title;
				$('meta[property="og:title"]').remove();
				$('meta[name="twitter:title"]').remove();
				$('head').append( '<meta property="og:title" content="' + news_title +'">' );
				$('head').append( '<meta name="twitter:title" content="' + news_title +'">' );
			}
			if(news_image) {
				$('meta[property="og:image"]').remove();
				$('meta[name="twitter:image"]').remove();
				$('head').append( '<meta property="og:image" content="' + news_image +'">' );
				$('head').append( '<meta name="twitter:image" content="' + news_image +'">' );
			}
		}
	});
	$('.sort .heading').on('click', function() {
		$('body').toggleClass('view_sort');
		$('body').removeClass('view_search');
		
	});
	$('.search .heading').on('click', function() {
		$('body').toggleClass('view_search');
		$('body').removeClass('view_sort');
		if ($('body').hasClass('view_search')) {
			$('#query').focus();
		}
	});
	$('.content .a').on('click', function() {
		$('body').removeClass('view_layer');
	});
	$('.layer').on('mouseenter', function(event) {
		if (event.offsetX < $(this).width()) {
			$('.action').addClass('hover');
		}
	});
	$('.layer').on('mouseleave', function() {
		$('.action').removeClass('hover');
	});
	$('#fixed').on('wheel', function(event){
		var this_target = $('#content').scrollTop() + (event.originalEvent.deltaY);
		$('#content').scrollTop(this_target);
	});
	$('.back').on('mouseenter', function() {
		$('.back').addClass('hover');
	});
	$('.back').on('mouseleave', function() {
		$('.back').removeClass('hover');
	});
	$('.reset').on('click', function() {
		$('#sort_desc').trigger('click');
		$('input[type="checkbox"]:checked').trigger('click');
		$('.form.search input').val('');
		$('.form.search button').trigger('click');
	});
}

/* ------------------------------------------------------------------ INIT DECK --- */
/* setup of deck for carousel scrolling */

function init_deck() {
	'use strict';
	console.log('init DECK');
	var this_deck = $('.deck');
	var this_card = $('.deck .card');
	this_card.first().addClass('display');
	if (this_card.first().children('.media').hasClass('video')) {
		this_card.first().find('video').get(0).play();
	}
	if (this_card.first().attr('data-caption') !== '') {
		$('#deck_caption').text(this_card.first().attr('data-caption'));
	} else {
		$('#deck_caption').text('');
	}
	var this_length = this_card.length;
	if (this_length > 1) {
		this_deck.data('length', this_length);
		this_deck.data('current', 0);
		this_deck.data('next', 1);
		this_deck.data('prev', this_length - 1);
		$('.deck').children('.control.next').on('click', function() {
			if (deck_active === false) { 
				run_deck('next');
			}
		});
		$('.deck').children('.control.prev').on('click', function() {
			if (deck_active === false) { 
				run_deck('prev');
			}
		});
	}
	$('.card').bind('animationend webkitAnimationEnd oAnimationEnd MSAnimationEnd', function(){
		deck_active = false;
	});
	$(document).keydown(function(event) {
		switch(event.which) {
			case 37:
				$('.deck').children('.control.prev').click();
				break;
			case 39:
				$('.deck').children('.control.next').click();
				break;
			default: return;
		}
	});
	$('.deck').on('swipeLeft', function() {
		$('.deck').children('.control.next').click();
	});
	$('.deck').on('swipeRight', function() {
		$('.deck').children('.control.prev').click();
	});
}

/* --------------------------------------------------------------- INIT FEATURE --- */
/* control feature display and snapping */

function init_feature() {
	'use strict';
	console.log('init FEATURE');
	height_viewport = window.innerHeight;
	height_header = $('body > header').height();
	height_feature = $('.feature').first().height();
	height_text = $('.feature').first().find('.text').height();
	$('.feature').first().addClass('state_1');
	$(window).on('resize', function () {
    	height_viewport = window.innerHeight;
		height_header = $('body > header').height();
		height_feature = $('.feature').first().height();
		height_text = $('.feature').first().find('.text').height();
		$(window).trigger('scroll');
	}).trigger('resize');
	$('.position a').on('click', function() {
		var this_index = $('.position a').index(this);
		feature_target = $('.feature').eq(this_index);
		run_feature();
	});
	$('html, body').on("scroll mousedown wheel DOMMouseScroll mousewheel keyup touchmove", function(){
       	$('html, body').stop();
   	});
	$(window).on('scroll', function() {
		var scroll_top = $(window).scrollTop();
		$('.feature').each(function() {
			var this_feature = $(this);
			var this_offset = this_feature.offset().top; 
			if ((scroll_top - this_offset) >= (((height_viewport - height_text) / 2) - height_header)) {	
				this_feature.removeClass('state_1').addClass('state_2');
			} else if (scroll_top >= this_offset) {
				this_feature.removeClass('state_2').addClass('state_1');
			} else {
				this_feature.removeClass('state_1 state_2');
			}
			if(this_offset < (scroll_top + (height_viewport / 2) )) {
				this_feature.addClass('visible');
			} else {
				this_feature.removeClass('visible');
			}
		});
		feature_target = $('.feature.visible').last();
		var this_index = $('.feature').index(feature_target);
		$('.position a').removeClass('selected');
		$('.position a').eq(this_index).addClass('selected');
		if ((feature_ready === true) && ($('body').width() > breakpoint_mobile)) { 			
			clearTimeout(feature_timeout);
			feature_timeout = setTimeout(function() {
				run_feature();
			}, feature_delay);
		 }
	}).trigger('scroll');
	feature_ready = true;
}

/* ------------------------------------------------------------------ INIT SORT --- */
/* function to order item lists */

function init_sort() {
	'use strict';
	console.log('init SORT');
	$('.sort a').on('click', function() {
		if (!$(this).hasClass('selected')) {
			$('.sort a').removeClass('selected');
        	$(this).addClass('selected');
			var this_array;
			var this_container;
			if ($('body').hasClass('page_work')) {
				this_array = $('.container a');
				this_container = $('.container');
			} else {
				this_array = $('[data-time]');
				this_container = $('[data-time]').parent();
			}
			this_array.each(function() {
				$(this).prependTo(this_container);
			});
			if ($('body').hasClass('page_work')) {
				grid_count = 0;
				run_grid();
			}
		}
    });
	run_position();
}

/* ---------------------------------------------------------------- INIT FILTER --- */
/* function to filter item lists based on tags selected */

function init_filter() {
	'use strict';
	console.log('init FILTER');
	
	if (!$('body').hasClass('page_work')) {
		localStorage.removeItem('filter_work');
	}
	if (!$('body').hasClass('page_news')) {
		localStorage.removeItem('filter_news');
	}
	var active_array = [];
    $('input[type="checkbox"]').on('change', function() {
        var this_checkbox = $(this);
        var this_id = parseInt(this_checkbox.val());
        if (this_checkbox.is(':checked')) {
            active_array.push(this_id);
        } else {
            active_array.splice($.inArray(this_id, active_array), 1);
        }
		if ($('body').hasClass('page_news')) {
			localStorage.setItem('filter_news', JSON.stringify(active_array));
		} else if ($('body').hasClass('page_work')) {
			localStorage.setItem('filter_work', JSON.stringify(active_array));
		}
        run_filter(active_array);
    });
	var filter;
	if ($('body').hasClass('page_news')) {
		filter = localStorage.getItem('filter_news');
		run_position();
	} else if ($('body').hasClass('page_work')) {
		filter = localStorage.getItem('filter_work');
		run_position();
	}
	if (typeof filter !== 'undefined') {
    	filter = JSON.parse(filter);
    	$.each(filter, function(_, value) {
    		$('input[type="checkbox"]#tag_' + value).attr('checked', true);
    	});
    }
	if ($('input[type="checkbox"]:checked').length > 0) {
		$('input[type="checkbox"]:checked').trigger('change');
	}
}

/* ----------------------------------------------------------------- INIT SHARE --- */
/* sharing intents */

function init_share() {
	'use strict';
	console.log('init SHARE');
	$('.share a.facebook').on('click', function() {
        var url,
            title,
            string;
        url = window.location.href;
        title = $(document).prop('title');
        string = 'http://www.facebook.com/sharer.php?s=100&p[url]=' + escape(url) + '&p[title]=' + escape(title);
        help_modal(string);
    });
	$('.share a.twitter').on('click', function() {
        var url,
            string;
        url = window.location.href;
        string = 'https://twitter.com/share?url=' + escape(url);
        help_modal(string);
    });
	$('.share a.link').on('click', function() {
        var $input;
        var url;
        $input = $('<input>');
        url = window.location.href;
        $('body').append($input);
        $input.val(url)[0].select();
        document.execCommand('copy');
        $input.remove();
        $(this).addClass('active');
        setTimeout(function() {
            $('.share a.link').removeClass('active');
        }, 2000);
    });
}

/* ---------------------------------------------------------------- INIT SEARCH --- */
/* search filtering of items */

function init_search() {
	'use strict';
	console.log('init SEARCH');
	$('.form.search button').on('click', function(event) {
		event.preventDefault();
		var $form;
		$form = $(this).closest('.form');
		run_search($form);
	});
	$('.form.search input').on('keypress', function(event) {
		if (event.key === 'Enter') {
			var $form;
			$form = $(this).closest('.form');
			run_search($form);
		}
	});
}

/* ------------------------------------------------------------- INIT SUBSCRIBE --- */
/* mailing list signup */

function init_subscribe() {
	'use strict';
	console.log('init SUBSCRIBE');
	$('form.signup').on('submit', function(event) {
		event.preventDefault();
		var action = $(this).attr('action');
		var method = $(this).attr('method');
		var data = $(this).serializeArray();
		$.ajax({
			url: action,
			type: method,
			cache: false,
			data: data,
			success: function() {
				$('form.signup #email').val('').attr('placeholder', 'Thank you for subscribing');
			}
		});
	});
}

/* ------------------------------------------------------------------ INIT GRID --- */
/* work grid column sorting */

function init_grid() {
	'use strict';
	console.log('init GRID');
	grid_column =  $('.column:visible');
	$(window).on('resize', function() {
		run_grid();
	});
	run_grid();
}



/* //////////////////////////////////////////////////////////////////////  RUN  /// */

/* ---------------------------------------------------------------- RUN FEATURE --- */
/* scrolls to feature */

function run_feature(this_target) {
	'use strict';
	console.log('run FEATURE');
	this_target = this_target || feature_target;
	var this_offset = this_target.offset().top;
	if (feature_ready === true) {
		feature_ready = false;
		clearTimeout(feature_timeout);
		$('html, body').stop().animate({ scrollTop: this_offset }, feature_duration, 'swing');
		feature_timeout = setTimeout(function() {
			feature_ready = true;
		}, feature_refresh);
	}
}

/* ------------------------------------------------------------------- RUN DECK --- */
/* changes the media currently in view */

function run_deck(arg_direction) {
	'use strict';
	console.log('run DECK');
	var this_deck = $('.deck');
	var this_card = $('.deck .card');
	var this_length = this_deck.data('length');
	var this_current = this_deck.data('current');
	var this_display = this_card.eq(this_deck.data('current'));
	var this_target = this_card.eq(this_deck.data(arg_direction));
	this_deck.removeClass('prev next').addClass(arg_direction);
	this_card.removeClass('active');
	this_display.removeClass('display').addClass('active');
	this_target.addClass('display');
	this_current = this_deck.data(arg_direction);
	if (this_display.children('.media').hasClass('video')) {
		this_display.find('video').get(0).pause();
	}
	if (this_target.children('.media').hasClass('video')) {
		this_target.find('video').get(0).play();
	}
	var this_next = this_current + 1;
	if (this_next === this_length) {
		this_next = 0;
	}
	var this_prev = this_current - 1;
	if (this_prev < 0) {
		this_prev = this_length - 1;
	}
	this_deck.data('current', this_current);
	this_deck.data('next', this_next);
	this_deck.data('prev', this_prev);
	$('#deck_count').text(help_pad((this_current + 1), 2));
	if (this_target.attr('data-caption') !== '') {
		$('#deck_caption').text(this_target.attr('data-caption'));
	} else {
		$('#deck_caption').text('');
	}
	deck_active = true;
}

/* ----------------------------------------------------------------- RUN FILTER --- */
/* changes the media currently in view */

function run_filter(active_array) {
	'use strict';
	console.log('run FILTER');
    $('[data-tag]').each(function(_, item) {
        var $item;
        var tag_array,
            found;
        $item = $(item);
        tag_array = JSON.parse($item.attr('data-tag'));
        found = tag_array.filter(function(v) {
            return active_array.indexOf(v) > -1;
        }).length > 0;
        if (found === true) {
			$item.removeClass('hide_filter');
		} else {
			$item.addClass('hide_filter');
		} 
    });
	if (active_array.length === 0) {
		$('[data-tag]').removeClass('hide_filter');
	}
	run_position();
}

/* --------------------------------------------------------------- RUN POSITION --- */
/* marks the position of an item in a filtered or searched set */

function run_position() {
	'use strict';
	console.log('run POSITION');
	var count = 0;
	var total = $('.item:not(.hide_filter):not(.hide_search)').length;
	var offset = total - 3;
	if (offset < 1) { 
		offset = 1; 
	}
	$('.item').removeAttr('data-position');
	$('.item:not(.hide_filter):not(.hide_search)').each(function() {
		count = count + 1;
		var this_position = count - offset;
		if (count > offset) {
			$(this).attr('data-position', this_position);
		}
	});
}

/* ----------------------------------------------------------------- RUN SEARCH --- */
/* search filtering of items */

function run_search(form) {
	'use strict';
	console.log('run SEARCH');
	var $form;
	var query,
		object;
	$form = $(form);
	query = $form.find('#query').val();
	object = $('.page_work').length > 0 ? 'work' : 'news';
	$.ajax({
		url: BASE_URL + '/src/include/data.php?f=' + object + '_search_ajax',
		type: 'post',
		cache: false,
		data: {
			query: query
		},
		dataType: 'json',
		success: function(res) {
			if (object === 'work') {
				var work_array = res;
				$('.container .item').addClass('hide_search');
				$.each(work_array, function(_, id) {
					$('.container .item[data-id="' + id + '"]').removeClass('hide_search');
				});
				grid_count = 0;
				run_grid();
			}
			else if (object === 'news') {
				var news_array = res;
				$('.area .item').addClass('hide_search');
				$.each(news_array, function(_, id) {
					$('.area .item[data-id="' + id + '"]').removeClass('hide_search');
				});
			}
		}
	});
}

/* ------------------------------------------------------------------- RUN GRID --- */
/* sort the grid items into columns based upon their height  */

function run_grid() {
	'use strict';
	console.log('run GRID');
	grid_column =  $('.column:visible');
	var column_count = grid_column.length;
	if (column_count !== grid_count) {
		grid_count = column_count;
		var this_array = Array.apply(null, Array(grid_count)).map(Number.prototype.valueOf,0);
		grid_column.empty();
		grid_item = $('.container a.item');
		grid_item.each(function() {
			var this_item = $(this);
			var this_height = this_item.outerHeight();
			var this_column = this_array.indexOf(Math.min.apply(Math, this_array));
			this_array[this_column] += this_height;
			grid_column.eq(this_column).append(this_item.clone(true, true));
		});
	}
}



/* /////////////////////////////////////////////////////////////////////  HELP  /// */

/* ------------------------------------------------------------------- HELP PAD --- */
/* zero pads text string numbers */

function help_pad(value, width, character) {
	'use strict';
	console.log('help PAD');
  	character = character || '0';
  	value = value + '';
  	return value.length >= width ? value : new Array(width - value.length + 1).join(character) + value;
}
	
/* ----------------------------------------------------------------- HELP MODAL --- */
/* create modal mostly for social sharing */

function help_modal(url, width, height) {
	'use strict';
	console.log('run MODAL');
    width = width || 512;
    height = height || 512;
    var pos = { x: (screen.width / 2) - (width / 2), y: (screen.height / 2) - (height / 2) };
    window.open(url, 'sharer', 'top=' + pos.y + ',left=' + pos.x + ',toolbar=0,status=0,width=' + width + ',height=' + height);
}


