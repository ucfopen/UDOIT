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
		$('#popup').html('<div class="circle"></div>');
	});
}

/* Builds up the results and adds them to the page */
function checker() {
	var main_action = $('input[name="main_action"]').val();
	var content = $('.content:not(#allContent):checked').map(function(i,n) {
		return $(n).val();
	}).get();

	if(content.length === 0) {
		content = "none";
	}

	$.ajax({
		url: "./lib/process.php",
		type: "POST",
		data: {
			main_action: main_action,
			content: content
		},
		success: function(data){
			$('#scanner').append('<section id="result">'+data+'</section>');
			killButton(function() {
				$('#result').fadeIn();
			});

			jscolor.bind();
		},
		error: function(){
			killButton();
			$('#failMsg').fadeIn();
		}
	});
}

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

		var timer = setInterval(function(){
			$.ajax({
				url: 'lib/progress.php',
				success: function(data){
					if(data != old) {
						if(data == 'announcements') {
							$('#submit').html('<div id="popup"><div class="circle"></div></div> Scanning announcements...');
						}
						if(data == 'assignments') {
							$('#submit').html('<div id="popup"><div class="circle"></div></div> Scanning assignments...');
						}
						if(data == 'discussions') {
							$('#submit').html('<div id="popup"><div class="circle"></div></div> Scanning discussions...');
						}
						if(data == 'files') {
							$('#submit').html('<div id="popup"><div class="circle"></div></div> Scanning files...');
						}
						if(data == 'pages') {
							$('#submit').html('<div id="popup"><div class="circle"></div></div> Scanning pages...');
						}
						if(data == 'done') {
							clearInterval(timer);
						}
						old = data;
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
		$(this).parent().parent().find('pre').removeClass('hidden');
	});
	// END view error source

	// print button
	$(document).on("click", "#print", function() {
		window.print();
		return false;
	});
	// END print button

	// the "U FIX IT" button
	$(document).on("click", ".fix-this", function() {
		var parent = $(this).parent();
		$(this).remove();

		var contentForm = parent.find('form');

		if (contentForm.is(':visible')) {
			parent.find('form').removeClass('show');
			parent.find('form').addClass('hidden');
		}
		else {
			parent.find('form').removeClass('hidden');
			parent.find('form').addClass('show');
		}
	});
	// END the "U FIX IT" button

	// submitting the fix-it form
	$(document).on("submit", ".ufixit-form", function(e) {
		e.preventDefault();

		var parent = $(this).parent();
		var values = $(this).serialize();

		parent.find('.alert').remove();
		$.ajax({
			url: "./lib/process.php",
			type: "POST",
			data: values,
			success: function(data) {
				if (data == "Missing content") {
					parent.append('<div class="alert alert-danger well-sm no-margin margin-top"><span class="glyphicon glyphicon-ban-circle"></span> Please enter alt text.</div>');
				} else if (data == "Incorrect table scope") {
					parent.append('<div class="alert alert-danger well-sm no-margin margin-top"><span class="glyphicon glyphicon-ban-circle"></span> You must enter "col" or "row" for th scopes.</div>');
				} else {
					parent.removeClass('in');
					parent.find('input[name="submittingagain"]').val('Yes');
					parent.parent().find('button').removeClass('hidden');
					parent.parent().find('h5').removeClass('text-danger').addClass('text-success');
					parent.parent().find('.label').removeClass('hidden');
				}
			},
			error: function() {
				parent.append('<div class="alert alert-danger no-margin margin-top"><span class="glyphicon glyphicon-ban-circle"></span> The was an error sending your request.</div>');
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
		var json_file   = $(this).find('.file-path').html();

		$.post("./lib/parseResults.php", { main_action: main_action, path: json_file }, function(data) {
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
		var result_html = $('#result').clone();

		result_html.find('button').remove();
		result_html.find('pre').remove();
		result_html.find('form').remove();
		result_html.find('.viewError').remove();
		result_html.find('.label-success').remove();
		result_html.find('p:empty').remove();
		result_html.find('.error-desc').prepend('<br>');
		result_html.find('.error-desc').append('<br><br>');
		result_html.find('a.list-group-item').after('<br>');

		var form = $('<form action="./lib/parsePdf.php" method="post">' +
		  '<input type="text" name="result_html" value="' + encodeURI(result_html.html()) + '" />' +
		  '</form>');
		$(form).submit();
	});
	// END clicking the save pdf button

	// clicking the cached reports tab
	$(document).on("click", "a[href='#cached']", function() {
		if ($('#result').length > 0) {
			$('#result').remove();
		}

		$.ajax({
			url: "./lib/cached.php",
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
});