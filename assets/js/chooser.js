var LIMIT = 500;
var WARN = 250;

/* Formates the results when clicking on an item (slidedown and plus) */
function resultSetup() {
	$('.errorItem .panel-heading').click(function() {
		var errorItem = $(this).parent();
		console.log($(this).parent().find('.errorSummary'));
		if ($(this).parent().find('.errorSummary').is(':visible')) {
			$(this).parent().find('.errorSummary').slideUp(function() {errorItem.children('button span').removeClass('glyphicon-minus').addClass('glyphicon-plus');});
		}
		else {
			errorItem.children('button span').removeClass('glyphicon-plus').addClass('glyphicon-minus');
			$(this).parent().find('.errorSummary').slideDown();
		}
	});
	$('#print').click(function() {
		window.print();
		return false;
	});
	$('.delete_h5').click(function(e)
	{
		e.preventDefault();
		$(this).closest('.list').remove();
	});
	$('.delete_li').click(function(e)
	{
		e.preventDefault();
		$(this).parent().remove();
	});
	$('.delete_parent').click(function(e)
	{
		e.preventDefault();
		var element = $(this).parent().parent();
		console.log(element);
		var part = $(element).prev().attr('class');
		var counter = $(element).closest('.errorSummary').prev().prev().find('.'+part+'Count')
		$(counter).html(parseInt($(counter).html())-1);

		$(element).prev().remove();
		$(element).next().remove();
		var parentStuff = $(element).parent();
		$(element).remove();
		if($(parentStuff).hasClass('list'))
		{
			if($(parentStuff).children().length == 0)
			{
				var fileItem = $(parentStuff).parent();
				$(parentStuff).prev().remove();
				$(parentStuff).remove();
				if($(fileItem).children().length == 0)
				{
					$(fileItem).prev().prev().remove();
					$(fileItem).prev().remove();
					$(fileItem).remove();
				}
			}
		}
	});
	$('.delete_result').click(function(e)
	{
		e.preventDefault();
		var element = $(this).parent().parent();
		$(element).remove();
	});
}

/* Builds up the results and adds them to the page */
function checker(folderList) {
	var content = $('.content:checked').map(function(i,n) {
		return $(n).val();
	}).get();

	if(content.length == 0) { 
		content = "none"; 
	}
	
	$.post('./?page=checker', { course: $('#courseSelect').text(), id: $('#courseSelect').val(), content: content }, function(data) {
		$('#contentWrapper').append('<div id="result">'+data+'</div>');
		console.log(data);
		resultSetup();
			killButton(function() {
				$('#result').fadeIn(function() {
			});
		});
	});
}
$(document).ready(function() {
	var checked = false;
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
		loader();
		var folderList = new Array();
		
		$('.folder').each(function() { 
				folderList.push($(this).val()); 
		});
		$.post('./?page=finalCheck', { folder : folderList}, function(amount) {
			if(amount > LIMIT)
			{
				killButton(function() {
					popUpTemplate(true, function() {
						$('#popup').html('<div id="tooMany"><p>You are trying to test '+amount+' files for accessibility.</p><p>This tool can only check '+LIMIT+' files at one time.</p><p><button id="ok">Okay</button></p></div>');
						$('#ok').click(function() { 
							killButton(); 
						});
					});
				});

			}
			else if(amount > WARN)
			{
				killButton(function() {
					popUpTemplate(true, function() {
						$('#popup').html('<div id="tooMany"><p>It seems like there\'s '+amount+' files you are attempting to test for accessibility.</p><p>This might take an extremely long time</p><p>Are you SURE you want to continue?</p><p><button id="continue">Yes</button><button id="stop">No</button></p></div>');
						$('#stop').click(function() { 
							killButton(); 
						});
						$('#continue').click(function() { 
							killButton(function() {
								loader();
								checker(folderList);
							});
						});
					});
				});
			}
			else 
			{
				checker(folderList);
			}
		});
		return false;
	});
});
