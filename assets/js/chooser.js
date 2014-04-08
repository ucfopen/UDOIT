var LIMIT = 500;
var WARN = 250;

/* Looks through the specifed folder and gets subfolders */
function folderLook(folder, currentFolder) {
	loader();
	var ignored = new Array();
	var ignoreFind = $('.ignore');
	for(x=0; x<$(ignoreFind).length; x++) {
		var value = $(ignoreFind[x]).val();
		if(value != '') {
			ignored.push(value);
		}
	}
	ignored = ignored.join(",");
	if(currentFolder != '') { currentFolder = currentFolder + "/";}
	currentFolder += $(folder).val();
	var ignoreList = new Array();

	$('input[type=checkbox].ignore').each(function() {
		if($(this).is(':checked')) {
			ignoreList.push($(this).val());
		}
	});
	$('input[type=text].ignore').each(function() {
		ignoreList.push($(this).val());
	});

	$.post('./?page=tree', { folder :  currentFolder, ignore : ignoreList}, function (data) {
		killButton(function() {
			var childrenFolder = false;
			var theClone = $(folder).clone();
			$(theClone).html('');
			$(theClone).append("<option value='default'></option>");
			for(i in data) {
				if(data[i] != '' ) { 
					childrenFolder = true;
					$(theClone).append("<option value='"+data[i]+"'>"+data[i]+"</option>");
				}
			}	
			$(theClone).change(function() {folderLook(this, currentFolder);});
			while($(folder).next().is('select')) {
				$(folder).next().remove();
			}
			if(childrenFolder) {
				$(folder).after(theClone);
			}
		});
	}, 'json');
}
/* Formates the results when clicking on an item (slidedown and plus) */
function resultSetup() {
	$('.errorItem').click(function() {
		var errorItem = $(this)
		if ($(this).next().next().is(':visible')) {
			$(this).next().next().slideUp(function() {errorItem.children('h3').removeClass('minus').addClass('plus');});
		}
		else {
			errorItem.children('h3').removeClass('plus').addClass('minus');
			$(this).next().next().slideDown();
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

}

/* adds item to ignore list */
function addInput(element) {
	var parentElement = $(element).parent();
	var inputValue = $(parentElement).children('input').val();
	var cloned = $(parentElement).clone();
	$(cloned).children('input').val('');
	$(cloned).children('a').click(function() { addInput(this); return false;});
	$(parentElement).html('<input type="checkbox" name="ignore[]" class="ignore" value="'+inputValue+'" checked="checked" />'+inputValue);
	$(parentElement).after(cloned);
	$(element).remove();
}
/* Builds up the results and adds them to the page */
function checker(folderList, ignoreList) {
	$.post('./?page=checker', { folder : folderList, ignore : ignoreList}, function(data) {
		$('#bodyWrapper').append('<div id="result">'+data+'</div>');
		resultSetup();
			killButton(function() {
				$('#result').fadeIn(function() {
			});
		});
	});
}
$(document).ready(function() {
	$('.folder').change(function() {
		folderLook(this, '');
	});
	$('.add').click(function() { addInput(this); return false;})
	$('#submit').click(function() {
		if($('#result').length > 0) { $('#result').remove(); }
		loader();
		var folderList = new Array();
		var ignoreList = new Array();
		
		$('.folder').each(function() { 
				folderList.push($(this).val()); 
		});
		$('input[type=checkbox].ignore').each(function() {
			if($(this).is(':checked')) {
				ignoreList.push($(this).val());
			}
		});
		$('input[type=input].ignore').each(function() {
			ignoreList.push($(this).val());
		});
		$.post('./?page=finalCheck', { folder : folderList, ignore : ignoreList}, function(amount) {
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
								checker(folderList, ignoreList);
							});
						});
					});
				});
			}
			else 
			{
				checker(folderList, ignoreList);
			}
		});
		return false;
	});
});
