function folderLook (folder, currentFolder) {
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
	}, 'json');
}
function resultSetup() {
	$('.errorItem').next().hide();
	$('.errorItem').click(function() {
		var errorItem = $(this)
		if ($(this).next().is(':visible')) {
			$(this).next().slideUp(function() {errorItem.children('h3').removeClass('minus').addClass('plus');});
		}
		else {
			errorItem.children('h3').removeClass('plus').addClass('minus');
			$(this).next().slideDown();
		}
	});
}
function addInput(element) {
	var parentElement = $(element).parent();
	var cloned = $(parentElement).clone();
	$(cloned).children('input').val('');
	$(cloned).children('a').click(function() { addInput(this); return false;});
	$(element).remove();
	$(parentElement).after(cloned);
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
		$.post('./?page=checker', { folder : folderList, ignore : ignoreList}, function(data) {
			$('#bodyWrapper').append('<div id="result">'+data+'</div>');
			resultSetup();
			$('#result').fadeIn(function() {
				killButton();
			});
		});
		return false;
	});
});
