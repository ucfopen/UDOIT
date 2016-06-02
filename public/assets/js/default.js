/**
*	Copyright (C) 2014 University of Central Florida, created by Jacob Bates, Eric Colon, Fenel Joseph, and Emily Sachs.
*
*	This program is free software: you can redistribute it and/or modify
*	it under the terms of the GNU General Public License as published by
*	the Free Software Foundation, either version 3 of the License, or
*	(at your option) any later version.
*
*	This program is distributed in the hope that it will be useful,
*	but WITHOUT ANY WARRANTY; without even the implied warranty of
*	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
*	GNU General Public License for more details.
*
*	You should have received a copy of the GNU General Public License
*	along with this program.  If not, see <http://www.gnu.org/licenses/>.
*
*	Primary Author Contact:  Jacob Bates <jacob.bates@ucf.edu>
*/

var progressTimer = null;

/* Fades out and destroys the popup window and background. */
function killButton(callback) {
	if($("#popup").length > 0) {
		$("#popup").fadeOut(300,function(){
			$('#popup').remove();
			if($("#popupback").length > 0) {
				$("#popupback").fadeOut(300,function(){
					$('#popupback').remove();
				});
			}

			$('#submit').removeClass('disabled').html('Run scanner');

			$('#waitMsg').fadeOut();

			if(callback) {
				callback();
			}
		});
	}
}

/* Creates a general template for the popup window
 * The callback parameter takes in a function to be fired once the popup is made*/
function popUpTemplate(noback, callback) {
	if(!noback) { popUpBack() };
	$('#submit').addClass('disabled').html('<div id="popup"></div> Beginning scan...');

	$('#popup').hide();
	// NEED TO MAKE THESE PARAMETERS AS WELL.
	if(callback != undefined) { callback() };

	$('#popup').fadeIn(300).css("display","inline-block");
}

function loader(text) {
	popUpTemplate(true, function() {
		$('#popup').addClass('loading_popup');
		$('#popup').html('<div class="circle-white"></div>');
	});
}

/* Builds up the results and adds them to the page */
function checker() {
	var main_action = $('input[name="main_action"]').val();
	var base_url = $('input[name="base_url"]').val();
	var course_id = $('input[name="session_course_id"]').val();
	var context_label = $('input[name="session_context_label"]').val();
	var context_title = $('input[name="session_context_title"]').val();
	var content = $('.content:not(#allContent):checked').map(function(i,n) {
		return $(n).val();
	}).get();

	if (content.length === 0) {
		content = "none";
	}

	$.ajax({
		url: "process.php",
		type: "POST",
		data: {
			main_action: main_action,
			base_url: base_url,
			content: content,
			course_id: course_id,
			context_label: context_label,
			context_title: context_title
		},
		success: function(data){
			clearInterval(progressTimer);
			$('#scanner').append('<section id="result">'+data+'</section>');
			killButton(function() {
				$('#result').fadeIn();
			});

			jscolor.bind();
		},
		error: function(data){
			clearInterval(progressTimer);
			killButton();
			$('#failMsg').fadeIn();
		}
	});
}

// updates UFIXIT preview for cssTextStyleEmphasize
function ufixitCssTextStyleEmphasize( button ) {
	var back = button.parent().find('input.back-color');
	var fore = button.parent().find('input.fore-color');

	var bgcolor = "#fff";

	if (back.length !== 0) {
		bgcolor = $(back).val();
	}

	var preview = button.parent().find('div.ufixit-preview-canvas');
	preview.attr("style", "color: " + $(fore).val() + "; background-color: " + bgcolor + ";" );
	
}
// END update UFIXIT Preview on load

