class Contrast {
  rgb2hex(rgb) {
    if (/^#[0-9A-F]{6}$/i.test(rgb)) return rgb;

    rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);

    if (!rgb) {
      return rgb;
    }

    function hex(x) {
      return ("0" + parseInt(x).toString(16)).slice(-2);
    }
    return "#" + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
  }

  hexToRgb(hex) {
    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function (m, r, g, b) {
      return r + r + g + g + b + b;
    });

    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  changehue(hex, dir) {
    var color = hex.substring(1)
    var update
    var R, G, B

    if (color.length == 3) {
      R = color.substring(0, 1) + color.substring(0, 1);
      G = color.substring(1, 2) + color.substring(1, 2);
      B = color.substring(2, 3) + color.substring(2, 3);
      update = true;
    }
    else if (color.length == 6) {
      R = color.substring(0, 2);
      G = color.substring(2, 4);
      B = color.substring(4, 6);
      update = true;
    }
    else {
      return '#' + color
    }
    R = this.getRGB(R);
    G = this.getRGB(G);
    B = this.getRGB(B);

    var HSL = this.RGBtoHSL(R, G, B);
    var lightness = HSL[2];
    if (update == true) {
      lightness = (dir == "lighten") ? lightness + 6.25 : lightness - 6.25;
      if (lightness > 100) {
        lightness = 100;
      }
      if (lightness < 0) {
        lightness = 0;
      }
      var RGB = this.hslToRgb(HSL[0], HSL[1], lightness);
      R = RGB[0];
      G = RGB[1];
      B = RGB[2];
      if (!(R >= 0) && !(R <= 255)) R = 0
      if (!(G >= 0) && !(G <= 255)) G = 0
      if (!(B >= 0) && !(B <= 255)) B = 0
      R = (R >= 16) ? R.toString(16) : "0" + R.toString(16);
      G = (G >= 16) ? G.toString(16) : "0" + G.toString(16);
      B = (B >= 16) ? B.toString(16) : "0" + B.toString(16);
      R = (R.length == 1) ? R + R : R;
      G = (G.length == 1) ? G + G : G;
      B = (B.length == 1) ? B + B : B;
      return ('#' + R + G + B);
    }
  }

  RGBtoHSL(r, g, b) {
    var Min = 0;
    var Max = 0;
    var H, S, L
    r = (eval(r) / 51) * .2;
    g = (eval(g) / 51) * .2;
    b = (eval(b) / 51) * .2;

    if (eval(r) >= eval(g))
      Max = eval(r);
    else
      Max = eval(g);
    if (eval(b) > eval(Max))
      Max = eval(b);

    if (eval(r) <= eval(g))
      Min = eval(r);
    else
      Min = eval(g);
    if (eval(b) < eval(Min))
      Min = eval(b);

    L = (eval(Max) + eval(Min)) / 2;
    if (eval(Max) == eval(Min)) {
      S = 0;
      H = 0;
    }
    else {
      if (L < .5)
        S = (eval(Max) - eval(Min)) / (eval(Max) + eval(Min));
      if (L >= .5)
        S = (eval(Max) - eval(Min)) / (2 - eval(Max) - eval(Min));
      if (r == Max)
        H = (eval(g) - eval(b)) / (eval(Max) - eval(Min));
      if (g == Max)
        H = 2 + ((eval(b) - eval(r)) / (eval(Max) - eval(Min)));
      if (b == Max)
        H = 4 + ((eval(r) - eval(g)) / (eval(Max) - eval(Min)));
    }
    H = Math.round(H * 60);
    if (H < 0) H += 360;
    if (H >= 360) H -= 360;
    S = Math.round(S * 100);
    L = Math.round(L * 100);
    return [H, S, L];
  }

  hslToRgb(H, S, L) {
    var p1, p2;
    var R, G, B;
    L /= 100;
    S /= 100;
    if (L <= 0.5) p2 = L * (1 + S);
    else p2 = L + S - (L * S);
    p1 = 2 * L - p2;
    if (S == 0) {
      R = L;
      G = L;
      B = L;
    }
    else {
      R = this.FindRGB(p1, p2, H + 120);
      G = this.FindRGB(p1, p2, H);
      B = this.FindRGB(p1, p2, H - 120);
    }
    R *= 255;
    G *= 255;
    B *= 255;
    R = Math.round(R);
    G = Math.round(G);
    B = Math.round(B);

    return [R, G, B];
  }

  getRGB(color) {
    try {
      var color = parseInt(color, 16);
    }
    catch (err) {
      var color = false;
    }
    return color;
  }

  FindRGB(q1, q2, hue) {
    if (hue > 360) hue = hue - 360;
    if (hue < 0) hue = hue + 360;
    if (hue < 60) return (q1 + (q2 - q1) * hue / 60);
    else if (hue < 180) return (q2);
    else if (hue < 240) return (q1 + (q2 - q1) * (240 - hue) / 60);
    else return (q1);
  }

  contrastRatio(back, fore) {
    var l1 = this.relativeLuminance(this.parseRgb(back));
    var l2 = this.relativeLuminance(this.parseRgb(fore));
    var ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);

    ratio = Math.round((ratio * 100)) / 100;

    return ratio || 1;
  }

  relativeLuminance(c) {
    var lum = [];
    for (var i = 0; i < 3; i++) {
      var v = c[i] / 255;
      lum.push(v < 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4));
    }
    return 0.2126 * lum[0] + 0.7152 * lum[1] + 0.0722 * lum[2];
  }

  parseRgb(color) {
    color = this.convertShortenedHex(color)
    color = color.substring(1);

    var hex = parseInt(color.toUpperCase(), 16);

    var r = hex >> 16;
    var g = hex >> 8 & 0xFF;
    var b = hex & 0xFF;
    return [r, g, b];
  }

  convertShortenedHex(color) {
    color = color.substring(1);

    // If the string is too long, cut it off at 6 characters
    if(color.length > 6) {
      color = color.substring(0,6)
    }
    // If the length is 3, hex shorthand is being used
    else if (color.length == 3) {
      color = color[0] + color[0] + color[1] + color[1] + color[2] + color[2];
    }
    // If the length is not 3 or 6, pad the end with zeroes
    else if(color.length != 6) {
      let padding = '0'.repeat(6 - color.length)
      color = color + padding;
    }

    return '#' + color
  }

  // Accepts HSL, RGB, Hex, color name (eg. red, black) and returns the hex value
  standardizeColor(color){
    var element = document.createElement("canvas").getContext("2d");
    element.fillStyle = color;
    
    return element.fillStyle;
  }

  convertHtmlRgb2Hex(html) {
    return html.replace(/rgb\((\d+,\s*\d+,\s*\d+)\)(?=[^\<]*\>)/ig, (_, rgb) => {
      return '#' + rgb.split(',')
        .map(str => parseInt(str, 10).toString(16).padStart(2, '0'))
        .join('')
    })
  }
}

export default new Contrast()
