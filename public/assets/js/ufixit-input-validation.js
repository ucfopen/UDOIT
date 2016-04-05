/**
*	Copyright (C) 2014 University of Central Florida, created by Jacob Bates, Eric Colon, Fenel Joseph, and Emily Sachs.
*
*	This program is free software: you can redistribute it and/or modify
*	it under the terms of the GNU General Public License as published by
*	the Free Software Foundation, either version 3 of the License, or
*	(at your option) any later version.
*
*	This program is distributed in the hope that it will be useful,
*	but WITHOUT ANY WARRANTY; without even the implied warranty of
*	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
*	GNU General Public License for more details.
*
*	You should have received a copy of the GNU General Public License
*	along with this program.  If not, see <http://www.gnu.org/licenses/>.
*
*	Primary Author Contact:  Jacob Bates <jacob.bates@ucf.edu>
*/

//-------------------------- UFIXIT Form Validation --------------------------//

$(document).ready(function() {

	// Validates input on change of the following UFIXIT Form Element:
	// Input Type: Select
	$(document).on("change", "select.form-control", function (e) {
		var errorType = $(e.target).parent().parent().find("input[name='errortype']");
		var submitButton = $(e.target).parent().find("button.submit-content");

		switch ( $(errorType).val() ) {

			case "tableDataShouldHaveTh":
			case "tableThShouldHaveScope":
				if ( $(e.target).val() == "" ) {
					$(submitButton).prop('disabled',true);

					$(e.target).css({"border-color": "red"});
					break;
				}

				$(e.target).attr('style','');
				$(submitButton).removeAttr('disabled');
				break;

			default:
				break;
		}
	});

	//------------------------- Input Type: Checkbox -------------------------//

	// updates UFIXIT Preview on change of checkbox for 'bold' styling
	$(document).on("change", "input[name='add-bold']", function (e) {
		var preview = $(e.target).parent().parent().parent().find('div.ufixit-preview-canvas');
		var errorType = $(e.target).parent().parent().parent().find("input[name='errortype']");
		var addItalic = $(e.target).parent().parent().find("input[name='add-italic']");
		var submitButton = $(e.target).parent().parent().parent().find("button.submit-content");
		var checkBoxes = $(e.target).parent().parent().parent().find("div.left");

		if ( typeof $(errorType).val() == 'undefined' ) {
			preview = $(e.target).parent().parent().parent().parent().find('div.ufixit-preview-canvas');
			errorType = $(e.target).parent().parent().parent().parent().parent().find("input[name='errortype']");
			submitButton = $(e.target).parent().parent().parent().parent().parent().find("button.submit-content");
		}

		if( e.target.checked ) {
			preview.css("font-weight", "bold");

			if ( $(errorType).val() === "cssTextStyleEmphasize" ) {
				$(submitButton).removeAttr('disabled');
				$(checkBoxes).attr('style', '');
			}
				
		} else {
			preview.css("font-weight", "normal");

			if ( $(errorType).val() === "cssTextStyleEmphasize" )
				if ( !$(addItalic).is(':checked') ) {
					$(submitButton).prop('disabled',true);
					$(checkBoxes).attr("style", "background-color: rgba(255, 0, 0, .05); border: 1px solid red; padding: 4px;");
				}
					
		}
	});

	// updates UFIXIT Preview on change of checkbox for 'italic' styling
	$(document).on("change", "input[name='add-italic']", function (e) {
		var preview = $(e.target).parent().parent().parent().find('div.ufixit-preview-canvas');
		var errorType = $(e.target).parent().parent().parent().find("input[name='errortype']");
		var addBold = $(e.target).parent().parent().find("input[name='add-bold']");
		var submitButton = $(e.target).parent().parent().parent().find("button.submit-content");
		var checkBoxes = $(e.target).parent().parent().parent().find("div.left");

		if ( typeof $(errorType).val() == 'undefined' ) {
			preview = $(e.target).parent().parent().parent().parent().find('div.ufixit-preview-canvas');
			errorType = $(e.target).parent().parent().parent().parent().parent().find("input[name='errortype']");
			submitButton = $(e.target).parent().parent().parent().parent().parent().find("button.submit-content");
		}

		if( e.target.checked ) {
			preview.css("font-style", "italic");

			if ( $(errorType).val() === "cssTextStyleEmphasize" ) {
				$(submitButton).removeAttr('disabled');
				$(checkBoxes).attr('style', '');
			}
				
		} else {
			preview.css("font-style", "normal");

			if ( $(errorType).val() === "cssTextStyleEmphasize" )
				if ( !$(addBold).is(':checked') ) {
					$(submitButton).prop('disabled',true);
					$(checkBoxes).attr("style", "background-color: rgba(255, 0, 0, .05); border: 1px solid red; padding: 4px;");
				}
		}
	});

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

	// click to remove/fill Link with no text
	$(document).on("click", ".remove-link", function (e) {
		var input = $(e.target).parent().parent().find('input[name="newcontent"]');

		if( input.attr("placeholder") == "New link text") {
			input.val("");
			input.attr("maxlength", "0");
			input.attr("placeholder", "Link will be deleted");
		} else {
			input.removeAttr("maxlength");
			input.attr("placeholder", "New link text");
		}
	});

	// Validates input on change of the following UFIXIT Form Element:
	// Input Type: Text
	$(document).on("change keyup", "input[type='text'].form-control", function (e) {
		var errorType = $(e.target).parent().parent().find("input[name='errortype']");

		switch ( $(errorType).val() ) {
			/* Erros */
			case "headersHaveText":
				console.log($(errorType).val() + ': ' + $(e.target).val() + '\n');
				break;

			case "imgAltIsDifferent":
			case "imgAltIsTooLong":
			case "imgHasAlt":
			case "imgNonDecorativeHasAlt":
				console.log($(errorType).val() + ': ' + $(e.target).val() + '\n');
				break;

			/* Suggestions */
			case "aLinkTextDoesNotBeginWithRedundantWord":
			case "aMustContainText":
			case "aSuspiciousLinkText":
				console.log($(errorType).val() + ': ' + $(e.target).val() + '\n');
				break;

			default:
				break;
		}
	});

	// updates UFIXIT Preview and validates input on change of foreground color
	$(document).on("change", "input.fore-color", function (e) {
		console.log('inpu');
		var preview = $(e.target).parent().parent().parent().find('div.ufixit-preview-canvas');
		preview.css("color", $(e.target).val() );

		var back = $(e.target).parent().parent().parent().find('input.back-color');
		var fore = $(e.target).parent().parent().parent().find('input.fore-color');
		var text_type = $(e.target).parent().parent().parent().find('input.threshold');
		var error = $(e.target).parent().parent().parent().find('span.contrast-invalid');
		var cr = $(e.target).parent().parent().parent().parent().find('span.contrast-ratio');
		var contrast_ratio = 0;
		var bgcolor = "#fff";

		if ( $(back).length > 0 ) {
			bgcolor = $(back).val();
		}

		var threshold = (text_type.attr('value') === 'text')? 4.5: 3;

		contrast_ratio = contrastRatio( bgcolor, $(e.target).val() );
		$(cr).html( contrast_ratio.toFixed(2) );

		if (contrast_ratio < threshold) {
			$(error).removeClass('hidden');
			fore.attr('style','border-color: red;');
			$(e.target).parent().parent().parent().find('button.submit-content').prop('disabled',true);
		} else {
			$(error).addClass('hidden');
			fore.attr('style','');
			$(e.target).parent().parent().parent().find('button.submit-content').removeAttr('disabled');
		}

		$(e.target).parent().parent().parent().find("li.color").each(function () {
			var color = $(this).attr("value");

			if ( contrastRatio(bgcolor, color) < threshold ) {
				$(this).find('span.invalid-color').removeClass('hidden');
			} else {
				$(this).find('span.invalid-color').addClass('hidden');
			}
		});
	});

	// updates UFIXIT Preview and validates input on change of background color
	$(document).on("change", "input.back-color", function (e) {
		var preview = $(e.target).parent().parent().parent().find('div.ufixit-preview-canvas');
		var fore = $(e.target).parent().parent().parent().find('input.fore-color');
		var text_type = $(e.target).parent().parent().parent().find('input.threshold');
		preview.css("background-color", $(e.target).val() );

		var error = $(e.target).parent().parent().parent().find('span.contrast-invalid');
		var cr = $(e.target).parent().parent().parent().find('span.contrast-ratio');
		var contrast_ratio = 0;

		var threshold = (text_type.attr('value') === 'text')? 4.5: 3;
		var bgcolor = $(e.target).val();

		contrast_ratio = contrastRatio( $(e.target).val(), $(fore).val() );
		$(cr).html( contrast_ratio.toFixed(2) );

		if (contrast_ratio < threshold) {
			$(error).removeClass('hidden');
			fore.attr('style','border-color: red;');
			$(e.target).parent().parent().parent().find('button.submit-content').prop('disabled',true);
		} else {
			$(error).addClass('hidden');
			fore.attr('style','');
			$(e.target).parent().parent().parent().find('button.submit-content').removeAttr('disabled');
		}

		$(e.target).parent().parent().parent().find("li.color").each(function () {
			var color = $(this).attr("value");

			if ( contrastRatio(bgcolor, color) < threshold ) {
				$(this).find('span.invalid-color').removeClass('hidden');
			} else {
				$(this).find('span.invalid-color').addClass('hidden');
			}
		});

	});

	// updates UFIXIT Preview and validates input on change of foreground color using Color-Picker
	$(document).on("click", "li.color", function (e) {
		var preview = $(e.target).parent().parent().parent().parent().find('div.ufixit-preview-canvas');
		var back = $(e.target).parent().parent().parent().parent().find('input.back-color');
		var fore = $(e.target).parent().parent().parent().parent().find('input.fore-color');
		var text_type = $(e.target).parent().parent().parent().parent().find('input.threshold');

		var error = $(e.target).parent().parent().parent().parent().find('span.contrast-invalid');
		var cr = $(e.target).parent().parent().parent().parent().find('span.contrast-ratio');
		var contrast_ratio = 0;
		var bgcolor = "#fff";

		if ( $(back).length > 0 ) {
			bgcolor = $(back).val();
		}

		var threshold = (text_type.attr('value') === 'text')? 4.5: 3;

		contrast_ratio = contrastRatio( bgcolor, $(e.target).attr("value") );
		$(cr).html( contrast_ratio.toFixed(2) );

		if (contrast_ratio < threshold) {
			$(error).removeClass('hidden');
			fore.attr('style','border-color: red;');
			$(e.target).parent().parent().parent().parent().find('button.submit-content').prop('disabled',true);
		} else {
			$(error).addClass('hidden');
			fore.attr('style','');
			$(e.target).parent().parent().parent().parent().find('button.submit-content').removeAttr('disabled');
		}
		
		preview.css("color", $(e.target).attr("value") );
		$(fore).val( $(e.target).attr("value") );

		$(fore).css("background-color", $(e.target).attr("value") );
		$(fore).css("color", $(e.target).css("color") );

		$(e.target).parent().parent().parent().parent().find("li.color").each(function () {
			var color = $(this).attr("value");

			if ( contrastRatio(bgcolor, color) < threshold ) {
				$(this).find('span.invalid-color').removeClass('hidden');
			} else {
				$(this).find('span.invalid-color').addClass('hidden');
			}
		});
	});

});