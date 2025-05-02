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
export declare class VisUtil {
    static unhideableElements: string[];
    static hiddenByDefaultElements: string[];
    /**
     * This function is responsible for checking if the node that is provied is
     * visible or not. Following is how the check is performed:
     *    1. Check if the current node is hidden with the following options:
     *       CSS --> dislay: none
     *       CSS --> visibility: hidden
     *       attribute --> hidden
     *    2. Check if the any of the current nodes parents are hidden with the same
     *       options listed in 1.
     *
     *    Note: If either current node or any of the parent nodes are hidden then this
     *          function will return false (node is not visible).
     *
     *    Note: nodes with CSS properties opacity:0 or filter:opacity(0%), or similar SVG mechanisms:
     *      They are not considered hidden. Text hidden with these methods can still be selected or copied,
     *      and user agents still expose it in their accessibility trees.
     *
     *    Note: nodes hidden off screen or behind another object: they are not considered hidden.
     *      They are exposed in the accessibility tree and they can even name on-screen objects.
     *
     * @parm {element} node The node which should be checked if it is visible or not.
     * @return {bool} false if the node is NOT visible, true otherwise
     *
     * @memberOf VisUtil
     */
    static isNodeVisible(nodeIn: Node): boolean;
    /**
     * This function is responsible for checking if the node that is visually hidden by clipping or opaq:
     *    1. Check if the current node is visually hidden:
     *       CSS --> clip: rect(0px, 0px, 0px, 0px)
     *       CSS --> opacity: 0
     *
     *    Note: If either current node or any of the parent nodes are visually hidden then this
     *          function will return true (node is not visually hidden).
     *
     *    Note: nodes with CSS properties clip: rect(0px, 0px, 0px, 0px) or opacity:0 or filter:opacity(0%), or similar SVG mechanisms:
     *      They are not considered hidden to an AT. Text hidden with these methods can still be selected or copied,
     *      and user agents still expose it in their accessibility trees.
     *
     * @parm {element} node The node which should be checked if it is visually hidden or not.
     * @return {bool} true if the node is visually hidden, false otherwise
     *
     * @memberOf VisUtil
     */
    static isNodeVisuallyHidden(node: Node): boolean;
    /**
     * return true if the node or its ancestor is hidden by CSS content-visibility:hidden
     * At this time, CSS content-visibility is partially supported by Chrome & Edge, but not supported by Firefox
     * The implementation TEMPORARILY follows the Chrome test results:
     *   if content-visibility:hidden
     *      if the element is block-level (default or specified by the user), then the element and its children are normally hidden;
     *      if the element is inline (default or specified by the user), then the element and its children are normally NOT hidden;
     *
     * @param node
     */
    static isContentHidden(node: Element): boolean;
    /**
     * return true if the node is offscreen by CSS position
     * @param node
     */
    static isElementOffscreen(node: HTMLElement): boolean;
    /**
     * return true if the node or its ancestor is natively hidden or aria-hidden = 'true'
     * @param node
     */
    static isNodeHiddenFromAT(node: Element): boolean;
    /**
     * return true if the node or its ancestor is natively hidden or aria-hidden = 'true'
     * @param node
     */
    static isNodePresentational(node: Element): boolean;
}
