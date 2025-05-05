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
export declare function selectorMatchesElem(element: any, selector: any): any;
/**
 * Returns the style computed for this element
 * @param elem
 */
export declare function getComputedStyle(elem: HTMLElement, pseudoElt?: PseudoClass): CSSStyleDeclaration;
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
export declare function getDefinedStyles(elem: HTMLElement, pseudoClass?: string): {};
/**
 * Returns the media query defined for the document
 *
 *
 * @param {Document} doc
 */
export declare function getMediaOrientationTransform(doc: Document): {};
/**
 * convert given rotation transform functions to the degree transformed.
 * If multiple functions are given, then the functions are applied linearly in the order.
 *   rotation_transform function example:  rotate(45deg), rotate(2turn), rotate(2rad), rotate3d(1, 1, 1, 45deg),
 *        rotate(2rad) rotate3d(1, 1, 1, 45deg)
 * @param rotation_transform
 */
export declare function getRotationDegree(rotation_transform: any): number;
/**
 * Convert CSS style string values to pixels.
 *
 * @param value style value in string, such as 3rem, 230px etc.
 * @param target element.
 * @return value in pixels
 */
export declare function getPixelsFromStyle(value: any, elem: any): any;
/**
 * Convert absolute CSS numerical values to pixels.
 *
 * @param unitValue in string
 * @param target element.
 * @return value in pixels
 */
export declare function convertValue2Pixels(unit: any, unitValue: any, elem: any): any;
export declare function isMaterialIconFont(elem: HTMLElement): boolean;
export declare function getWeightNumber(styleVal: any): any;
export declare function getFontInPixels(styleVal: any, elem: any): any;
export declare function getCSSStyle(element: any): any;
export {};