// updates UFIXIT preview for cssTextHasContrast
function ufixitCssTextHasContrast( button ) {
	var back = button.parent().find('input.back-color');
	var fore = button.parent().find('input.fore-color');
	var text_type = button.parent().find('input.threshold');

	var error = button.parent().find('span.contrast-invalid');
	var cr = button.parent().find('span.contrast-ratio');
	var contrast_ratio = 0;

	var bgcolor = "#fff";
	var threshold = (text_type.attr('value') === 'text')? 4.5: 3;

	if (back.length !== 0) {
		bgcolor = $(back).val();
		$(back).css('background-color', bgcolor);
	}

	contrast_ratio = contrastRatio(bgcolor, $(fore).val() );
	$(cr).html( contrast_ratio.toFixed(2) );

	var preview = button.parent().find('div.ufixit-preview-canvas');

	preview.attr("style", "color: " + $(fore).val() + "; background-color: " + bgcolor + ";" );

	if (contrast_ratio < threshold) {
		$(error).removeClass('hidden');
		$(fore).css({"border-color": "red", "background-color": $(fore).val()});
		var sub = button.parent().find('button.submit-content').prop('disabled',true);
	}

	button.parent().find("li.color").each(function () {
		var color = $(this).attr("value");
		$(this).css("background-color", color);

		//if the swatch color is too dark
		//change font color to something lighter 
		var c = color.substring(1); // strip '#'
		var rgb = parseInt(c, 16); // convert rrggbb to decimal
		var r = (rgb >> 16) & 0xff; // extract red
		var g = (rgb >> 8) & 0xff; // extract green
		var b = (rgb >> 0) & 0xff; // extract blue

		var luma = 0.2126 * r + 0.7152 * g + 0.0722 * b; // per ITU-R BT.709

		if (luma < 100) {
			$(this).css("color", "#ffffff");
		}

		if ( contrastRatio(bgcolor, color) < threshold ) {
			$(this).find('span.invalid-color').removeClass('hidden');
		}
	});
}
// END update UFIXIT Preview on load

