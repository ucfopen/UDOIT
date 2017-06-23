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


/*
Borrowed from: 
Color contrast script for http://webaim.org/resources/contrastchecker/
Authored by Jared Smith.
Nothing here is too earth shattering, but if you're reading this, you must be interested. Feel free to steal, borrow, or use this code however you would like.
The color picker is jscolor - http://jscolor.com/
*/

function getColor(location) {
	colorobj = document.getElementById(location);
	var color=colorobj.value.replace("#","");
	return color;
}

function getL(color) {
	if(color.length == 3) {
		var R = getsRGB(color.substring(0,1) + color.substring(0,1));
		var G = getsRGB(color.substring(1,2) + color.substring(1,2));
		var B = getsRGB(color.substring(2,3) + color.substring(2,3));
		update = true;
	}
	else if(color.length == 6) {
		var R = getsRGB(color.substring(0,2));
		var G = getsRGB(color.substring(2,4));
		var B = getsRGB(color.substring(4,6));
		update = true;
	}
	else {
		update = false;
	}
	if (update == true) {
		var L = (0.2126 * R + 0.7152 * G + 0.0722 * B);
		return L;
	}
	else {
		return false;
	}
	
}

function getsRGB(color) {
	color=getRGB(color);
	if(color!==false) {
		color = color/255;
		color = (color <= 0.03928) ? color/12.92 : Math.pow(((color + 0.055)/1.055), 2.4);
		return color;
	}
	else { 
		return false;
	}
}

function getRGB(color) {
	try {
		var color = parseInt(color, 16);
	}
	catch (err) {
		var color = false;
	}
	return color;
}

function changehue(loc,dir) {
	var color=getColor(loc);
	if(color.length == 3) {
		var R = color.substring(0,1) + color.substring(0,1);
		var G = color.substring(1,2) + color.substring(1,2);
		var B = color.substring(2,3) + color.substring(2,3);
	}
	else if(color.length == 6) {
		var R = color.substring(0,2);
		var G = color.substring(2,4);
		var B = color.substring(4,6);
		update = true;
	}
	else {
		update=false;
	}
	R = getRGB(R);
	G = getRGB(G);
	B = getRGB(B);

	HSL = RGBtoHSL(R, G, B);
	var lightness = HSL[2];
	if (update==true) {
		lightness = (dir=="lighten") ? lightness+6.25 : lightness-6.25;
		if (lightness>100) {
			lightness=100;
		}
		if (lightness<0) {
			lightness=0;
		}
		RGB = hslToRgb(HSL[0],HSL[1],lightness);
		R = RGB[0];
		G = RGB[1];
		B = RGB[2];
		if(!(R>=0)&&!(R<=255)) R=0
		if(!(G>=0)&&!(G<=255)) G=0
		if(!(B>=0)&&!(B<=255)) B=0
		R = (R >= 16) ? R.toString(16) : "0" + R.toString(16);
		G = (G >= 16) ? G.toString(16) : "0" + G.toString(16);
		B = (B >= 16) ? B.toString(16) : "0" + B.toString(16);
		R = (R.length==1) ? R + R : R;
		G = (G.length==1) ? G + G : G;
		B = (B.length==1) ? B + B : B;
		document.getElementById(loc).value='#' + R + G + B;
	}
}

function RGBtoHSL(r,g,b)
{
	var Min=0;
	var Max=0;
	r=(eval(r)/51)*.2;
	g=(eval(g)/51)*.2;
	b=(eval(b)/51)*.2;

	if (eval(r)>=eval(g))
		Max=eval(r);
	else
		Max=eval(g);
	if (eval(b)>eval(Max))
		Max=eval(b);
	
	if (eval(r)<=eval(g))
		Min=eval(r);
	else
		Min=eval(g);
	if (eval(b)<eval(Min))
		Min=eval(b);

	L=(eval(Max)+eval(Min))/2;
	if (eval(Max)==eval(Min)) 
	{
		S=0;
		H=0;
	} 
	else 
	{
		if (L < .5)
			S=(eval(Max)-eval(Min))/(eval(Max)+eval(Min));
		if (L >= .5)
			S=(eval(Max)-eval(Min))/(2-eval(Max)-eval(Min));
		if (r==Max)
			H = (eval(g)-eval(b))/(eval(Max)-eval(Min));
		if (g==Max)
			H = 2+((eval(b)-eval(r))/(eval(Max)-eval(Min)));
		if (b==Max)
			H = 4+((eval(r)-eval(g))/(eval(Max)-eval(Min)));
	}
	H=Math.round(H*60);
	if(H<0) H += 360;
	if(H>=360) H -= 360;
	S=Math.round(S*100);
	L=Math.round(L*100);
	return  [H, S, L];
}

function hslToRgb(H, S, L){
   	var p1,p2;
	L/=100;
	S/=100;
	if (L<=0.5) p2=L*(1+S);
	else p2=L+S-(L*S);
	p1=2*L-p2;
	if (S==0) 
	{
		R=L; 
		G=L;
		B=L;
	} 
	else 
	{
		R=FindRGB(p1,p2,H+120);
		G=FindRGB(p1,p2,H);
		B=FindRGB(p1,p2,H-120);
	}
	R *= 255;
	G *= 255;
	B *= 255;
	R=Math.round(R);
	G=Math.round(G);
	B=Math.round(B);

    return [R, G, B];
};

function FindRGB(q1,q2,hue) 
{
	if (hue>360) hue=hue-360;
	if (hue<0) hue=hue+360;
	if (hue<60) return (q1+(q2-q1)*hue/60);
	else if (hue<180) return(q2);
	else if (hue<240) return(q1+(q2-q1)*(240-hue)/60);
	else return(q1);
}