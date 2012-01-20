/* fades the background */
function popUpBack() {
	width = $(document).width()+100;
	height = $(document).height()+100;
	
	$('body').prepend('<div id="popupback"></div>');
	
	$('#popupback').hide();
	$('#popupback').fadeIn(300);
	$('#popupback').width(width);
	$('#popupback').height(height);
}

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
	$('body').prepend('<div id="popup"></div>');
	
	$('#popup').hide();
	// NEED TO MAKE THESE PARAMETERS AS WELL.
	if(callback != undefined) { callback() };
	var leftMarginMinusWidthHalfWay = ($(window).width()/2) - ($('#popup').width()/2);
	var topMarginMinusHeightHalfWay = ($(window).height()/2) - ($('#popup').height()/2);

	$('#popup').css({'left' : leftMarginMinusWidthHalfWay, 'top' : topMarginMinusHeightHalfWay});
	$('#popup').fadeIn(300);
}
function loader(text) {
	console.log(text);
	popUpTemplate(true, function() {
		$('#popup').addClass('loading_popup');
		$('#popup').html('<div class="inline" id="load"><div class="circle"></div><div class="circle1"></div>');	
	});	
}
