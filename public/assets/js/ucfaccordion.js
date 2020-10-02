// Accordion
var ucfAccordionButtons = $('.ucf-accordion h3>a');

function ucfAccordionClickHandler(e) {
	e.preventDefault();
	$control = $(this);

	accordionContent = $control.attr('aria-controls');
	ucfCheckOtherAccordions($control[0]);

	isAriaExp = $control.attr('aria-expanded');
	newAriaExp = (isAriaExp == "false") ? "true" : "false";
	$control.attr('aria-expanded', newAriaExp);

	isAriaHid = $('#' + accordionContent).attr('aria-hidden');
	if (isAriaHid == "true") {
		$('#' + accordionContent).attr('aria-hidden', "false");
		$('#' + accordionContent).css('display', 'block');
	} else {
		$('#' + accordionContent).attr('aria-hidden', "true");
		$('#' + accordionContent).css('display', 'none');
	}

	setTimeout(resizeFrame, 200);
}

function ucfAccordionToggle() {
	$('.ucf-accordion .ucf-accordion-control').on('click', ucfAccordionClickHandler);

	// Allow spacebar to activate the link
	$('.ucf-accordion .ucf-accordion-control').keyup(function(e){
		if( e.which == 32 ){
			e.preventDefault();
			$(this).click();
		}
	});

	// Disable automatic scrolling when spacebar is pressed down
	$('.ucf-accordion .ucf-accordion-control').keydown(function(e){
		if( e.which == 32 ){
			e.preventDefault();
			return false;
		}
	});
};

function ucfCheckOtherAccordions(elem) {
	for (var i=0; i<ucfAccordionButtons.length; i++) {
		if (ucfAccordionButtons[i] != elem) {
			ucfCloseAccordion(i);
		}
	}
};

function ucfCloseAllAccordions() {
	for (var i=0; i<ucfAccordionButtons.length; i++) {
		ucfCloseAccordion(i);
	}
}

function ucfCloseAccordion(accordionIndex) {
	if (($(ucfAccordionButtons[accordionIndex]).attr('aria-expanded')) == 'true') {
		$(ucfAccordionButtons[accordionIndex]).attr('aria-expanded', 'false');
		content = $(ucfAccordionButtons[accordionIndex]).attr('aria-controls');
		$('#' + content).attr('aria-hidden', 'true');
		$('#' + content).css('display', 'none');
	}
}

function ucfOpenAccordion(accordionIndex) {
	if ( ($(ucfAccordionButtons[accordionIndex]).attr('aria-expanded')) != 'true' ) {
		$(ucfAccordionButtons[accordionIndex]).click();
	}
}

// All code that needs to run when the window is completely done loading should go here
window.addEventListener('load', accordionWindowLoadedCallback);
function accordionWindowLoadedCallback(evt){
	// Initialize accordions if they exist
	ucfAccordionButtons = $('.ucf-accordion h3>a');
	ucfAccordionToggle();

	// Open the first accordion by default
	ucfOpenAccordion(0);
}
