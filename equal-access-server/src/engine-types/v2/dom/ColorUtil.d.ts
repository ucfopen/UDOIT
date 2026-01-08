/******************************************************************************
     Copyright:: 2020- IBM, Inc

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
 *****************************************************************************/
export declare class ColorUtil {
    static CSSColorLookup: {
        aliceblue: string;
        antiquewhite: string;
        aqua: string;
        aquamarine: string;
        azure: string;
        beige: string;
        bisque: string;
        black: string;
        blanchedalmond: string;
        blue: string;
        blueviolet: string;
        brown: string;
        burlywood: string;
        cadetblue: string;
        chartreuse: string;
        chocolate: string;
        coral: string;
        cornflowerblue: string;
        cornsilk: string;
        crimson: string;
        cyan: string;
        darkblue: string;
        darkcyan: string;
        darkgoldenrod: string;
        darkgray: string;
        darkgreen: string;
        darkkhaki: string;
        darkmagenta: string;
        darkolivegreen: string;
        darkorange: string;
        darkorchid: string;
        darkred: string;
        darksalmon: string;
        darkseagreen: string;
        darkslateblue: string;
        darkslategray: string;
        darkturquoise: string;
        darkviolet: string;
        deeppink: string;
        deepskyblue: string;
        dimgray: string;
        dodgerblue: string;
        firebrick: string;
        floralwhite: string;
        forestgreen: string;
        fuchsia: string;
        gainsboro: string;
        ghostwhite: string;
        gold: string;
        goldenrod: string;
        gray: string;
        green: string;
        greenyellow: string;
        honeydew: string;
        hotpink: string;
        indianred: string;
        indigo: string;
        ivory: string;
        khaki: string;
        lavender: string;
        lavenderblush: string;
        lawngreen: string;
        lemonchiffon: string;
        lightblue: string;
        lightcoral: string;
        lightcyan: string;
        lightgoldenrodyellow: string;
        lightgrey: string;
        lightgreen: string;
        lightpink: string;
        lightsalmon: string;
        lightseagreen: string;
        lightskyblue: string;
        lightslategray: string;
        lightsteelblue: string;
        lightyellow: string;
        lime: string;
        limegreen: string;
        linen: string;
        magenta: string;
        maroon: string;
        mediumaquamarine: string;
        mediumblue: string;
        mediumorchid: string;
        mediumpurple: string;
        mediumseagreen: string;
        mediumslateblue: string;
        mediumspringgreen: string;
        mediumturquoise: string;
        mediumvioletred: string;
        midnightblue: string;
        mintcream: string;
        mistyrose: string;
        moccasin: string;
        navajowhite: string;
        navy: string;
        oldlace: string;
        olive: string;
        olivedrab: string;
        orange: string;
        orangered: string;
        orchid: string;
        palegoldenrod: string;
        palegreen: string;
        paleturquoise: string;
        palevioletred: string;
        papayawhip: string;
        peachpuff: string;
        peru: string;
        pink: string;
        plum: string;
        powderblue: string;
        purple: string;
        red: string;
        rosybrown: string;
        royalblue: string;
        saddlebrown: string;
        salmon: string;
        sandybrown: string;
        seagreen: string;
        seashell: string;
        sienna: string;
        silver: string;
        skyblue: string;
        slateblue: string;
        slategray: string;
        snow: string;
        springgreen: string;
        steelblue: string;
        tan: string;
        teal: string;
        thistle: string;
        tomato: string;
        turquoise: string;
        violet: string;
        wheat: string;
        white: string;
        whitesmoke: string;
        yellow: string;
        yellowgreen: string;
        buttontext: string;
        buttonface: string;
        graytext: string;
    };
    static Color(cssStyleColor: any): ColorObj;
    static ColorCombo(ruleContext: HTMLElement): {
        hasGradient: boolean;
        hasBGImage: boolean;
        textShadow: boolean;
        fg: any;
        bg: any;
    };
}
export declare class ColorObj {
    red: number;
    green: number;
    blue: number;
    alpha: number;
    constructor(red: string | number, green: string | number, blue: string | number, alpha?: string | number);
    toHexHelp(value: number): string;
    toHex(): string;
    contrastRatio(bgColor: ColorObj): number;
    relativeLuminance(): number;
    mix(color2: ColorObj, percThis: number): ColorObj;
    getOverlayColor(bgColor: ColorObj): ColorObj;
    static fromCSSColor(cssStyleColor: any): ColorObj;
}
