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

//------------------------------ UFIXIT Preview ------------------------------//

// Initializes styling of UFIXIT preview for aMustContainText, aSuspiciousLinkText, & aLinkTextDoesNotBeginWithRedundantWord
function aMustContainText( button ) {
	textBox = button.parent().find('input.form-control');

	$(textBox).attr("style", "border: 1px solid red; background-color: rgba(255, 0, 0, .05);");
}

// Initializes styling of UFIXIT preview for cssTextHasContrast
function cssTextHasContrast( button ) {
	var back = button.parent().find('input.back-color');
	var fore = button.parent().find('input.fore-color');
	var text_type = button.parent().find('input.threshold');

	var error = button.parent().find('span.contrast-invalid');
	var cr = button.parent().find('span.contrast-ratio');
	var contrast_ratio = 0;

	var bgcolor = "#fff";
	var threshold = (text_type.attr('value') === 'text')? 4.5: 3;

	if (back.length !== 0) {
		bgcolor = $(back).val();
		$(back).css('background-color', bgcolor);
	}

	contrast_ratio = contrastRatio(bgcolor, $(fore).val() );
	$(cr).html( contrast_ratio.toFixed(2) );

	var preview = button.parent().find('div.ufixit-preview-canvas');

	preview.attr("style", "color: " + $(fore).val() + "; background-color: " + bgcolor + ";" );

	if (contrast_ratio < threshold) {
		$(error).removeClass('hidden');
		$(fore).css({"border-color": "red", "background-color": $(fore).val()});
	}

	button.parent().find("li.color").each(function () {
		var color = $(this).attr("value");
		$(this).css("background-color", color);

		//if the swatch color is too dark
		//change font color to something lighter 
		var c = color.substring(1); // strip '#'
		var rgb = parseInt(c, 16); // convert rrggbb to decimal
		var r = (rgb >> 16) & 0xff; // extract red
		var g = (rgb >> 8) & 0xff; // extract green
		var b = (rgb >> 0) & 0xff; // extract blue

		var luma = 0.2126 * r + 0.7152 * g + 0.0722 * b; // per ITU-R BT.709

		if (luma < 100) {
			$(this).css("color", "#ffffff");
		}

		if ( contrastRatio(bgcolor, color) < threshold ) {
			$(this).find('span.invalid-color').removeClass('hidden');
		}
	});
}

// Initializes styling of UFIXIT preview for cssTextStyleEmphasize
function cssTextStyleEmphasize( button ) {
	var back = button.parent().find('input.back-color');
	var fore = button.parent().find('input.fore-color');
	var checkBoxes = button.parent().find('div.left');

	var bgcolor = "#fff";

	if (back.length !== 0) {
		bgcolor = $(back).val();
	}

	var preview = button.parent().find('div.ufixit-preview-canvas');
	preview.attr("style", "color: " + $(fore).val() + "; background-color: " + bgcolor + ";" );

	checkBoxes.attr("style", "background-color: rgba(255, 0, 0, .05); border: 1px solid red; padding: 4px;");
	
}

// Initializes styling of UFIXIT preview for headersHaveText
function headersHaveText( button ) {
	textBox = button.parent().find('input.form-control');

	$(textBox).attr("style", "border: 1px solid red; background-color: rgba(255, 0, 0, .05);");
}

// Initializes styling of UFIXIT preview for imgHasAlt, imgNonDecorativeHasAlt, & imgAltIsDifferent
function imgHasAlt( button ) {
	textBox = button.parent().parent().find('input.form-control');

	$(textBox).attr("style", "border: 1px solid red; background-color: rgba(255, 0, 0, .05);");
}

// Initializes styling of UFIXIT preview for tableDataShouldHaveTh
function tableDataShouldHaveTh( button ) {
	selectField = button.parent().find('select.form-control');

	$(selectField).attr("style", "border: 1px solid red; background-color: rgba(255, 0, 0, .05);");
}

// Initializes styling of UFIXIT preview for tableThShouldHaveScope
function tableThShouldHaveScope( button ) {
	selectField = button.parent().find('select.form-control');

	$(selectField).attr("style", "border: 1px solid red; background-color: rgba(255, 0, 0, .05);");
}


var $doc = $(document);
$doc.ready(function() {

	// the "U FIX IT" button ((on scanner))
	$doc.on("click", "button.fix-this", function() {
		$(this).hide();

		var form = $(this).parent().find('form');
		var errorType = $(this).parent().find("input[name='errortype']");

		if (form.is(':visible')) {
			$(form).removeClass('show');
			$(form).addClass('hidden');
		}
		else {
			$(form).removeClass('hidden');
			$(form).addClass('show');
		}

		switch ( $(errorType).val() ) {
			case "aMustContainText":
			case "aSuspiciousLinkText":
			case "aLinkTextDoesNotBeginWithRedundantWord":
				aMustContainText( $(this) );
				break;

			case "cssTextHasContrast":
				cssTextHasContrast( $(this) );
				break;

			case "cssTextStyleEmphasize":
				cssTextStyleEmphasize( $(this) );
				break;

			case "headersHaveText":
				headersHaveText( $(this) );
				break;

			case "imgHasAlt":
			case "imgNonDecorativeHasAlt":
			case "imgAltIsDifferent":
				imgHasAlt( $(this) );
				break;

			case "tableDataShouldHaveTh":
				tableDataShouldHaveTh( $(this) );
				break;

			case "tableThShouldHaveScope":
				tableThShouldHaveScope( $(this) );
				break;

			default:
				break;
		}
	});
});
