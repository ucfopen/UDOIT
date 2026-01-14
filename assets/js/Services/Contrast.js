import chroma from "chroma-js";

export function toHSL(color) {
  try {
    const [h, s, l] = chroma(color).hsl();
    return { h, s, l };
  } catch {
    console.error('Error converting color to HSL:', color);
    return { h: 0, s: 0, l: 0 };
  }
}

export function hslToHex(hsl) {
  try {
    return chroma.hsl(hsl.h, hsl.s, hsl.l).hex();
  } catch {
    console.error('Error converting HSL to hex:', hsl);
    return null;
  }
}

export function changeLuminance(hsl, dir) {
  if (!hsl || typeof hsl.l !== 'number') return hsl;
  const step = 0.05;
  let newL = hsl.l;
  if (dir === "lighten") {
    newL = Math.min(1, newL + step);
  } else {
    newL = Math.max(0, newL - step);
  }
  return { h: hsl.h, s: hsl.s, l: newL };
}

export function contrastRatio(back, fore) {
  try {
    return Math.round(chroma.contrast(back, fore) * 100) / 100;
  } catch {
    return 1;
  }
}

export function convertHtmlRgb2Hex(html) {
  return html.replace(/rgb\((\d+,\s*\d+,\s*\d+)\)(?=[^\<]*\>)/ig, (_, rgb) => {
    return '#' + rgb.split(',')
      .map(str => parseInt(str, 10).toString(16).padStart(2, '0'))
      .join('')
  })
}
