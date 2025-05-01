/******************************************************************************
     Copyright:: 2022- IBM, Inc

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
type PseudoClass = ":hover" | ":active" | ":focus" | ":focus-visible" | ":focus-within";
export declare class CSSUtil {
    static selectorMatchesElem(element: any, selector: any): any;
    /**
     * Returns the style computed for this element
     * @param elem
     */
    static getComputedStyle(elem: HTMLElement, pseudoElt?: PseudoClass): CSSStyleDeclaration;
    /**
     * Returns the style defined for this element
     *
     * This differs from the computed style in that the computed style will return
     * styles defined by the user agent. This will only return styles defined by the
     * application
     * if rotation transform is used, the computed style returns the resolved matrix
     *  while the defined style return the transform function(s)
     * for example, for 'transform: rotate(2.5deg);', the computed style returns 'matrix(-0.0436194, 0.999048, -0.999048, -0.0436194, 0, 0)'
     *  and the defined style returns 'rotate(2.5deg)'
     *
     * change the type of the parameter pseudoClass from PseudoClass to string to include both pseudo classes (e.g., :focus, :checked)
     * and pseudo elements (e.g., ::before, ::after).
     *
     * @param {HTMLElement} elem
     * @param {string} [pseudoClass] If specified, will return values that are different
     * than when the pseudoClass does not match.
     */
    static getDefinedStyles(elem: HTMLElement, pseudoClass?: string): {};
    /**
     * Returns the media query defined for the document
     *
     *
     * @param {Document} doc
     */
    static getMediaOrientationTransform(doc: Document): {};
    /**
     * convert given rotation transform functions to the degree transformed.
     * If multiple functions are given, then the functions are applied linearly in the order.
     *   rotation_transform function example:  rotate(45deg), rotate(2turn), rotate(2rad), rotate3d(1, 1, 1, 45deg),
     *        rotate(2rad) rotate3d(1, 1, 1, 45deg)
     * @param rotation_transform
     */
    static getRotationDegree(rotation_transform: any): number;
    /**
     * Convert CSS style string values to pixels.
     *
     * @param value style value in string, such as 3rem, 230px etc.
     * @param target element.
     * @return value in pixels
     */
    static getPixelsFromStyle(value: any, elem: any): any;
    /**
     * Convert absolute CSS numerical values to pixels.
     *
     * @param unitValue in string
     * @param target element.
     * @return value in pixels
     */
    static convertValue2Pixels(unit: any, unitValue: any, elem: any): any;
    static isMaterialIconFont(elem: HTMLElement): boolean;
    static getWeightNumber(styleVal: any): any;
    static getFontInPixels(styleVal: any, elem: any): any;
    static getCSSStyle(element: any): any;
    /**
     * an "inline" CSS display property tells the element to fit itself on the same line. An 'inline' element's width and height are ignored.
     * some element has default inline property, such as <span>, <a>
     * most formatting elements inherent inline property, such as <em>, <strong>, <i>, <small>
     * other inline elements: <abbr> <acronym> <b> <bdo> <big> <br> <cite> <code> <dfn> <em> <i> <input> <kbd> <label>
     * <map> <object> <output> <q> <samp> <script> <select> <small> <span> <strong> <sub> <sup> <textarea> <time> <tt> <var>
     * an "inline-block" element still place element in the same line without breaking the line, but the element's width and height are applied.
     * inline-block elements: img, button, select, meter, progress, marguee, also in Chrome: textarea, input
     * A block-level element always starts on a new line, and the browsers automatically add some space (a margin) before and after the element.
     * block-level elements: <address> <article> <aside> <blockquote> <canvas> <dd> <div> <dl> <dt> <fieldset> <figcaption> <figure> <footer> <form>
     * <h1>-<h6> <header> <hr> <li> <main> <nav> <noscript> <ol> <p> <pre> <section> <table> <tfoot> <ul> <video>
     *
     * return: if it's inline element and { inline: true | false, text: true | false, violation: null | {node} }
     */
    static getInlineStatus(element: any): {
        inline: boolean;
        text: boolean;
        violation: any;
    };
    /**
     * a target is en element that accept a pointer action (click or touch)
     * a target is a browser default if it's a native widget (no user defined role) without user style
     */
    static isTargetBrowserDefault(element: any): boolean;
    static containsCKJ(text: string): boolean;
    /**
     * return the ancestor with the given style properties.
     *
     * @parm {element} element - The element to start the node walk on to find parent node
     * @parm {[string]} styleProps - The style properties and values of the parent to search for.
     *         such as {"overflow":['auto', 'scroll'], "overflow-x":['auto', 'scroll']}
     *          or {"overflow":['*'], "overflow-x":['*']}, The '*' for any value to check the existence of the style prop.
     * @parm {bool} excludedValues - style values that should be ignored.
     * @return {node} walkNode - A parent node of the element, which has the style properties
     * @memberOf AriaUtil
     */
    static getAncestorWithStyles(elem: any, styleProps: any, excludedValues?: any[]): any;
}
export {};
