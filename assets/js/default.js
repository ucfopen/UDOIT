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

	if (content.length === 0) {
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
		error: function(data){
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
		$(this).parent().parent().find('div.more-info').removeClass('hidden');
	});
	// END view error source

	// close error source
	$(document).on("click", ".closeError", function() {
		$(this).parent().parent().parent().find('a.viewError').removeClass('hidden');
		$(this).parent().parent().parent().find('div.more-info').addClass('hidden');
	});
	// END close error source

	// print button
	$(document).on("click", "#print", function() {
		window.print();
		return false;
	});
	// END print button

	// the "U FIX IT" button ((on scanner))
	$(document).on("click", "#scanner button.fix-this", function() {
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
	});

	$(document).on("mouseover", "#cached button.fix-this", function() {	
		$('.toolmessage').fadeIn().css("display","inline-block");
	});

	$(document).on("mouseout", "#cached button.fix-this", function() {
		$('.toolmessage').fadeOut();
	});

	// END the "U FIX IT" button

	// submitting the ufixit form
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
					parent.append('<div class="alert alert-danger well-sm no-margin margin-top"><span class="glyphicon glyphicon-ban-circle"></span> You should enter "col" or "row" for th scopes.</div>');
				} else {
					parent.removeClass('in');
					parent.find('input[name="submittingagain"]').val('Yes');
					parent.parent().find('button').removeClass('hidden');
					parent.parent().find('h5').removeClass('text-danger').addClass('text-success');
					parent.parent().find('.label').removeClass('hidden');
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

		$.post("./lib/parseResults.php", { main_action: main_action, cached_id: cached_id }, function(data) {
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
		result_html.find('.error-preview').remove();
		result_html.find('.error-source').remove();
		result_html.find('.error-desc').prepend('<br>');
		result_html.find('.error-desc').append('<br><br>');
		result_html.find('a.list-group-item').after('<br>');

		var form = $('<form action="./lib/parsePdf.php" method="post">' +
		  '<input type="text" name="result_html" />' +
		  '</form>');

		$(form).find('input[name="result_html"]').val(result_html.html());

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
		console.log(e.target);
		console.log( $(e.target).parent() );
		console.log( $(e.target).parent().parent() );
		if( input.attr("placeholder") == "New link text") {
			input.val("");
			input.attr("maxlength", "0");
			input.attr("placeholder", "Empty link will be deleted");
		} else {
			input.removeAttr("maxlength");
			input.attr("placeholder", "New link text");
		}
	});
	// END click to remove/fill link with no text

	// updates UFIXIT Preview on load
	$(document).on("click", ".load-preview", function (e) {
		var back = $(e.target).parent().find('input.back-color');
		var fore = $(e.target).parent().find('input.fore-color');
		var bgcolor = "#fff";

		if (back.length !== 0) {
			bgcolor = $(back).val();
		}

		var preview = $(e.target).parent().find('div.ufixit-preview-canvas');

		preview.attr("style", "color: " + $(fore).val() + "; background-color: " + bgcolor + ";" );

		$(e.target).parent().find("li.color").each(function () {
			console.log( $(this).text() );
			var color = $(this).text();
			$(this).css("background-color", color);

			//if the swatch color is too dark
			//change font color to something lighter 
			var c = color.substring(1); // strip #
			var rgb = parseInt(c, 16); // convert rrggbb to decimal
			var r = (rgb >> 16) & 0xff; // extract red
			var g = (rgb >> 8) & 0xff; // extract green
			var b = (rgb >> 0) & 0xff; // extract blue

			var luma = 0.2126 * r + 0.7152 * g + 0.0722 * b; // per ITU-R BT.709

			if (luma < 85) {
				$(this).css("color", "#ffffff");
			}
		});
	});
	// END update UFIXIT Preview on load

	// updates UFIXIT Preview on change of background color
	$(document).on("change", "input.back-color", function (e) {
		var preview = $(e.target).parent().parent().parent().find('div.ufixit-preview-canvas');
		preview.css("background-color", $(e.target).val() );

	});
	// END update UFIXIT Preview on change of background color

	// updates UFIXIT Preview on change of foreground color
	$(document).on("change", "input.fore-color", function (e) {
		var preview = $(e.target).parent().parent().parent().find('div.ufixit-preview-canvas');
		preview.css("color", $(e.target).val() );

	});
	// END update UFIXIT Preview on change of foreground color

	// updates UFIXIT Preview on change of foreground color using Color-Picker
	$(document).on("click", "li.color", function (e) {
		var preview = $(e.target).parent().parent().parent().parent().find('div.ufixit-preview-canvas');
		var fore = $(e.target).parent().parent().parent().parent().find('input.fore-color');
		
		preview.css("color", $(e.target).text() );
		$(fore).val( $(e.target).text() );
		$(fore).css("background-color", $(e.target).text() );
	});
	// END update UFIXIT Preview on change of foreground color using Color-Picker
});