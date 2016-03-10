// Parse rgb(r, g, b) and rgba(r, g, b, a) strings into an array.
// Adapted from https://github.com/gka/chroma.js
function parseRgb (color) {
	color = color.substring(1);
	if ( color.length == 3 ) {
		color = color + color;
	}

	var hex = parseInt( color.toUpperCase(), 16 );


	var r = hex >> 16;
    var g = hex >> 8 & 0xFF;
    var b = hex & 0xFF;
    return [r,g,b];
};

// Based on http://www.w3.org/TR/WCAG20/#contrast-ratiodef
function contrastRatio (back, fore) {
	var l1 = relativeLuminance(parseRgb( back ));
	var l2 = relativeLuminance(parseRgb( fore ));
	var ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);

	return ratio || 1;
};

// Based on http://www.w3.org/TR/WCAG20/#relativeluminancedef
function relativeLuminance (c) {
	var lum = [];
	for (var i = 0; i < 3; i++) {
		var v = c[i] / 255;
		lum.push(v < 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4));
	}
	return 0.2126 * lum[0] + 0.7152 * lum[1] + 0.0722 * lum[2];
};