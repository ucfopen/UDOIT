/* Formats the results when clicking on an item (slidedown and plus) */
function resultSetup() {
	$('.errorItem .panel-heading .btn-toggle').click(function() {
		$(this).children('button span').removeClass('glyphicon-minus').addClass('glyphicon-plus');
		var errorItem = $(this).parent();
		if ($(this).parent().parent().find('.errorSummary').is(':visible')) {
			$(this).parent().parent().find('.errorSummary').slideUp(function() {errorItem.children('button span').removeClass('glyphicon-minus').addClass('glyphicon-plus');});
		}
		else {
			$(this).children('button span').removeClass('glyphicon-plus').addClass('glyphicon-minus');
			$(this).parent().parent().find('.errorSummary').slideDown();
		}
	});

	$('#print').click(function() {
		window.print();
		return false;
	});
}

/* Builds up the results and adds them to the page */
function checker(timer) {
	var content = $('.content:not(#allContent):checked').map(function(i,n) {
		return $(n).val();
	}).get();

	if(content.length === 0) {
		content = "none";
	}

	$.post('./app/checker.php', { content: content }, function(data) {
		$('#contentWrapper').append('<section id="result">'+data+'</section>');
		resultSetup();
		killButton(function() {
			$('#result').fadeIn(function() {});
		});
	});
}

$(document).ready(function() {
	var checked = true;

	$('#allContent').click(function() {
		if(checked) {
			$(this).parent().parent().parent().find('.content:not(#allContent)').attr('checked', false);
			checked = false;
		}
		else {
			$(this).parent().parent().parent().find('.content:not(#allContent)').attr('checked', true);
			checked = true;
		}
	});

	$('.content:not(#allContent)').click(function() {
		$('#allContent').attr('checked', false);
		checked = false;
	});

	$('#submit').click(function() {
		if($('#result').length > 0) { $('#result').remove(); }

		$('#waitMsg').fadeIn();

		loader();

		var old = 0;

		var timer = setInterval(function(){
			$.ajax({
				url: 'app/progress.php',
				success: function(data){
					if(data != old) {
						if(data == 1) {
							$('#submit').html('<div id="popup"><div class="circle"></div></div> Scanning announcements...');
						}
						if(data == 2) {
							$('#submit').html('<div id="popup"><div class="circle"></div></div> Scanning assignments...');
						}
						if(data == 3) {
							$('#submit').html('<div id="popup"><div class="circle"></div></div> Scanning discussions...');
						}
						if(data == 4) {
							$('#submit').html('<div id="popup"><div class="circle"></div></div> Scanning files...');
						}
						if(data == 5) {
							$('#submit').html('<div id="popup"><div class="circle"></div></div> Scanning pages...');
						}
						if(data == 'done') {
							clearInterval(timer);
						}
						old = data;
						console.log(old);
					}
				}
			});
		}, 500);

		checker();

		return false;
	});
});