$(document).ready(function() {
	// content checkboxes
	var content_checked = true;

	$('#allContent').click(function() {
		var content_checkboxes = $(this).parent().parent().parent().find('.content:not(#allContent)');
		if (content_checked) {
			content_checkboxes.prop('checked', false);
			content_checked = false;
		} else {
			content_checkboxes.prop('checked', true);
			content_checked = true;
		}
	});

	$('.content:not(#allContent)').click(function() {
		var content_checkboxes = $(this).parent().parent().parent().find('.content:not(#allContent):checked');

		if (content_checkboxes.length == 5) {
			$('#allContent').prop('checked', true);
			content_checked = true;
		} else {
			$('#allContent').prop('checked', false);
			content_checked = false;
		}
	});
	// END content checkboxes

	// udoit form submit
	$(document).on("click", "#submit", function(e) {
		e.preventDefault();

		if ($('#result').length > 0) {
			$('#result').remove();
		}

		if ($('#failMsg').css('display') == 'block') {
			$('#failMsg').fadeOut();
		}

		$('#waitMsg').fadeIn();

		loader();

		var old = 0;


		// start progress checker, this is cleared here or from checker()
		clearInterval(progressTimer);
		progressTimer = setInterval(function(){
			$.ajax({
				url: 'progress.php',
				error: function(xhr, status, error) {
					clearInterval(progressTimer);
				},
				success: function(data){
					// update display if progress state has changed
					if(data != old) {
						old = data;
						$('#submit').html('<div id="popup"><div class="circle-white"></div></div> Scanning '+data+'...');
					}
				}
			});
		}, 500);

		checker();

		return false;
	});
	// END udoit form submit

	// result panel collapsing
	$(document).on("click", ".errorItem .panel-heading .btn-toggle", function() {
		$(this).children('button span').removeClass('glyphicon-minus').addClass('glyphicon-plus');
		var errorItem = $(this).parent();
		if ($(this).parent().parent().find('.errorSummary').is(':visible')) {
			$(this).parent().parent().find('.errorSummary').slideUp(function() {
				errorItem.children('button span').removeClass('glyphicon-minus').addClass('glyphicon-plus');
			});
		}
		else {
			$(this).children('button span').removeClass('glyphicon-plus').addClass('glyphicon-minus');
			$(this).parent().parent().find('.errorSummary').slideDown();
		}
	});
	// END result panel collapsing

	// view error source
	$(document).on("click", ".viewError", function() {
		$(this).addClass('hidden');
		$(this).parent().parent().find('div.more-info').removeClass('hidden');
		$(this).parent().parent().parent().find('a.closeError').removeClass('hidden');
		$(this).parent().parent().parent().find('a.closeError').first().focus();
	});
	// END view error source

	// close error source
	$(document).on("click", ".closeError", function() {
		$(this).parent().parent().parent().find('a.viewError').removeClass('hidden');
		$(this).parent().parent().parent().find('a.viewError').focus();
		$(this).parent().parent().parent().find('div.more-info').addClass('hidden');
		$(this).parent().parent().parent().find('a.closeError').addClass('hidden');
	});
	// END close error source

	// Link both "Close this view" statements on mouseover with highlighting
	$(document).on("mouseenter", ".closeError", function() {
		$(this).parent().parent().parent().find('a.closeError').css('background-color', 'rgba(225, 225, 225, 1)');
		$(this).parent().parent().parent().find('a.closeError').css('border-radius', '3px');
	});
	// END link between "Close this view" statements

	// Removes link between both "Close this view" statements on mouseleave removing highlighting
	$(document).on("mouseleave", ".closeError", function() {
		$(this).parent().parent().parent().find('a.closeError').css('background-color', 'rgba(225, 225, 225, 0)');
	});
	// END unlink

	// print button
	$(document).on("click", "#print", function() {
		window.print();
		return false;
	});
	// END print button

	// the "U FIX IT" button ((on scanner))
	$(document).on("click", "button.fix-this", function() {
		var parent = $(this).parent();
		$(this).hide();

		var contentForm = parent.find('form');

		if (contentForm.is(':visible')) {
			parent.find('form').removeClass('show');
			parent.find('form').addClass('hidden');
		}
		else {
			parent.find('form').removeClass('hidden');
			parent.find('form').addClass('show');
		}

		switch ( $(this).attr("value") ) {
			case "cssTextHasContrast":
				ufixitCssTextHasContrast( $(this) );
				break;

			case "cssTextStyleEmphasize":
				ufixitCssTextStyleEmphasize( $(this) );
				break;

			default:
				break;
		}
	});

	// ((tooltip on old reports))
	$(document).on("mouseover", "#cached button.fix-this", function() {
		$('.toolmessage').stop().fadeIn().css("display","inline-block");
	});

	$(document).on("mouseout", "#cached button.fix-this", function() {
		$('.toolmessage').stop().fadeOut();
	});

	// END the "U FIX IT" button

	// submitting the ufixit form
	$(document).on("submit", ".ufixit-form", function(e) {
		e.preventDefault();

		var parent = $(this).parent();
		var values = $(this).serializeArray();
		var errorsRemaining = -1; 

		values.push({ name: 'base_url', value: $('input[name="base_url"]').val() });
		values.push({ name: 'course_id', value: $('input[name="session_course_id"]').val() });
		values.push({ name: 'context_label', value: $('input[name="session_context_label"]').val() });
		values.push({ name: 'context_title', value: $('input[name="session_context_title"]').val() });

		parent.find('.alert').remove();
		$.ajax({
			url: "process.php",
			type: "POST",
			data: values,
			success: function(data) {
				if (data == "Missing content") {
					parent.append('<div class="alert alert-danger well-sm no-margin margin-top"><span class="glyphicon glyphicon-ban-circle"></span> Please enter alt text.</div>');
				} else if (data == "Incorrect table scope") {
					parent.append('<div class="alert alert-danger well-sm no-margin margin-top"><span class="glyphicon glyphicon-ban-circle"></span> You should enter "col" or "row" for th scopes.</div>');
				} else {
					parent.removeClass('in');

					parent.find('input[name="submittingagain"]').val('Yes');

					parent.parent().find('button').removeClass('hidden');
					parent.parent().find('.fix-success').removeClass('hidden');

					errorsRemaining = parent.parent().parent().find('.fix-success.hidden').length;
					if ( errorsRemaining == 0 ) {
						parent.parent().parent().find('.badge-error').addClass('badge-success');
						parent.parent().parent().find('h5').removeClass('text-danger').addClass('text-success');
					}
				}
			},
			error: function(data) {
				parent.append('<div class="alert alert-danger no-margin margin-top"><span class="glyphicon glyphicon-ban-circle"></span> <strong>Error:</strong> '+data.responseText+'.</div>');
			}
		});
	});
	// END submitting the fix-it form

	// counting down the new alt text input
	$(document).on("keyup", ".fix-alt input", function() {
		var left = 100 - $(this).val().length;
		if (left < 0) {
			left = 0;
		}
		$(this).parent().find(".counter").text(left);
	});
	// END counting down the new alt text input

	// clicking a result table row to display the cached report
	$(document).on("click", "#resultsTable tbody tr", function() {
		var main_action = "cached";
		var cached_id   = $(this).attr('id');

		$.post("parseResults.php", { main_action: main_action, cached_id: cached_id }, function(data) {
			$('#resultsTable').fadeOut();
			$('#cached').append('<div id="result">'+data+'</div>');
			$('#result').fadeIn();
		}, "html");
	});
	// END clicking a result table row to display the cached report

	// clicking the back button on a cached report
	$(document).on("click", "#backToResults", function() {
		$('#resultsTable').fadeIn();
		$('#result').remove();
	});
	// END clicking the back button on a cached report

	// clicking the save pdf button
	$(document).on("click", "#savePdf", function() {

		var save = $(this);
		save.find('div.circle-black').removeClass('hidden');
		save.find('span.glyphicon').fadeOut(200);

		var result_html = $('#result').clone();
		var context_title = $('input[name="session_context_title"]').val();

		result_html.find('button').remove();
		result_html.find('pre').remove();
		result_html.find('form').remove();
		result_html.find('.instance').remove();
		result_html.find('.viewError').remove();
		result_html.find('.label-success').remove();
		result_html.find('p:empty').remove();
		result_html.find('.error-preview').remove();
		result_html.find('.error-source').remove();
		result_html.find('.error-desc').prepend('<br>');
		result_html.find('.error-desc').append('<br><br>');
		result_html.find('a.list-group-item').after('<br>');
		result_html.find('.fix-success').remove();

		var form = $('<form action="parsePdf.php" method="post">' +
		  '<input type="hidden" name="result_html" />' +
		  '<input type="hidden" name="context_title" value="'+ context_title +'"/>' +
		  '</form>');

		$(form).find('input[name="result_html"]').val(result_html.html());

		$(form).appendTo('body').submit();

		// start parsePdfProgress checker
		clearInterval(progressTimer);
		progressTimer = setInterval(function(){
			$.ajax({
				url: '../../parsePdfProgress.php',
				error: function(xhr, status, error) {
					clearInterval(progressTimer);
				},
				success: function(data){
					// update display if progress state has changed
					if (data) {
						clearInterval(progressTimer);
						save.find('div.circle-black').addClass('hidden');
						save.find('span.glyphicon').fadeIn(200);
					}
				}
			});
		}, 100);

	});
	// END clicking the save pdf button

	// clicking the cached reports tab
	$(document).on("click", "a[href='#cached']", function() {
		if ($('#result').length > 0) {
			$('#result').remove();
		}

		$.ajax({
			url: "cached.php",
			type: "GET",
			success: function(data) {
				$("#cached").html(data);
			},
			error: function() {
				$("#cached").append('<div class="alert alert-danger no-margin margin-top"><span class="glyphicon glyphicon-ban-circle"></span> Error displaying cached reports.</div>');
			}
		});
	});
	// END clicking the cached reports tab

	// Rule forces links within "What does UDOIT Look for?" to open in new page
	$('#udoitInfo a').on("click", function() {
		event.preventDefault();

		var url = $(this).attr('href');
		window.open(url, '_blank');
	});
	// END Rule forcing links to open in new window

	// click to remove/fill Heading with no text
	$(document).on("click", ".remove-heading", function (e) {
		var input = $(e.target).parent().parent().find('input[name="newcontent"]');
		if( input.attr("placeholder") == "New heading text") {
			input.val("");
			input.attr("maxlength", "0");
			input.attr("placeholder", "Empty heading will be deleted");
		} else {
			input.removeAttr("maxlength");
			input.attr("placeholder", "New heading text");
		}
	});
	// END click to remove/fill Heading with no text

	// click to remove/fill Link with no text
	$(document).on("click", ".remove-link", function (e) {
		var input = $(e.target).parent().parent().find('input[name="newcontent"]');

		if( input.attr("placeholder") == "New link text") {
			input.val("");
			input.attr("maxlength", "0");
			input.attr("placeholder", "Link will be deleted");
		} else {
			input.removeAttr("maxlength");
			input.attr("placeholder", "New link text");
		}
	});
	// END click to remove/fill link with no text

	// updates UFIXIT Preview on change of background color
	$(document).on("change", "input.back-color", function (e) {
		var preview = $(e.target).parent().parent().parent().find('div.ufixit-preview-canvas');
		var fore = $(e.target).parent().parent().parent().find('input.fore-color');
		var text_type = $(e.target).parent().parent().parent().find('input.threshold');
		preview.css("background-color", $(e.target).val() );

		var error = $(e.target).parent().parent().parent().find('span.contrast-invalid');
		var cr = $(e.target).parent().parent().parent().find('span.contrast-ratio');
		var contrast_ratio = 0;

		var threshold = (text_type.attr('value') === 'text')? 4.5: 3;
		var bgcolor = $(e.target).val();

		contrast_ratio = contrastRatio( $(e.target).val(), $(fore).val() );
		$(cr).html( contrast_ratio.toFixed(2) );

		if (contrast_ratio < threshold) {
			$(error).removeClass('hidden');
			fore.attr('style','border-color: red;');
			$(e.target).parent().parent().parent().parent().find('button.submit-content').prop('disabled',true);
		} else {
			$(error).addClass('hidden');
			fore.attr('style','');
			$(e.target).parent().parent().parent().parent().find('button.submit-content').removeAttr('disabled');
		}

		$(e.target).parent().parent().parent().find("li.color").each(function () {
			var color = $(this).attr("value");

			if ( contrastRatio(bgcolor, color) < threshold ) {
				$(this).find('span.invalid-color').removeClass('hidden');
			} else {
				$(this).find('span.invalid-color').addClass('hidden');
			}
		});

	});
	// END update UFIXIT Preview on change of background color

	// updates UFIXIT Preview on change of foreground color
	$(document).on("change", "input.fore-color", function (e) {
		var preview = $(e.target).parent().parent().parent().find('div.ufixit-preview-canvas');
		preview.css("color", $(e.target).val() );

		var back = $(e.target).parent().parent().parent().find('input.back-color');
		var fore = $(e.target).parent().parent().parent().find('input.fore-color');
		var text_type = $(e.target).parent().parent().parent().find('input.threshold');
		var error = $(e.target).parent().parent().parent().find('span.contrast-invalid');
		var cr = $(e.target).parent().parent().parent().parent().find('span.contrast-ratio');
		var contrast_ratio = 0;
		var bgcolor = "#fff";

		if ( $(back).length > 0 ) {
			bgcolor = $(back).val();
		}

		var threshold = (text_type.attr('value') === 'text')? 4.5: 3;

		contrast_ratio = contrastRatio( bgcolor, $(e.target).val() );
		$(cr).html( contrast_ratio.toFixed(2) );

		if (contrast_ratio < threshold) {
			$(error).removeClass('hidden');
			fore.attr('style','border-color: red;');
			$(e.target).parent().parent().parent().parent().find('button.submit-content').prop('disabled',true);
		} else {
			$(error).addClass('hidden');
			fore.attr('style','');
			$(e.target).parent().parent().parent().parent().find('button.submit-content').removeAttr('disabled');
		}

		$(e.target).parent().parent().parent().find("li.color").each(function () {
			var color = $(this).attr("value");

			if ( contrastRatio(bgcolor, color) < threshold ) {
				$(this).find('span.invalid-color').removeClass('hidden');
			} else {
				$(this).find('span.invalid-color').addClass('hidden');
			}
		});
	});
	// END update UFIXIT Preview on change of foreground color

	// updates UFIXIT Preview on change of foreground color using Color-Picker
	$(document).on("click", "li.color", function (e) {
		var preview = $(e.target).parent().parent().parent().parent().find('div.ufixit-preview-canvas');
		var back = $(e.target).parent().parent().parent().parent().find('input.back-color');
		var fore = $(e.target).parent().parent().parent().parent().find('input.fore-color');
		var text_type = $(e.target).parent().parent().parent().parent().find('input.threshold');

		var error = $(e.target).parent().parent().parent().parent().find('span.contrast-invalid');
		var cr = $(e.target).parent().parent().parent().parent().find('span.contrast-ratio');
		var contrast_ratio = 0;
		var bgcolor = "#fff";

		if ( $(back).length > 0 ) {
			bgcolor = $(back).val();
		}

		var threshold = (text_type.attr('value') === 'text')? 4.5: 3;

		contrast_ratio = contrastRatio( bgcolor, $(e.target).attr("value") );
		$(cr).html( contrast_ratio.toFixed(2) );

		if (contrast_ratio < threshold) {
			$(error).removeClass('hidden');
			fore.attr('style','border-color: red;');
			$(e.target).parent().parent().parent().parent().find('button.submit-content').prop('disabled',true);
		} else {
			$(error).addClass('hidden');
			fore.attr('style','');
			$(e.target).parent().parent().parent().parent().find('button.submit-content').removeAttr('disabled');
		}
		
		preview.css("color", $(e.target).attr("value") );
		$(fore).val( $(e.target).attr("value") );

		$(fore).css("background-color", $(e.target).attr("value") );
		$(fore).css("color", $(e.target).css("color") );

		$(e.target).parent().parent().parent().parent().find("li.color").each(function () {
			var color = $(this).attr("value");

			if ( contrastRatio(bgcolor, color) < threshold ) {
				$(this).find('span.invalid-color').removeClass('hidden');
			} else {
				$(this).find('span.invalid-color').addClass('hidden');
			}
		});
	});
	// END update UFIXIT Preview on change of foreground color using Color-Picker

	// updates UFIXIT Preview on change of checkbox for 'bold' styling
	$(document).on("change", "input[name='add-bold']", function (e) {
		var preview = $(e.target).parent().parent().parent().parent().find('div.ufixit-preview-canvas');

		if( e.target.checked ) {
			preview.css("font-weight", "bold");
		} else {
			preview.css("font-weight", "normal");
		}
	});
	// END update UFIXIT Preview

	// updates UFIXIT Preview on change of checkbox for 'italic' styling
	$(document).on("change", "input[name='add-italic']", function (e) {
		var preview = $(e.target).parent().parent().parent().parent().find('div.ufixit-preview-canvas');

		if( e.target.checked ) {
			preview.css("font-style", "italic");
		} else {
			preview.css("font-style", "normal");
		}
	});
	// END update UFIXIT Preview
});
