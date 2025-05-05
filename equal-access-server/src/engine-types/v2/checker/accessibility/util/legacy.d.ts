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
import { IDocumentConformanceRequirement } from "../../../aria/ARIADefinitions";
export declare class RPTUtil {
    static navLinkKeywords: string[];
    static rulesThatHaveToCheckHidden: string[];
    static isDefinedAriaAttributeAtIndex(ele: any, index: any): boolean;
    static ariaAttributeRoleDefaults: {
        alert: {
            "aria-live": string;
            "aria-atomic": string;
        };
        combobox: {
            "aria-haspopup": string;
        };
        listbox: {
            "aria-orientation": string;
        };
        log: {
            "aria-live": string;
        };
        menu: {
            "aria-orientation": string;
        };
        menubar: {
            "aria-orientation": string;
        };
        meter: {
            "aria-valuemin": string;
            "aria-valuemax": string;
        };
        option: {
            "aria-selected": string;
        };
        progressbar: {
            "aria-valuemin": string;
            "aria-valuemax": string;
        };
        scrollbar: {
            "aria-orientation": string;
            "aria-valuemin": string;
            "aria-valuemax": string;
        };
        separator: {
            "aria-orientation": string;
            "aria-valuemin": string;
            "aria-valuemax": string;
        };
        slider: {
            "aria-orientation": string;
            "aria-valuemin": string;
            "aria-valuemax": string;
        };
        spinbutton: {};
        status: {
            "aria-live": string;
            "aria-atomic": string;
        };
        tab: {
            "aria-selected": string;
        };
        tablist: {
            "aria-orientation": string;
        };
        toolbar: {
            "aria-orientation": string;
        };
        tree: {
            "aria-orientation": string;
        };
    };
    static ariaAttributeGlobalDefaults: {
        "aria-atomic": string;
        "aria-autocomplete": string;
        "aria-busy": string;
        "aria-checked": any;
        "aria-current": string;
        "aria-disabled": string;
        "aria-dropeffect": string;
        "aria-expanded": any;
        "aria-grabbed": any;
        "aria-haspopup": string;
        "aria-hidden": any;
        "aria-invalid": string;
        "aria-live": string;
        "aria-modal": string;
        "aria-multiline": string;
        "aria-multiselectable": string;
        "aria-orientation": any;
        "aria-pressed": any;
        "aria-readonly": string;
        "aria-required": string;
        "aria-selected": any;
        "aria-sort": string;
    };
    static ariaAttributeImplicitMappings: {
        "aria-autocomplete": {
            form: (e: any) => "none" | "both";
            input: (e: any) => "none" | "both";
            select: (e: any) => "none" | "both";
            textarea: (e: any) => "none" | "both";
        };
        "aria-checked": {
            input: (e: any) => string;
            menuitem: (e: any) => string;
            "*": (e: any) => string;
        };
        "aria-disabled": {
            button: (e: any) => "true" | "false";
            fieldset: (e: any) => "true" | "false";
            input: (e: any) => "true" | "false";
            optgroup: (e: any) => "true" | "false";
            option: (e: any) => "true" | "false";
            select: (e: any) => "true" | "false";
            textarea: (e: any) => "true" | "false";
        };
        "aria-expanded": {
            details: (e: any) => any;
            dialog: (e: any) => any;
        };
        "aria-multiselectable": {
            select: (e: any) => string;
        };
        "aria-placeholder": {
            input: (e: any) => any;
            textarea: (e: any) => any;
        };
        "aria-required": {
            input: (e: any) => any;
            select: (e: any) => any;
            textarea: (e: any) => any;
        };
    };
    /**
     * this method returns user-defined aria attribute name from dom
     * @param ele  element
     * @returns user defined aria attributes
     */
    static getUserDefinedAriaAttributes(elem: any): any[];
    /**
     * this method returns user-defined html attribute name from dom
     * @param ele  element
     * @returns user defined html attributes
     */
    static getUserDefinedHtmlAttributes(elem: any): any[];
    /**
     * this method returns user-defined aria attribute name-value pair from dom
     * @param ele  element
     * @returns user defined aria attributes
     */
    static getUserDefinedAriaAttributeNameValuePairs(elem: any): any[];
    /**
     * this method returns user-defined html attribute name-value pair from dom
     * @param ele  element
     * @returns user defined html attributes
     */
    static getUserDefinedHtmlAttributeNameValuePairs(elem: any): any[];
    /**
     * This method handles implicit aria definitions, for example, an input with checked is equivalent to aria-checked="true"
     */
    static getAriaAttribute(ele: any, attributeName: any): any;
    static tabTagMap: {
        button: (element: any) => boolean;
        iframe: boolean;
        input: (element: any) => boolean;
        select: (element: any) => boolean;
        textarea: boolean;
        div: (element: any) => any;
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
     * a target is en element that accept a pointer action (click or touch)
     *
     */
    static isTarget(element: any): boolean;
    /**
     * a target is en element that accept a pointer action (click or touch)
     * a target is a browser default if it's a native widget (no user defined role) without user style
     */
    static isTargetBrowserDefault(element: any): boolean;
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
    static tabIndexLEZero(elem: any): boolean;
    /**
     * get number of tabbable children
     * @param element
     */
    static getTabbableChildren(element: any): number;
    static isHtmlEquiv(node: any, htmlEquiv: any): boolean;
    static isDefinedAriaAttribute(ele: any, attrName: any): boolean;
    static normalizeSpacing(s: any): any;
    static nonExistantIDs(node: any, targetids: any): string;
    static getDocElementsByTag(elem: any, tagName: any): any;
    /**
     * This function is responsible for get a list of all the child elemnts which match the tag
     * name provided.
     *
     * Note: This is a wrapper function to: RPTUtil.getChildByTagHidden
     *
     * @parm {element} parentElem - The parent element
     * @parm {string} tagName - The tag to search for under the parent element
     * @parm {boolean} ignoreHidden - true if hidden elements with the tag should ignored from the list
     *                                false if the hidden elements should be added
     *
     * @return {List} retVal - list of all the elements which matched the tag under the parent that were provided.
     *
     * @memberOf RPTUtil
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
     * @memberOf RPTUtil
     */
    static getChildByTagHidden(parentElem: any, tagName: any, ignoreHidden: any, considerHiddenSetting: any): any[];
    /**
     * This function is responsible for finding a list of elements that match given roles(s).
     * This function by defauly will not consider Check Hidden Setting at all.
     * This function by defauly will not consider implicit roles.
     * Note: This is a wrapper function to: RPTUtil.getElementsByRoleHidden
     *
     * @parm {document} doc - The document node
     * @parm {list or string} roles - List or single role for which to return elements based on.
     *
     * @return {List} retVal - list of all the elements which matched the role(s) that were provided.
     *
     * @memberOf RPTUtil
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
     * @memberOf RPTUtil
     */
    static getElementsByRoleHidden(doc: any, roles: any, considerHiddenSetting: any, considerImplicitRoles?: any): any[];
    /**
     * WAI-ARIA’s role attribute may have a list of values, but only the first valid and supported WAI-ARIA role is used
     * https://www.w3.org/TR/wai-aria-implementation/#mapping_role_table
     * This function is responsible for retrieving the resoled role for an element.
     * @parm {HTMLElement} ele - element for which to find role.
     *
     * @return string - resolved role for the element:
     *       explicit role: resoled from the list of values
     *       implicit role: if not explicitely specified, or none of the specified role values is allowed for the element
     *       null: if none of the specified role values is allowed for the element, neither implicit role exists
     *
     * @memberOf RPTUtil
     */
    static getResolvedRole(elem: Element, considerImplicitRoles?: boolean): string;
    /**
     * This function is responsible for retrieving user defined element's roles from dom.
     * @parm {HTMLElement} ele - element for which to find role.
     *
     * @return {List} roles - list of user defined roles in the element role attribute.
     *
     * @memberOf RPTUtil
     */
    static getUserDefinedRoles(ele: Element): string[];
    /**
     * This function is responsible for retrieving element's roles.
     * This function also finds implicit roles.
     * @parm {HTMLElement} ele - element for which to find role.
     * @parm {bool} considerImplicitRoles - true or false based on if implicit roles setting should be considered.
     *
     * @return {List} roles - list of attribute roles and implicit roles.
     *
     * @memberOf RPTUtil
     */
    static getRoles(ele: Element, considerImplicitRoles: boolean): string[];
    /**
     * Returns the implicit role of the elemement
     * @parm {HTMLElement} ele - element for which to find role.
     *
     * @return the implicit role or [] if doesn't exist
     *
     * @memberOf RPTUtil
     */
    static getImplicitRole(ele: any): string[];
    /**
     * Returns the required properties of the role
     * @parm {string} role - the role
     * @parm {HTMLElement} ele - element for which to find role.
     *
     * @return {List} properties - list of properties that are required by the role
     *
     * @memberOf RPTUtil
     */
    static getRoleRequiredProperties(role: any, ele: any): string[];
    /**
     * Test if the ele node is focusable
     */
    static isFocusable(ele: any): any;
    /**
     * This function is responsible for finding if a element has given role.
     * This function aslo finds if element has given roles as implicit role.
     * @parm {HTMLElement} ele - element for which to find role.
     * @parm {list or string} roles - List or single role for which to find if element has these roles.
     * @parm {bool} considerImplicitRoles - true or false based on if implicit roles setting should be considered.
     *
     * @return {List} retVal - true or false based on if th element has the specified role.
     *
     * @memberOf RPTUtil
     *
     * Consider to use hasRoleInSemantics() instead.
     */
    static hasRole(ele: any, role: any, considerImplicitRoles?: any): boolean;
    /**
     * Checks if the element has the role, including the implied role if role is not explicitly specified.
     *
     * This function is replacing the hasRole function
     *
     * @parm {HTMLElement} ele - element for which to find role.
     * @parm {list or string} roles - List or single role for which to find if element has these roles.
     *
     * @return {List} retVal - true or false based on if the element has the specified role.
     *
     * @memberOf RPTUtil
     */
    static hasRoleInSemantics(ele: any, role: any): boolean;
    /**
     * This function is responsible for finding if a element has given role.
     * This function also checks if element has given roles as implicit roles.
     * @parm {HTMLElement} ele - element for which to find role.
     * @parm {bool} considerImplicitRoles - true or false based on if implicit roles setting should be considered.
     *
     * @return {bool} retVal - true or false based on if the element has the specified role.
     *
     * @memberOf RPTUtil
     */
    static hasAnyRole(ele: any, considerImplicitRoles: any): boolean;
    static isDataTable(tableNode: any): boolean;
    static isComplexDataTable(table: any): boolean;
    static isTableCellEmpty(cell: any): boolean;
    static isTableRowEmpty(row: any): boolean;
    static tableHeaderExists(ruleContext: any): boolean;
    static isNodeInGrid(node: any): boolean;
    static isLayoutTable(tableNode: any): boolean;
    static getFileExt(url: any): string;
    static getFileAnchor(url: any): any;
    static checkObjEmbed(node: any, extTest: any, mimeTest: any): boolean;
    static isAudioObjEmbedLink(node: any): boolean;
    static isAudioExt(ext: any): boolean;
    static isVideoObjEmbedLink(node: any): boolean;
    static isVideoExt(ext: any): boolean;
    static isImageObjEmbedLink(node: any): boolean;
    static isImgExt(ext: any): boolean;
    static isHtmlExt(ext: any): boolean;
    static isPresentationalElement(node: any): boolean;
    static hasTriggered(doc: any, id: any): any;
    static triggerOnce(doc: any, id: any, passed: any): any;
    static valInArray(value: any, arr: any): boolean;
    /**
     * return the ancestor of the given element
     * @param tagNames string, array, or dictionary containing the tags to search for
     */
    static getAncestor(element: any, tagNames: any): any;
    static isSibling(element1: any, element2: any): boolean;
    /**
     * return the ancestor of the given element and role.
     *
     * @parm {element} element - The element to start the node walk on to find parent node
     * @parm {string} role - The role to search for on an element under the provided element
     * @parm {bool} considerImplicitRoles - true or false based on if implicit roles setting should be considered.
     *
     * @return {node} walkNode - A parent node of the element passed in, which has the provided role
     *
     * @memberOf RPTUtil
     */
    static getAncestorWithRole(element: any, roleName: any, considerImplicitRoles?: any): Node;
    /**
     * return the ancestor of the given element and roles.
     *
     * @parm {element} element - The element to start the node walk on to find parent node
     * @parm {array} roles - the role names to search for
     * @parm {bool} considerImplicitRoles - true or false based on if implicit roles setting should be considered.
     *
     * @return {node} walkNode - A parent node of the element passed in, which has the provided role
     *
     * @memberOf RPTUtil
     */
    static getAncestorWithRoles(element: any, roleNames: any): any;
    /**
     * return the roles with given role type.
     *
     * @parm {element} element - The element to start the node walk on to find parent node
     * @parm {array} roleTyples - role types, such as 'widget', 'structure' etc.
     *
     * @return {array} roles - A parent node of the element passed in, which has the provided role
     *
     * @memberOf RPTUtil
     */
    static getRolesWithTypes(element: any, types: string[]): any;
    /**
     * return the ancestor with the given style properties.
     *
     * @parm {element} element - The element to start the node walk on to find parent node
     * @parm {[string]} styleProps - The style properties and values of the parent to search for.
     *         such as {"overflow":['auto', 'scroll'], "overflow-x":['auto', 'scroll']}
     *          or {"overflow":['*'], "overflow-x":['*']}, The '*' for any value to check the existence of the style prop.
     * @parm {bool} excludedValues - style values that should be ignored.
     * @return {node} walkNode - A parent node of the element, which has the style properties
     * @memberOf RPTUtil
     */
    static getAncestorWithStyles(elem: any, styleProps: any, excludedValues?: any[]): any;
    /**
     * This function is responsible for finding a node which matches the role and is a sibling of the
     * provided element.
     *
     * This function by default will not consider Check Hidden Setting at all.
     *
     * Note: This is a wrapper function to: RPTUtil.getSiblingWithRoleHidden
     *
     * @parm {element} element - The element to start the node walk on to find sibling node
     * @parm {string} role - The role to search for on an element under the provided element
     *
     * @return {node} walkNode - A sibling node of the element passed in, which has the provided role
     *
     * @memberOf RPTUtil
     */
    static getSiblingWithRole(element: any, role: any): any;
    /**
     * This function is responsible for finding a node which matches the role and is a sibling of the
     * provided element.
     *
     * This function also considers implicit roles for the elements.
     *
     * This function will also consider elements that are hidden based on the if the Check
     * Hidden Content settings should be considered or not.
     *
     * @parm {element} element - The element to start the node walk on to find sibling node
     * @parm {string} role - The role to search for on an element under the provided element
     * @parm {bool} considerHiddenSetting - true or false based on if hidden setting should be considered.
     * @parm {bool} considerImplicit - true or false based on if Implicit roles should be considered.
     *
     * @return {node} walkNode - A sibling node of the element passed in, which has the provided role
     *
     * @memberOf RPTUtil
     */
    static getSiblingWithRoleHidden(element: any, role: any, considerHiddenSetting: any, considerImplicitRole?: any): any;
    static isDescendant(parent: any, child: any): boolean;
    static isDisabledByFirstChildFormElement(element: any): boolean;
    static isDisabledByReferringElement(element: any): boolean;
    /**
     * This function is responsible for getting a descendant element with the specified role, under
     * the element that was provided.
     *
     * Note by default this function will not consider the Check Hidden Content Setting.
     *
     * Note: This is a wrapper function to: RPTUtil.getDescendantWithRoleHidden
     *
     * @parm {element} element - parent element for which we will be checking descendants for
     * @parm {string} roleName - The role to look for on the descendant's elements
     *
     * @return {node} - The descendant element that matches the role specified (only one)
     *
     * @memberOf RPTUtil
     */
    static getDescendantWithRole(element: any, roleName: any): any;
    /**
     * This function is responsible for getting a descendant element with the specified role, under
     * the element that was provided. This function aslo finds elements with implicit roles.
     *
     * @parm {element} element - parent element for which we will be checking descendants for
     * @parm {string} roleName - The role to look for on the descendant's elements
     * @parm {bool} considerHiddenSetting - true or false based on if hidden setting should be considered.
     * @parm {bool} considerImplicitRoles - true or false based on if implicit roles setting should be considered.
     *
     * @return {node} - The descendant element that matches the role specified (only one)
     *
     * @memberOf RPTUtil
     */
    static getDescendantWithRoleHidden(element: any, roleName: any, considerHiddenSetting: any, considerImplicitRoles?: any): any;
    /**
     * This function is responsible for getting All descendant elements with the specified role, under
     * the element that was provided. This function aslo finds elements with implicit roles.
     *
     * @parm {element} element - parent element for which we will be checking descendants for
     * @parm {string} roleName - The role to look for on the descendant's elements
     * @parm {bool} considerHiddenSetting - true or false based on if hidden setting should be considered.
     * @parm {bool} considerImplicitRoles - true or false based on if implicit roles setting should be considered.
     *
     * @return {node} - The descendant element that matches the role specified (only one)
     *
     * @memberOf RPTUtil
     */
    static getAllDescendantsWithRoleHidden(element: any, roleName: any, considerHiddenSetting: any, considerImplicitRoles: any): any[];
    /**
     * This function is responsible for getting All direct children in AT tree with a role (exclude none and presentation)
     *
     * @parm {element} element - parent element for which we will be checking children for
     * @return {node} - The direct child elements in AT tree that has a role
     *
     * @memberOf RPTUtil
     */
    static getDirectATChildren(element: any): HTMLElement[];
    /**
     * This function is responsible for recursively any child path till either no child or a child with a role is found (exclude none and presentation)
     *
     * @parm {element} element - parent element for which we will be checking children for
     * @return {node} - The direct child elements in AT tree
     *
     * @memberOf RPTUtil
     */
    static retrieveDirectATChildren(element: any, requiredChildRoles: any, direct: Array<HTMLElement>): any;
    /**
     * this function returns null or required child roles for a given element with one more roles,
     * return null if the role is 'none' or 'presentation'
     * @param element
     * @param includeImplicit include implicit roles if no role is explicitly provided
     * @returns
     */
    static getRequiredChildRoles(element: any, includeImplicit: boolean): string[];
    /**
     * This function is responsible for getting an element referenced by aria-owns and has the
     * role that was specified.
     *
     * Note by default this function will not consider the Check Hidden Content Setting.
     *
     * Note: This is a wrapper function to: RPTUtil.getAriaOwnsWithRoleHidden
     *
     * @parm {element} element - Element to check for aria-owns
     * @parm {string} roleName - The role to look for on the aria-owns element
     *
     * @return {node} - The element that is referenced by aria-owns and has role specified.
     *
     * @memberOf RPTUtil
     */
    static getAriaOwnsWithRole(element: any, roleName: any): any;
    /**
     * This function is responsible for getting an element referenced by aria-owns and has the
     * role that was specified. This function aslo finds elements with implicit roles.
     *
     * @parm {element} element - Element to check for aria-owns
     * @parm {string} roleName - The role to look for on the aria-owns element
     * @parm {bool} considerHiddenSetting - true or false based on if hidden setting should be considered.
     * @parm {bool} considerImplicitRoles - true or false based on if implicit roles setting should be considered.
     *
     * @return {node} - The element that is referenced by aria-owns and has role specified.
     *
     * @memberOf RPTUtil
     */
    static getAriaOwnsWithRoleHidden(element: any, roleName: any, considerHiddenSetting: any, considerImplicitRoles?: any): any;
    /** get element containing label for the given element
     * @deprecated Deprecated because the function name is misleading. Use getLabelForElement(element) instead
     */
    static getInputLabel(element: any): any;
    /**
     * This function is responsible for getting the element containing the label for the given element.
     *
     * Note: This is a wrapper function to: RPTUtil.getLabelForElementHidden
     *
     * @parm {element} element - The element for which to get the label element for.
     *
     * @return {element} element - return the element for the label, otherwise null
     *
     * @memberOf RPTUtil
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
     * @memberOf RPTUtil
     */
    static getLabelForElementHidden(element: Element, ignoreHidden: any): any;
    static getElementAttribute(element: any, attr: any): any;
    static hasAriaLabel(element: any): boolean;
    static hasImplicitLabel(element: any): boolean;
    static isFirstFormElement(parentNode: any, element: any): boolean;
    static isShadowHostElement(element: Element): boolean;
    static isShadowElement(element: Element): boolean;
    static removeAllFormElementsFromLabel(element: any): any;
    static hasUniqueAriaLabelsLocally(elements: any, isGlobal: any): boolean;
    static getAriaLabel(ele: any): any;
    static getAriaDescription(ele: any): string;
    /**
     * @param element
     * @param idStr
     * @returns true if any one (if multiple Ids) id points to itself
     */
    static isIdReferToSelf(element: any, idStr: String): boolean;
    static findAriaLabelDupes(elements: any): {};
    static hasUniqueAriaLabels(elements: any): boolean;
    static hasDuplicateAriaLabelsLocally(elements: any, isGlobal: any): false | any[];
    static hasDuplicateAriaLabels(elements: any): false | any[];
    static hasUniqueAriaLabelledby(elements: any): boolean;
    static nodeDepth(element: any): number;
    static compareNodeOrder(nodeA: any, nodeB: any): 0 | 1 | -1 | 2 | -2;
    /**
     *  Determine if the given attribute of the given element is not empty
     *  @memberOf RPTUtil
     */
    static attributeNonEmpty(element: any, attrStr: any): boolean;
    static getFrameByName(ruleContext: any, frameName: any): any;
    static defaultNSResolver(prefix: any): any;
    static isInnerTextOnlyEmpty(element: any): boolean;
    static getInnerText(element: any): any;
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
     * @memberOf RPTUtil
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
     * @memberOf RPTUtil
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
    /**
     * this function is responsible for resolving ARIA requirements for an HTML element per ARIA in HTML
     * @param ruleContext the HTML element to be examined
     * @returns
     */
    static getElementAriaProperty(ruleContext: any): IDocumentConformanceRequirement;
    static getScopeForTh(element: any): "row" | "column";
    static getAllowedAriaRoles(ruleContext: any, properties: IDocumentConformanceRequirement): string[];
    static getAllowedAriaAttributes(ruleContext: any, roles: any, properties: any): string[];
    /**
     *
     * @param ariaAttr
     * @param htmlAttrs
     * @type: conflict or overlapping
     * @returns htmlAttrName, 'Pass' or null
     *         htmlAttrName that conflicts with the ariaAttr,
     *         'Pass' with no conflict with the ariaAttr,
     *         or null where ariaAttr won't cause conflict
     */
    static getConflictOrOverlappingHtmlAttribute(ariaAttr: any, htmlAttrs: any, type: any): any[] | null;
    static containsPresentationalChildrenOnly(elem: HTMLElement): boolean;
    static shouldBePresentationalChild(element: HTMLElement): boolean;
    /** moved to CSSUtil
    public static CSS(element) {
        let styleText = "";
        if (element === null) return [];
        if (element.IBM_CSS_THB) return element.IBM_CSS_THB;
        let nodeName = element.nodeName.toLowerCase();
        if (nodeName === "style") {
            styleText = RPTUtil.getInnerText(element);
        } else if (element.hasAttribute("style")) {
            styleText = element.getAttribute("style");
        } else return [];
        if (styleText === null || styleText.trim().length === 0) return [];
        //remove comment blocks
        let re = /(\/\*+(?:(?:(?:[^\*])+)|(?:[\*]+(?!\/)))[*]+\/)|\/\/.* /g;
        let subst = ' ';
        styleText = styleText.replace(re, subst);
        // Find all "key : val;" pairs with various whitespace inbetween
        let rKeyVals = /\s*([^:\s]+)\s*:\s*([^;$}]+)\s*(;|$)/g;
        // Find all "selector { csskeyvals } with various whitespace inbetween
        let rSelectors = /\s*([^{]*){([^}]*)}/g;
        if (styleText.indexOf("{") === -1) {

            let keyVals = {};
            let m;
            while ((m = rKeyVals.exec(styleText)) != null) {
                keyVals[m[1]] = m[2].trim().toLowerCase();
            }
            let retVal = [{
                selector: null,
                values: keyVals
            }];
            element.IBM_CSS_THB = retVal;
            return retVal;
        } else {
            let retVal = [];
            let m;
            let m2;
            while ((m = rSelectors.exec(styleText)) != null) {
                let keyVals = {}
                let selKey = m[1];
                let selVal = m[2];

                while ((m2 = rKeyVals.exec(selVal)) != null) {
                    keyVals[m2[1]] = m2[2].trim().toLowerCase();
                }
                retVal.push({
                    selector: selKey,
                    values: keyVals
                });
            }
            element.IBM_CSS_THB = retVal;
            return retVal;
        }
    }
    */
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
     * @memberOf RPTUtil
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
     * @memberOf RPTUtil
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
     * @memberOf RPTUtil
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
}
/** moved to CSSUtil
export class RPTUtilStyle {
    public static getWeightNumber(styleVal) {
        let map = {
            "light": 100,
            "bold": 700
        };
        let retVal = parseInt(styleVal);
        if (retVal) return retVal;
        if (styleVal in map)
            return map[styleVal];
        return 400;
    }

    public static getFontInPixels = function (styleVal) {
        let map = {
            "xx-small": 16,
            "x-small": 10,
            "small": 13,
            "medium": 16,
            "large": 18,
            "x-large": 24,
            "xx-large": 32
        };
        let value = parseFloat(styleVal);
        if (!value) {
            return map[styleVal];
        }
        let units = styleVal.substring(("" + value).length);
        if (units === "" || units === "px") return value;
        if (units === "em") return value * 16;
        if (units === "%") return value / 100 * 16;
        if (units === "pt") return value * 4 / 3;
        return Math.round(value);
    }
}
*/
export declare class NodeWalker {
    node: Node;
    bEndTag: boolean;
    constructor(node: Node, bEnd?: boolean);
    elem(): HTMLElement | null;
    nextNode(): any;
    prevNode(): boolean;
}
