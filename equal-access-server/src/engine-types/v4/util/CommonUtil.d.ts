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
import { RuleContextHierarchy } from "../api/IRule";
export declare class CommonUtil {
    static input_type_with_placeholder: string[];
    static input_text_types: string[];
    static input_time_types: string[];
    static input_other_types: string[];
    static form_button_types: string[];
    static form_labelable_elements: string[];
    static tabTagMap: {
        button: (element: any) => boolean;
        iframe: boolean;
        input: (element: any) => boolean;
        select: (element: any) => boolean;
        textarea: boolean;
        /**"div": function (element) {
            return element.hasAttribute("contenteditable");
        },*/
        a: (element: any) => any;
        area: (element: any) => any;
        audio: (element: any) => any;
        video: (element: any) => any;
        summary: (element: any) => boolean;
        details: (element: any) => boolean;
    };
    static wordCount(str: any): number;
    /**
     * Note that this only detects if the element itself is in the tab order.
     * However, this element may delegate focus to another element via aria-activedescendant.
     * Also, focus varies by browser... sticking to things that are focusable on Chrome and Firefox.
     */
    static isTabbable(element: any): any;
    /**
     * Test if the ele node is focusable
     */
    static isFocusable(ele: any): any;
    /**
     * Note that this only detects if the element itself is interactive, but not onclick event.
     */
    static isClickable(element: any): any;
    static isTableDescendant(contextHierarchies?: RuleContextHierarchy): import("../api/IMapper").IMapResult[];
    static tabIndexLEZero(elem: any): boolean;
    /**
     * get number of tabbable children
     * @param element
     */
    static getTabbableChildren(element: any): number;
    static normalizeSpacing(s: any): any;
    static isHtmlEquiv(node: any, htmlEquiv: any): boolean;
    static nonExistantIDs(node: any, targetids: any): string;
    static getDocElementsByTag(elem: any, tagName: any): any;
    /**
     * This function is responsible for get a list of all the child elemnts which match the tag
     * name provided.
     *
     * Note: This is a wrapper function to: AriaUtil.getChildByTagHidden
     *
     * @parm {element} parentElem - The parent element
     * @parm {string} tagName - The tag to search for under the parent element
     * @parm {boolean} ignoreHidden - true if hidden elements with the tag should ignored from the list
     *                                false if the hidden elements should be added
     *
     * @return {List} retVal - list of all the elements which matched the tag under the parent that were provided.
     *
     * @memberOf AriaUtil
     */
    static getChildByTag(parentElem: any, tagName: any): any[];
    /**
     * This function is responsible for get a list of all the child elemnts which match the tag
     * name provided.
     *
     * @parm {element} parentElem - The parent element
     * @parm {string} tagName - The tag to search for under the parent element
     * @parm {boolean} ignoreHidden - true if hidden elements with the tag should ignored from the list
     *                                false if the hidden elements should be added
     * @parm {bool} considerHiddenSetting - true or false based on if hidden setting should be considered.
     *
     * @return {List} retVal - list of all the elements which matched the tag under the parent that were provided.
     *
     * @memberOf AriaUtil
     */
    static getChildByTagHidden(parentElem: any, tagName: any, ignoreHidden: any, considerHiddenSetting: any): any[];
    /**
         * This function is responsible for finding a list of elements that match given roles(s).
         * This function by defauly will not consider Check Hidden Setting at all.
         * This function by defauly will not consider implicit roles.
         * Note: This is a wrapper function to: AriaUtil.getElementsByRoleHidden
         *
         * @parm {document} doc - The document node
         * @parm {list or string} roles - List or single role for which to return elements based on.
         *
         * @return {List} retVal - list of all the elements which matched the role(s) that were provided.
         *
         * @memberOf AriaUtil
         */
    static getElementsByRole(doc: any, roles: any): any[];
    /**
     * This function is responsible for finding a list of elements that match given roles(s).
     * This function aslo finds elements with implicit roles.
     * This function will also consider elements that are hidden based on the if the Check
     * Hidden Content settings should be considered or not.
     *
     * @parm {document} doc - The document node
     * @parm {list or string} roles - List or single role for which to return elements based on.
     * @parm {bool} considerHiddenSetting - true or false based on if hidden setting should be considered.
     * @parm {bool} considerImplicitRoles - true or false based on if implicit roles setting should be considered.
     *
     * @return {List} retVal - list of all the elements which matched the role(s) that were provided.
     *
     * @memberOf AriaUtil
     */
    static getElementsByRoleHidden(doc: any, roles: any, considerHiddenSetting: any, considerImplicitRoles?: any): any[];
    /**
         * a target is en element that accept a pointer action (click or touch)
         *
         */
    static isTarget(element: any): boolean;
    static getFileExt(url: any): string;
    static getFileAnchor(url: any): any;
    static checkObjEmbed(node: any, extTest: any, mimeTest: any): boolean;
    static isAudioObjEmbedLink(node: any): boolean;
    static isAudioExt(ext: any): boolean;
    static isVideoObjEmbedLink(node: any): boolean;
    static isVideoExt(ext: any): boolean;
    static isImageObjEmbedLink(node: any): boolean;
    static image_extensions: string[];
    static isImgExt(ext: any): boolean;
    static isHtmlExt(ext: any): boolean;
    static hasTriggered(doc: any, id: any): any;
    static triggerOnce(doc: any, id: any, passed: any): any;
    static valInArray(value: any, arr: any): boolean;
    /**
     * return the ancestor of the given element
     * @param tagNames string, array, or dictionary containing the tags to search for
     */
    static getAncestor(element: any, tagNames: any): any;
    static isSibling(element1: any, element2: any): boolean;
    static isDescendant(parent: any, child: any): boolean;
    static isDisabledByFirstChildFormElement(element: any): boolean;
    static isDisabledByReferringElement(element: any): boolean;
    /** get element containing label for the given element
         * @deprecated Deprecated because the function name is misleading. Use getLabelForElement(element) instead
         */
    static getInputLabel(element: any): any;
    /**
     * This function is responsible for getting the element containing the label for the given element.
     *
     * Note: This is a wrapper function to: AriaUtil.getLabelForElementHidden
     *
     * @parm {element} element - The element for which to get the label element for.
     *
     * @return {element} element - return the element for the label, otherwise null
     *
     * @memberOf AriaUtil
     */
    static getLabelForElement(element: any): any;
    /**
     * This function is responsible for getting the element containing the label for the given element.
     *
     * This function will return null if the containing lable element is hidden, when the ignoreHidden option
     * is set to true.
     *
     * @parm {element} element - The element for which to get the label element for.
     * @parm {boolean} ignoreHidden - true if hidden elements with label should be ignored from the list
     *                                false if the hidden elements should be added
     *
     * @return {element} element - return the element for the label, otherwise null
     *
     * @memberOf AriaUtil
     */
    static getLabelForElementHidden(element: Element, ignoreHidden: any): any;
    static getElementAttribute(element: any, attr: any): any;
    static hasImplicitLabel(element: any): boolean;
    static getImplicitLabel(element: any): any;
    /**
     * This function is responsible for getting the label for a form field element.
     *
     *
     * @parm {element} element - The element from which to get the label.
     *
     * @return {string} text - return the label text or null
     *
     * @memberOf AriaUtil
     */
    static getFormFieldLabel(elem: any): string | null;
    /**
     * calculate label from embedded control: https://w3c.github.io/accname/
     * @param {element} labelElem label element
     * @param {boolean} ignoreHidden - true if hidden elements with label should be ignored from the list
     *                                false if the hidden elements should be added
     * @returns label text or ''
     *
     * note the assumption is the labelElem refers either to a labelled element by 'for' attribute
     *  or its first form field is labbelled element
     */
    static getLabelTextFromAttribute(labelElem: Element, ignoreHidden: boolean): string;
    static isFirstFormElement(parentNode: any, element: any): boolean;
    static isShadowHostElement(element: Element): boolean;
    static isShadowElement(element: Element): boolean;
    static removeAllFormElementsFromLabel(element: any): any;
    /**
         * @param element
         * @param idStr
         * @returns true if any one (if multiple Ids) id points to itself
         */
    static isIdReferToSelf(element: any, idStr: String): boolean;
    static nodeDepth(element: any): number;
    static compareNodeOrder(nodeA: any, nodeB: any): 0 | 1 | -1 | 2 | -2;
    /**
     *  Determine if the given attribute of the given element is not empty
     *  @memberOf AriaUtil
     */
    static attributeNonEmpty(element: any, attrStr: any): boolean;
    static getFrameByName(ruleContext: any, frameName: any): any;
    static defaultNSResolver(prefix: any): any;
    static isInnerTextOnlyEmpty(element: any): boolean;
    static getInnerText(element: any): any;
    /**
     * return onscreen innerText.
     * This function should return the same result as innerText if no offscreen content exists
     *
     * @parm {element} node The node which should be checked it has inner text or not.
     * @return {null | string} null if element has empty inner text, text otherwise
     *
     * @memberOf AriaUtil
     */
    static getOnScreenInnerText(element: any): any;
    /** Return the text content of the given node
     *  this is different than innerText or textContent that return text content of a node and its descendants
    */
    static getNodeText(element: any): string;
    /**
     * This function is responsible for checking if elements inner text is empty or not.
     *
     * @parm {element} node The node which should be checked it has inner text or not.
     * @return {bool} true if element has empty inner text, false otherwise
     *
     * @memberOf AriaUtil
     */
    static isInnerTextEmpty(element: any): boolean;
    static hasInnerContent(element: any): boolean;
    /**
     * This function is responsible for determine if an element has inner content.
     * This function also considers cases where inner text is hidden, which now will
     * be classified as does not have hidden content.
     *
     * @parm {element} node The node which should be checked it has inner text or not.
     * @return {bool} true if element has empty inner text, false otherwise
     *
     * @memberOf AriaUtil
     */
    static hasInnerContentHidden(element: any): boolean;
    static svgHasName(element: SVGElement): boolean;
    static hasInnerContentHiddenHyperLink(element: any, hyperlink_flag: any): boolean;
    static hasInnerContentOrAlt(element: any): boolean;
    static concatUniqueArrayItem(item: string, arr: string[]): string[];
    static concatUniqueArrayItemList(itemList: string[], arr: string[]): string[];
    /**
     * remove array items from a given array
     * @param itemList items to be removed from arr
     * @param arr the array
     * @returns
     */
    static reduceArrayItemList(itemList: string[], arr: string[]): string[];
    static getScopeForTh(element: any): "row" | "column";
    static getControlOfLabel(node: Node): Element;
    /**
     * This function is responsible for checking if the node that is provied is
     * disabled or not. Following is how the check is performed:
     *    1. Check if the current node is disabled with the following options:
     *       attribute --> disabled
     *         Also needs to be "button", "input", "select", "textarea", "optgroup", "option",
     *         "menuitem", "fieldset" nodes (in array elementsAllowedDisabled)
     *       attribute --> aria-disabled="true"
     *    2. Check if any of the current nodes parents are disabled with the same
     *       options listed in 1.
     *
     *    Note: If either current node or any of the parent nodes are disabled then this
     *          function will return true (node is disabled).
     *
     * @parm {HTMLElement} node - The node which should be checked if it is disabled or not.
     * @return {bool} true if the node is disabled, false otherwise
     *
     * @memberOf AriaUtil
     */
    static isNodeDisabled(node: any): any;
    /**
     * This function is responsible for determine if hidden content should be checked
     * in rules.
     *
     * @parm {element} node - A node so that the document can be accessed to check for the
     *                        option. Can be document element or a simple node element.
     * @return {bool} true if hidden content should be checked, false otherwise
     *
     * @memberOf AriaUtil
     */
    static shouldCheckHiddenContent(node: any): boolean;
    /**
     * This function is responsible for determining if node should be skipped from checking or not, based
     * on the Check Hidden Content settings and if the node is visible or not.
     *
     * @parm {element} node - Node to check if it is visible or not based on the Check Hidden Content
     *                        setting.
     *
     * @return {bool} true if node should be skipped, false otherwise
     *
     * @memberOf AriaUtil
     */
    static shouldNodeBeSkippedHidden(node: any): boolean;
    static isfocusableByDefault(node: any): boolean;
    /**
     * This function check if a non-tabable node has valid tabable content.
     * If it is tabable (the tabindex is not speicified or is not -1), returns false;
     * If it is non-tabable, but a child is tabable and does not have element content, returns false;
     * Otherwise, returns true.
     */
    static nonTabableChildCheck(element: Element): boolean;
    static hasAttribute(element: any, attributeName: any): boolean;
    static truncateText(text: string, len?: number): string;
}
