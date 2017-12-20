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
var $doc = $(document); // hold a jquery doc reference

/* Fades out and destroys the popup window and background. */
function killButton(callback) {
	var $popup = $('#popup');
	if($popup.length > 0) {
		$popup.fadeOut(300,function(){
			var $pupupBack = $('#popupback');
			$popup.remove();
			if($pupupBack.length > 0) {
				$pupupBack.fadeOut(300,function(){
					$pupupBack.remove();
				});
			}

			$('#udoitForm button.submit').removeClass('disabled').html('Scan This Course Again');

			$('#waitMsg').fadeOut();

			if(callback) {
				callback();
			}
		});
	}
}

function buildAlertString(text){
	return '<div class="alert alert-danger well-sm no-margin margin-top"><span class="glyphicon glyphicon-ban-circle"></span>'+text+'</div>';
};

/* Creates a general template for the popup window
 * The callback parameter takes in a function to be fired once the popup is made*/
function popUpTemplate(noback, callback) {
	if(!noback) { popUpBack() };
	$('#udoitForm button.submit').addClass('disabled').html('<div id="popup"></div> Beginning scan...');

	$('#popup').hide();
	// NEED TO MAKE THESE PARAMETERS AS WELL.
	if(callback != undefined) { callback() };

	$('#popup').fadeIn(300).css('display','inline-block');
}

function displayLoader(text) {
	popUpTemplate(true, function() {
		$('#popup').addClass('loading_popup');
		$('#popup').html('<div class="circle-white"></div>');
	});
}

function checkScanProgress(jobGroup){
	// start checking for progress
	clearInterval(progressTimer);
	// TODO: add a progress check limit
	progressTimer = setInterval(function(){
		$.ajax({
			url: `progress.php?job_group=${jobGroup}`,
			dataType: 'json',
			error: function(xhr, status, error) {
				clearInterval(progressTimer);
				killButton();
				$('#failMsg').fadeIn();
			},
			success: function(progressResult){
				// empty or not an array, error!
				if(!progressResult.hasOwnProperty('status')){
					clearInterval(progressTimer);
					killButton();
					$('#failMsg').fadeIn();
					return;
				}

				if(progressResult.status === 'finished'){
					clearInterval(progressTimer);
					$('#udoitForm button.submit')
					.html(`<div id="popup"><div class="circle-white"></div></div>Loading Results`);
					loadScanResults(progressResult.reportID);
					return;
				}
				else{
					var running = [];
					var finished = [];
					var notRun = [];
					for (var i = progressResult.jobs.length - 1; i >= 0; i--) {
						var job = progressResult.jobs[i];
						switch(job.status){
							case 'new':
								notRun.push(job.type);
								break;
							case 'finished':
								finished.push(job.type);
								break;
							case 'running':
								running.push(job.type);
								break;
						}
					}
					$('#udoitForm button.submit')
					.html(`<div id="popup"><div class="circle-white"></div></div>Scanning: ${running.join(', ')}... (${notRun.length + running.length} left to scan)`);
					resizeFrame();
					return;
				}
			}
		});
	}, 1000);
}

function loadScanResults(reportID){
	$.ajax({
		url: `parseResults.php?report_id=${reportID}`,
		xhrFields: {withCredentials: true},
		error: function(xhr, status, error) {
			// TODO: show error to user
			clearInterval(progressTimer);
		},
		success: function(data){
			displayScanResults(data)
		}
	});
}

function displayScanResults(results) {
	//show results
	$('#scanner').append(`<section id="result">${results}</section>`);
	killButton(function() {
		$('#result').fadeIn();
		resizeFrame();
	});

	jscolor.bind();
}

