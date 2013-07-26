// Hides and shows results
$(document).ready(function() {
	$('h3').next().hide();
	$('h3').click(function() {
		var h3 = $(this)
		if ($(this).next().is(':visible')) {
			$(this).next().slideUp(function() {h3.removeClass('minus').addClass('plus');});
		}
		else {
			h3.removeClass('plus').addClass('minus');
			$(this).next().slideDown();
		}
	});
	
});