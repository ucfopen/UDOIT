function folderLook (folder, currentFolder) {
	if(currentFolder != '') { currentFolder = currentFolder + "/";}
	currentFolder += $(folder).val();
	

	$.post('./?page=tree', { folder :  currentFolder }, function (data) {
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

	$(document).ready(function() {
		$('.folder').change(function() {
			folderLook(this, '');
		});
	});