/* Builds up the results and adds them to the page */
function sendScanRequest(main_action, base_url, course_id, context_label, context_title, content) {
	if (content.length === 0) content = 'none';

	$.ajax({
		url: 'process.php',
		type: 'POST',
		dataType: 'json',
		data: {
			main_action: main_action,
			base_url: base_url,
			content: content,
			course_id: course_id,
			context_label: context_label,
			context_title: context_title
		},
		success: function(resp){
			if(resp && resp.hasOwnProperty('job_group')){
				checkScanProgress(resp.job_group);
			}
			else{
				killButton();
				if(resp && resp.hasOwnProperty('error')){
					$('#failMsg .msg').hide();
					$('#failMsg .custom-msg').html(resp.error);
					$('#failMsg .custom-msg').show();
				}
				$('#failMsg').fadeIn();
			}
		},
		error: function(data){
			killButton();
			$('#failMsg').fadeIn();
		}
	});
}

// updates UFIXIT preview for cssTextStyleEmphasize
function ufixitCssTextStyleEmphasize( $issueContainer ) {
	var $back = $issueContainer.find('input.back-color');
	var $fore = $issueContainer.find('input.fore-color');
	var bold = $issueContainer.find('input[name="add-bold"]').val();
	var italic = $issueContainer.find('input[name="add-italic"]').val();

	var bgcolor = '#fff';

	if ($back.length !== 0) {
		bgcolor = $back.val();
	}

	var $preview = $issueContainer.find('div.ufixit-preview-canvas');
	$preview.attr('style', 'color: ' + $fore.val() + '; background-color: ' + bgcolor + '; font-weight: ' + bold + '; font-style: ' + italic + '; ');
}
// END update UFIXIT Preview on load

// updates UFIXIT preview for cssTextHasContrast
function ufixitCssTextHasContrast( $issueContainer ) {
	var $back = $issueContainer.find('input.back-color');
	var $fore = $issueContainer.find('input.fore-color');
	var $threshold = $issueContainer.find('input.threshold');
	var bold = $issueContainer.find('input[name="add-bold"]').val();
	var italic = $issueContainer.find('input[name="add-italic"]').val();

	var $error = $issueContainer.find('span.contrast-invalid');
	var $cr = $issueContainer.find('span.contrast-ratio');
	var contrast_ratio = 0;

	var bgcolor = '#fff';
	var threshold = ($threshold.val() === 'text')? 4.5: 3;

	if ($back.length !== 0) {
		bgcolor = $back.val();
		$back.css('background-color', bgcolor);
	}

	contrast_ratio = contrastRatio(bgcolor, $fore.val() );
	$cr.html( contrast_ratio.toFixed(2) );

	var $preview = $issueContainer.find('div.ufixit-preview-canvas');

	$preview.attr('style', 'color: ' + $fore.val() + '; background-color: ' + bgcolor + '; font-weight: ' + bold + '; font-style: ' + italic + '; ');

	if (contrast_ratio < threshold) {
		$error.removeClass('hidden');
		$fore.css({'border-color': 'red', 'background-color': $fore.val()});
		$issueContainer.find('button.submit-content').prop('disabled', true);
	}

	$issueContainer.find('li.color').each(function () {
		var color = $(this).attr('value');
		$(this).css('background-color', color);

		//if the swatch color is too dark
		//change font color to something lighter
		var c = color.substring(1); // strip '#'
		var rgb = parseInt(c, 16); // convert rrggbb to decimal
		var r = (rgb >> 16) & 0xff; // extract red
		var g = (rgb >> 8) & 0xff; // extract green
		var b = (rgb >> 0) & 0xff; // extract blue

		var luma = 0.2126 * r + 0.7152 * g + 0.0722 * b; // per ITU-R BT.709

		if (luma < 100) {
			$(this).css('color', '#ffffff');
		}

		if ( contrastRatio(bgcolor, color) < threshold ) {
			$(this).find('span.invalid-color').removeClass('hidden');
		}
	});
}

// resize containing iframe height
function resizeFrame(){
	var default_height = $('body').height() + 50;
    default_height = default_height > 500 ? default_height : 500;

    // IE 8 & 9 only support string data, so send objects as string
    parent.postMessage(JSON.stringify({
      subject: "lti.frameResize",
      height: default_height
    }), "*");
}

// update iframe height on resize
$doc.on('resize', function(){
	resizeFrame();
});

