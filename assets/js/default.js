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