// END update UFIXIT Preview on load
$doc.ready(function() {
	resizeFrame();

	// content checkboxes
	var content_checked = true;

	$('#allContent').click(function() {
		var $content_checkboxes = $(this).parent().parent().parent().find('.content:not(#allContent)');
		if (content_checked) {
			$content_checkboxes.prop('checked', false);
			content_checked = false;
		} else {
			$content_checkboxes.prop('checked', true);
			content_checked = true;
		}
	});

	$('.content:not(#allContent)').click(function() {
		var $content_checkboxes = $(this).parent().parent().parent().find('.content:not(#allContent):checked');

		if ($content_checkboxes.length == 5) {
			$('#allContent').prop('checked', true);
			content_checked = true;
		} else {
			$('#allContent').prop('checked', false);
			content_checked = false;
		}
	});
	// END content checkboxes

	var runScanner = function(e) {
		e.preventDefault();

		if ($('#result').length > 0) $('#result').remove();
		if ($('#failMsg').css('display') == 'block') $('#failMsg').fadeOut();
		$('#waitMsg').fadeIn();
		resizeFrame();
		var main_action = $('input[name="main_action"]').val();
		var base_url = $('input[name="base_url"]').val();
		var course_id = $('input[name="session_course_id"]').val();
		var context_label = $('input[name="session_context_label"]').val();
		var context_title = $('input[name="session_context_title"]').val();
		var content = $('.content:not(#allContent):checked').map(function(i, n) { return $(n).val(); }).get();

		displayLoader();
		sendScanRequest(main_action, base_url, course_id, context_label, context_title, content);

		return false;
	};

	$doc.on('submit', '#udoitForm', runScanner);
	$doc.on('click', '#udoitForm button.submit', runScanner);

	// result panel collapsing
	$doc.on('click', '.panel-heading .btn-toggle', function() {
		console.log("clicky");
		$(this).children('button span').removeClass('glyphicon-minus').addClass('glyphicon-plus');
		console.log("icon change");
		var $errorItem = $(this).parent();
		console.log("Parent", $errorItem);
		if ($errorItem.parent().find('.errorSummary').is(':visible')) {
			$errorItem.parent().find('.errorSummary').slideUp(function() {
				$errorItem.children('button span').removeClass('glyphicon-minus').addClass('glyphicon-plus');
				setTimeout(resizeFrame, 200);
				//resizeFrame();
			});
		}
		else {
			$(this).children('button span').removeClass('glyphicon-plus').addClass('glyphicon-minus');
			$errorItem.parent().find('.errorSummary').slideDown(function(){
				resizeFrame();
			});
		}
	});
	// END result panel collapsing

	// view error source
	$doc.on('click', '.viewError', function(e) {
		var errorId = e.target.dataset.error;
		var $error = $('#'+errorId);

		$(this).addClass('hidden');
		$error.find('div.more-info').removeClass('hidden');
		$error.find('a.closeError').first().focus();
		resizeFrame();
	});
	// END view error source

	// close error source
	$doc.on('click', '.closeError', function(e) {
		var errorId = e.target.dataset.error;
		var $error = $('#'+errorId);

		$error.find('div.more-info').addClass('hidden');
		$error.find('a.viewError').removeClass('hidden');
		$error.find('a.viewError').focus();
		resizeFrame();
	});
	// END close error source

	//view warning info
	$doc.on('click', '.view-warning', function(e){
		if($(this).data('clicked')){
			$(this).data('clicked', false);
			$(this).parent().find('.warning-info').addClass('hidden');
		} else {
			$(this).data('clicked', true);
			$(this).parent().find('.warning-info').removeClass('hidden');
		}
		resizeFrame();
	})
	// END view warning info

	// print button
	$doc.on('click', '#print', function() {
		window.print();
		return false;
	});
	// END print button

	// tooltip on cached reports
	$doc.on('mouseover', '#cached button.fix-this', function(e) {

		var msg = e.target.parentElement.querySelector('.toolmessage');
		$(msg).stop().fadeIn().css('display','inline-block');
	});

	// tooltip on cached reports
	$doc.on('mouseout', '#cached button.fix-this', function() {
		var msg = event.target.parentElement.querySelector('.toolmessage');
		$(msg).stop().fadeOut();
	});

	// the "U FIX IT" button
	$doc.on('click', '#scanner button.fix-this', function() {
		var $this = $(this)
		var $issueContainer = $this.parent().parent();

		$this.hide();

		var $contentForm = $issueContainer.find('form');

		if ($contentForm.is(':visible')) {
			$contentForm.removeClass('show');
			$contentForm.addClass('hidden');
		}
		else {
			$contentForm.removeClass('hidden');
			$contentForm.addClass('show');
		}

		switch ( $this.val() ) {
			case 'cssTextHasContrast':
				ufixitCssTextHasContrast( $issueContainer );
				break;

			case 'cssTextStyleEmphasize':
				ufixitCssTextStyleEmphasize( $issueContainer );
				break;

			default:
				break;
		}
		resizeFrame();
	});

	// resize after bootstrap tabs are finished showing
	$('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
		resizeFrame();
	});
	
	// submitting the ufixit form
	$doc.on('submit', '#scanner .ufixit-form', function(e) {
		e.preventDefault();

		var valid = true;
		var type = $(this).find('input[name="errortype"]').val();
		var removeHeading = $(this).find('.remove-heading').is(':checked');
		var removeLink = $(this).find('.remove-link').is(':checked');

		if (type == "headersHaveText" && !removeHeading) {
			var $input = $(this).find('input[name="newcontent"]');
			if ($input.val().trim() == ''){
				valid = false;
			}
		}

		if (type == "imgAltIsDifferent" || type == "imgAltIsTooLong" || type == "imgHasAlt" || type == "imgNonDecorativeHasAlt") {
			var $input = $(this).find('input[name="newcontent"]');
			var $imgSrc = $(this).find('input[name="errorhtml"]');
			if ($input.val().trim() == ''){
				valid = false;
			} else if ($imgSrc.val().indexOf($input.val().trim()) >= 0) {
				valid = false;
			} else if ($input.val().match(/jpg|JPG|png|PNG|gif|GIF|jpeg|JPEG$/)) {
				valid = false;
			}
		}

		if ((type == "aMustContainText" || type == "aSuspiciousLinkText" || type == "aLinkTextDoesNotBeginWithRedundantWord") && !removeLink) {
			var $input = $(this).find('input[name="newcontent"]');
			var $aSrc = $(this).find('input[name="errorhtml"]');
			if ($input.val().trim() == ''){
				valid = false;
			} else if ($aSrc.val().indexOf($input.val().trim()) >= 0) {
				valid = false;
			} else if ($input.val().trim().toLowerCase().match(/^(go to|link to|go here|link|click here|click|more|here)$/)) {
				valid = false;
			}
		}

		if (valid == true){

			var vmsg = e.target.parentElement.querySelector('.validmessage');
			$(vmsg).stop().fadeOut();

			// Change button text from 'Submit' to 'Working'
			var $submit = $(this).find('button.submit-content');
			var $parent = $(this).parent();
			var values = $(this).serializeArray();
			var errorsRemaining = -1;

			if ( $submit.html() === '<div class="circle-black"></div> Waiting for UFIXIT to Finish' ) {
				return;
			}

			$submit.removeClass('inactive');
			$submit.prop('disabled',true);
			$submit.html('<div class="circle-black"></div> Working');

			var $targetPanel = $(this).parent().parent().parent().parent().parent().parent().parent();

			var $reportURL = $targetPanel.find('a.report-url');
			var $reportID = $targetPanel.find('input[name="contentid"]');

			var $inactive = $targetPanel.find('button.submit-content.inactive');

			$inactive.each( function() {
				$(this).html('<div class="circle-black"></div> Waiting for UFIXIT to Finish');
			});

			values.push({ name: 'base_url', value: $('input[name="base_url"]').val() });
			values.push({ name: 'course_id', value: $('input[name="session_course_id"]').val() });
			values.push({ name: 'context_label', value: $('input[name="session_context_label"]').val() });
			values.push({ name: 'context_title', value: $('input[name="session_context_title"]').val() });

			$parent.find('.alert').remove();
			resizeFrame();
			$.ajax({
				url: 'process.php',
				type: 'POST',
				data: values,
				success: function(data) {
					if (data == 'Missing content') {
						$parent.append(buildAlertString('Please enter alt text.'));
					} else if (data == 'Incorrect table scope') {
						$parent.append(buildAlertString('You should enter "col" or "row" for th scopes.'));
					} else {
						$parent.removeClass('in');

						$parent.find('input[name="submittingagain"]').val('Yes');

						$parent.find('button').removeClass('hidden');
						$parent.find('.fix-success').removeClass('hidden');
						$parent.find('.viewError').addClass('hidden');
						$parent.find('.more-info').addClass('hidden');
						$parent.find('.ufixit-form').addClass('hidden');


						errorsRemaining = $parent.parent().parent().find('.fix-success.hidden').length;
						if ( errorsRemaining == 0 ) {
							$parent.parent().parent().parent().find('.badge-error').addClass('badge-success');
							$parent.parent().parent().parent().find('h5').removeClass('text-danger').addClass('text-success');
						}
					}

					// Ensure we were looking at a file before we try to parse the file
					// response from the server
					for(var prop in values){
						if(values.hasOwnProperty(prop)){
							if(values[prop].name == "contenttype" && values[prop].value == "files") {
								try {
									var newFile = JSON.parse(data);

									if ( values[1]['value'] == 'files' ) {
										$reportURL.attr('href', newFile.url);

										$reportID.each( function() {
											$(this).attr('value', newFile.id);
										});
									}
								} catch(e){
									try {
										console.log('Failed to parse JSON response during a File based UFIXIT attempt!')
									} catch(e){}
								}
							}
						}
					}

					$submit.addClass('inactive');
					$submit.removeAttr('disabled');
					$submit.html('Submit');

					$inactive.each( function() {
						$(this).html('Submit');
					});
					resizeFrame();
				},
				error: function(data) {
					$parent.append(buildAlertString('Error: '+data.responseText));

					$submit.addClass('inactive');
					$submit.removeAttr('disabled');
					$submit.html('Submit');

					$inactive.each( function() {
						$(this).html('Submit');
					});
					resizeFrame();
				}
			});
		} else {
			var vmsg = e.target.parentElement.querySelector('.validmessage');
			$(vmsg).stop().fadeIn().css('display','inline-block');
			resizeFrame();
		}
	});
	// END submitting the fix-it form

	// counting down the new alt text input
	$doc.on('keyup', '.fix-alt input', function() {
		var left = 100 - $(this).val().length;
		if (left < 0) {
			left = 0;
		}
		$(this).parent().find('.counter').text(left);
	});
	// END counting down the new alt text input

	// clicking a result table row to display the cached report
	$doc.on('click', '#resultsTable tbody tr', function() {
		var main_action = 'cached';
		var reportID = $(this).attr('id');

		$.ajax({
			url: `parseResults.php?report_id=${reportID}`,
			xhrFields: {withCredentials: true},
			error: function(xhr, status, error) {
				$('#resultsTable').fadeOut();
				$('#cached').append('<div id="result">Error Loading Results</div>');
				$('#result').fadeIn();
				resizeFrame();
			},
			success: function(data){
				$('#resultsTable').fadeOut();
				$('#cached').append('<div id="result">'+data+'</div>');
				$('#result').fadeIn(function(){
					resizeFrame();
				});
			}
		});
	});
	// END clicking a result table row to display the cached report

	// clicking the back button on a cached report
	$doc.on('click', '#backToResults', function() {
		$('#resultsTable').fadeIn();
		$('#result').remove();
		resizeFrame();
	});
	// END clicking the back button on a cached report

	// clicking the save pdf button
	$doc.on('click', '#savePdf', function() {

		var $save = $(this);
		$save.find('div.circle-black').removeClass('hidden');
		$save.find('span.glyphicon').fadeOut(200);

		var $result_html = $('#result').clone();
		var context_title = $('input[name="session_context_title"]').val();

		$result_html.find('button').remove();
		$result_html.find('pre').remove();
		$result_html.find('form').remove();
		$result_html.find('.instance').remove();
		$result_html.find('.viewError').remove();
		$result_html.find('.label-success').remove();
		$result_html.find('p:empty').remove();
		$result_html.find('.error-preview').remove();
		$result_html.find('.error-source').remove();
		$result_html.find('.error-desc').prepend('<br>');
		$result_html.find('.error-desc').append('<br><br>');
		$result_html.find('a.list-group-item').after('<br>');
		$result_html.find('.fix-success').remove();

		var $form = $('<form action="parsePdf.php" method="post">' +
			'<input type="hidden" name="result_html" />' +
			'<input type="hidden" name="context_title" value="'+ context_title +'"/>' +
			'</form>');

		$form.find('input[name="result_html"]').val($result_html.html());

		$form.appendTo('body').submit();

		// start parsePdfProgress checker
		clearInterval(progressTimer);
		progressTimer = setInterval(function(){
			$.ajax({
				url: 'parsePdfProgress.php',
				error: function(xhr, status, error) {
					clearInterval(progressTimer);
				},
				success: function(data){
					// update display if progress state has changed
					if (data) {
						clearInterval(progressTimer);
						$save.find('div.circle-black').addClass('hidden');
						$save.find('span.glyphicon').fadeIn(200);
					}
				}
			});
		}, 1000);

	});
	// END clicking the save pdf button

	// clicking the cached reports tab
	$doc.on('click', 'a[href="#cached"]', function() {
		if ($('#result').length > 0) {
			$('#result').remove();
		}

		$.ajax({
			url: 'cached.php',
			xhrFields: {withCredentials: true},
			type: 'GET',
			success: function(data) {
				$('#cached').html(data);
				resizeFrame();
			},
			error: function() {
				$('#cached').append(buildAlertString('Error displaying cached reports.'));
			}
		});
	});
	// END clicking the cached reports tab

	// Rule forces links within "What does UDOIT Look for?" to open in new page
	$('#udoitInfo a').on('click', function() {
		event.preventDefault();

		var url = $(this).attr('href');
		window.open(url, '_blank');
	});
	// END Rule forcing links to open in new window

	// click to remove/fill Heading with no text
	$doc.on('click', '.remove-heading', function (e) {
		var $input = $(e.target).parent().parent().find('input[name="newcontent"]');
		if( $input.attr('placeholder') == 'New heading text') {
			$input.val('');
			$input.attr('maxlength', '0');
			$input.attr('placeholder', 'Empty heading will be deleted');
		} else {
			$input.removeAttr('maxlength');
			$input.attr('placeholder', 'New heading text');
		}
	});
	// END click to remove/fill Heading with no text

	// click to remove/fill Link with no text
	$doc.on('click', '.remove-link', function (e) {
		var $input = $(e.target).parent().parent().find('input[name="newcontent"]');

		if( $input.attr('placeholder') == 'New link text') {
			$input.val('');
			$input.attr('maxlength', '0');
			$input.attr('placeholder', 'Link will be deleted');
		} else {
			$input.removeAttr('maxlength');
			$input.attr('placeholder', 'New link text');
		}
	});
	// END click to remove/fill link with no text

	// updates UFIXIT Preview on change of background color
	$doc.on('change', 'input.back-color', function (e) {
		var $parent = $(e.target).parent().parent().parent();
		var $preview = $parent.find('div.ufixit-preview-canvas');
		var $fore = $parent.find('input.fore-color');
		var $threshold = $parent.find('input.threshold');

		var $error = $parent.find('span.contrast-invalid');
		var $cr = $parent.find('span.contrast-ratio');

		var contrast_ratio = 0;
		var threshold = ($threshold.val() === 'text')? 4.5: 3;
		var bgcolor = $(e.target).val();

		$preview.css('background-color', bgcolor );
		contrast_ratio = contrastRatio(bgcolor, $fore.val());
		$cr.html( contrast_ratio.toFixed(2) );

		if (contrast_ratio < threshold) {
			$error.removeClass('hidden');
			$fore.css('border-color', 'red');
			$fore.css('background-color', $fore.val());
			$parent.parent().find('button.submit-content').prop('disabled',true);
		} else {
			$error.addClass('hidden');
			$fore.css('border-color', '#ccc');
			$fore.css('background-color', $fore.val());
			$parent.parent().find('button.submit-content').removeAttr('disabled');
		}

		$parent.find('li.color').each(function () {
			var color = $(this).attr('value');

			if ( contrastRatio(bgcolor, color) < threshold ) {
				$(this).find('span.invalid-color').removeClass('hidden');
			} else {
				$(this).find('span.invalid-color').addClass('hidden');
			}
		});

	});
	// END update UFIXIT Preview on change of background color

	// updates UFIXIT Preview on change of foreground color
	$doc.on('change', 'input.fore-color', function (e) {
		var $parent = $(e.target).parent().parent().parent();
		var $preview = $parent.find('div.ufixit-preview-canvas');
		var $back = $parent.find('input.back-color');
		var $fore = $parent.find('input.fore-color');
		var $threshold = $parent.find('input.threshold');
		var $error = $parent.find('span.contrast-invalid');
		var $cr = $parent.parent().find('span.contrast-ratio');

		var threshold = ($threshold.val() === 'text')? 4.5: 3;
		var startingColor = $(e.target).val();
		var contrast_ratio = 0;
		var bgcolor = ($back.length > 0 ? $back.val() : '#fff');

		$preview.css('color', startingColor );
		contrast_ratio = contrastRatio( bgcolor, startingColor );
		$cr.html( contrast_ratio.toFixed(2) );

		if (contrast_ratio < threshold) {
			$error.removeClass('hidden');
			$fore.css('border-color', 'red');
			$fore.css('background-color', $fore.val());
			$parent.parent().find('button.submit-content').prop('disabled',true);
		} else {
			$error.addClass('hidden');
			$fore.css('border-color', '#ccc');
			$fore.css('background-color', $fore.val());
			$parent.parent().find('button.submit-content').removeAttr('disabled');
		}

		$parent.find('li.color').each(function () {
			var color = $(this).attr('value');

			if ( contrastRatio(bgcolor, color) < threshold ) {
				$(this).find('span.invalid-color').removeClass('hidden');
			} else {
				$(this).find('span.invalid-color').addClass('hidden');
			}
		});
	});
	// END update UFIXIT Preview on change of foreground color

	// updates UFIXIT Preview on change of foreground color using Color-Picker
	$doc.on('click', 'li.color', function (e) {
		var $this = $(this)
		var $parent = $this.parent().parent().parent().parent();
		var $preview = $parent.find('div.ufixit-preview-canvas');
		var $back = $parent.find('input.back-color');
		var $fore = $parent.find('input.fore-color');
		var $threshold = $parent.find('input.threshold');
		var $error = $parent.find('span.contrast-invalid');
		var $cr = $parent.find('span.contrast-ratio');

		var color = $this.attr('value')
		var threshold = ($threshold.val() === 'text')? 4.5: 3;
		var contrast_ratio = 0;
		var bgcolor = ($back.length > 0 ? $back.val() : '#fff');

		contrast_ratio = contrastRatio( bgcolor, color );
		$cr.html( contrast_ratio.toFixed(2) );

		if (contrast_ratio < threshold) {
			$error.removeClass('hidden');
			$fore.css('border-color', 'red');
			$fore.css('background-color', $fore.val());
			$parent.find('button.submit-content').prop('disabled',true);
		} else {
			$error.addClass('hidden');
			$fore.css('border-color', '#ccc');
			$fore.css('background-color', $fore.val());
			$parent.find('button.submit-content').removeAttr('disabled');
		}

		$preview.css('color', color );
		$fore.val( color );

		$fore.css('background-color', color );
		$fore.css('color', $this.css('color') );

		$parent.find('li.color').each(function () {
			var color = $(this).attr('value');

			if ( contrastRatio(bgcolor, color) < threshold ) {
				$(this).find('span.invalid-color').removeClass('hidden');
			} else {
				$(this).find('span.invalid-color').addClass('hidden');
			}
		});
	});
	// END update UFIXIT Preview on change of foreground color using Color-Picker

	// updates UFIXIT Preview on change of color using lighten and darken buttons
	$doc.on('click', 'a.color-change', function (e) {
		var $parent = $(e.target).parent().parent().parent();
		var $preview = $parent.find('div.ufixit-preview-canvas');
		var $back = $parent.find('input.back-color');
		var $fore = $parent.find('input.fore-color');
		var $threshold = $parent.find('input.threshold');
		var $error = $parent.find('span.contrast-invalid');
		var $cr = $parent.parent().find('span.contrast-ratio');

		var threshold = ($threshold.val() === 'text')? 4.5: 3;
		var startingColor = $(e.target).val();
		var contrast_ratio = 0;
		var bgcolor = ($back.length > 0 ? $back.val() : '#fff');

		$preview.css('color', $fore.val());
		$preview.css('background-color', $back.val());
		contrast_ratio = contrastRatio( $back.val(), $fore.val() );
		$cr.html( contrast_ratio.toFixed(2) );

		if (contrast_ratio < threshold) {
			$error.removeClass('hidden');
			$fore.css('border-color', 'red');
			$fore.css('background-color', $fore.val());
			$back.css('border-color', 'red');
			$back.css('background-color', $back.val());
			$parent.parent().find('button.submit-content').prop('disabled',true);
		} else {
			$error.addClass('hidden');
			$fore.css('border-color', '#ccc');
			$fore.css('background-color', $fore.val());
			$back.css('border-color', '#ccc');
			$back.css('background-color', $back.val());
			$parent.parent().find('button.submit-content').removeAttr('disabled');
		}

		var foreColor = $fore.val().replace("#","");
		var backColor = $back.val().replace("#","");
		var foreRgb = parseRgb(foreColor);
		var backRgb = parseRgb(backColor);
		var foreLuma = foreRgb[0] * 0.2126 + foreRgb[1] * 0.7152 + foreRgb[2] * 0.0722;
		var backLuma = backRgb[0] * 0.2126 + backRgb[1] * 0.7152 + backRgb[2] * 0.0722;
		var foreText = (foreLuma < 100 ? '#ffffff' : '#000000');
		var backText = (backLuma < 100 ? '#ffffff' : '#000000');
		$fore.css('color', foreText);
		$back.css('color', backText);

		$parent.find('li.color').each(function () {
			var color = $(this).attr('value');

			if ( contrastRatio(bgcolor, color) < threshold ) {
				$(this).find('span.invalid-color').removeClass('hidden');
			} else {
				$(this).find('span.invalid-color').addClass('hidden');
			}
		});
	});
	// END update UFIXIT Preview on change of foreground color using lighten and darken buttons

	// updates UFIXIT Preview on change of checkbox for 'bold' styling
	$doc.on('change', 'input[name="add-bold"]', function (e) {
		var $preview = $(e.target).parent().parent().parent().parent().find('div.ufixit-preview-canvas');
		var weight = (e.target.checked ? 'bold' : 'normal');
		$(e.target).val(weight);
		$preview.css('font-weight', weight );
	});
	// END update UFIXIT Preview

	// updates UFIXIT Preview on change of checkbox for 'italic' styling
	$doc.on('change', 'input[name="add-italic"]', function (e) {
		var $preview = $(e.target).parent().parent().parent().parent().find('div.ufixit-preview-canvas');
		var weight = (e.target.checked ? 'italic' : 'normal');
		$(e.target).val(weight);
		$preview.css('font-style', weight );
	});
	// END update UFIXIT Preview

	// updates UFIXIT Preview on change of checkbox for removing color
	$doc.on('change', 'input[name="remove-color"]', function (e) {
		var $preview = $(e.target).parent().parent().parent().find('div.ufixit-preview-canvas');
		var bg = $(e.target).parent().parent().parent().find('input.back-color').val();
		var color = $(e.target).parent().parent().parent().find('input.fore-color').val();
		$(this).val($(this).prop('checked'));
		if ($(this).prop('checked')){
			$preview.css('color', 'black' );
			$preview.css('background-color', 'white' );
		} else {
			$preview.css('color', color );
			$preview.css('background-color', bg );
		}
	});
	// END update UFIXIT Preview

});
