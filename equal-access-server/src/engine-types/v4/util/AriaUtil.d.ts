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
import { IDocumentConformanceRequirement } from "../../v2/aria/ARIADefinitions";
export declare class AriaUtil {
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
            form: (e: any) => "both" | "none";
            input: (e: any) => "both" | "none";
            select: (e: any) => "both" | "none";
            textarea: (e: any) => "both" | "none";
        };
        "aria-checked": {
            input: (e: any) => string;
            menuitem: (e: any) => string;
            "*": (e: any) => string;
        };
        "aria-disabled": {
            button: (e: any) => "false" | "true";
            fieldset: (e: any) => "false" | "true";
            input: (e: any) => "false" | "true";
            optgroup: (e: any) => "false" | "true";
            option: (e: any) => "false" | "true";
            select: (e: any) => "false" | "true";
            textarea: (e: any) => "false" | "true";
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
    static isDefinedAriaAttribute(ele: any, attrName: any): boolean;
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
     * @memberOf AriaUtil
     */
    static getResolvedRole(elem: Element, considerImplicitRoles?: boolean): string;
    /**
     * This function is responsible for retrieving user defined element's roles from dom.
     * @parm {HTMLElement} ele - element for which to find role.
     *
     * @return {List} roles - list of user defined roles in the element role attribute.
     *
     * @memberOf AriaUtil
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
     * @memberOf AriaUtil
     */
    static getRoles(ele: Element, considerImplicitRoles: boolean): string[];
    /**
     * Returns the implicit role of the elemement
     * @parm {HTMLElement} ele - element for which to find role.
     *
     * @return the implicit role or [] if doesn't exist
     *
     * @memberOf AriaUtil
     */
    static getImplicitRole(ele: any): string[];
    /**
     * Returns the required properties of the role
     * @parm {string} role - the role
     * @parm {HTMLElement} ele - element for which to find role.
     *
     * @return {List} properties - list of properties that are required by the role
     *
     * @memberOf AriaUtil
     */
    static getRoleRequiredProperties(role: any, ele: any): string[];
    /**
     * This function is responsible for finding if a element has given role.
     * This function aslo finds if element has given roles as implicit role.
     * @parm {HTMLElement} ele - element for which to find role.
     * @parm {list or string} roles - List or single role for which to find if element has these roles.
     * @parm {bool} considerImplicitRoles - true or false based on if implicit roles setting should be considered.
     *
     * @return {List} retVal - true or false based on if th element has the specified role.
     *
     * @memberOf AriaUtil
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
     * @memberOf AriaUtil
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
     * @memberOf AriaUtil
     */
    static hasAnyRole(ele: any, considerImplicitRoles: any): boolean;
    static isPresentationalElement(node: any): boolean;
    /**
     * return the ancestor of the given element and role.
     *
     * @parm {element} element - The element to start the node walk on to find parent node
     * @parm {string} role - The role to search for on an element under the provided element
     * @parm {bool} considerImplicitRoles - true or false based on if implicit roles setting should be considered.
     *
     * @return {node} walkNode - A parent node of the element passed in, which has the provided role
     *
     * @memberOf AriaUtil
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
     * @memberOf AriaUtil
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
     * @memberOf AriaUtil
     */
    static getRolesWithTypes(element: any, types: string[]): any;
    /**
     * return the roles with given role type.
     *
     * @parm {element} element - The element to start the node walk on to find parent node
     * @parm {array} roleTyples - role types, such as 'widget', 'structure' etc.
     *
     * @return {array} roles - A parent node of the element passed in, which has the provided role
     *
     * @memberOf AriaUtil
     */
    static isWidget(element: any): any;
    /**
     * This function is responsible for finding a node which matches the role and is a sibling of the
     * provided element.
     *
     * This function by default will not consider Check Hidden Setting at all.
     *
     * Note: This is a wrapper function to: AriaUtil.getSiblingWithRoleHidden
     *
     * @parm {element} element - The element to start the node walk on to find sibling node
     * @parm {string} role - The role to search for on an element under the provided element
     *
     * @return {node} walkNode - A sibling node of the element passed in, which has the provided role
     *
     * @memberOf AriaUtil
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
     * @memberOf AriaUtil
     */
    static getSiblingWithRoleHidden(element: any, role: any, considerHiddenSetting: any, considerImplicitRole?: any): any;
    /**
     * This function is responsible for getting a descendant element with the specified role, under
     * the element that was provided.
     *
     * Note by default this function will not consider the Check Hidden Content Setting.
     *
     * Note: This is a wrapper function to: AriaUtil.getDescendantWithRoleHidden
     *
     * @parm {element} element - parent element for which we will be checking descendants for
     * @parm {string} roleName - The role to look for on the descendant's elements
     *
     * @return {node} - The descendant element that matches the role specified (only one)
     *
     * @memberOf AriaUtil
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
     * @memberOf AriaUtil
     */
    static getDescendantWithRoleHidden(element: any, roleName: any, considerHiddenSetting: any, considerImplicitRoles?: any): any;
    /**
     * This function is responsible for getting All descendant elements with the specified roles, under
     * the element that was provided. This function aslo finds elements with implicit roles.
     *
     * @parm {element} element - parent element for which we will be checking descendants for
     * @parm {string[]} roleNames - The roles to look for on the descendant's elements
     * @parm {bool} considerHiddenSetting - true or false based on if hidden setting should be considered.
     * @parm {bool} considerImplicitRoles - true or false based on if implicit roles setting should be considered.
     *
     * @return {node[]} - all descendant elements that match the roles specified
     *
     * @memberOf AriaUtil
     */
    static getAllDescendantsWithRoles(element: any, roleNames: string[], considerHiddenSetting: any, considerImplicitRoles: any): any[];
    /**
     * This function is responsible for getting All descendant elements with the specified role, under
     * the element that was provided. This function aslo finds elements with implicit roles.
     *
     * @parm {element} element - parent element for which we will be checking descendants for
     * @parm {string} roleName - The role to look for on the descendant's elements
     * @parm {bool} considerHiddenSetting - true or false based on if hidden setting should be considered.
     * @parm {bool} considerImplicitRoles - true or false based on if implicit roles setting should be considered.
     *
     * @return {node[]} - The descendant elements that match the role specified
     *
     * @memberOf AriaUtil
     */
    static getAllDescendantsWithRoleHidden(element: any, roleName: string, considerHiddenSetting: any, considerImplicitRoles: any): any[];
    /**
     * This function is responsible for getting All direct children in AT tree with a role (exclude none and presentation)
     *
     * @parm {element} element - parent element for which we will be checking children for
     * @return {node} - The direct child elements in AT tree that has a role
     *
     * @memberOf AriaUtil
     */
    static getDirectATChildren(element: any): HTMLElement[];
    /**
     * This function is responsible for recursively any child path till either no child or a child with a role is found (exclude none and presentation)
     *
     * @parm {element} element - parent element for which we will be checking children for
     * @return {node} - The direct child elements in AT tree
     *
     * @memberOf AriaUtil
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
     * Note: This is a wrapper function to: AriaUtil.getAriaOwnsWithRoleHidden
     *
     * @parm {element} element - Element to check for aria-owns
     * @parm {string} roleName - The role to look for on the aria-owns element
     *
     * @return {node} - The element that is referenced by aria-owns and has role specified.
     *
     * @memberOf AriaUtil
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
     * @memberOf AriaUtil
     */
    static getAriaOwnsWithRoleHidden(element: any, roleName: any, considerHiddenSetting: any, considerImplicitRoles?: any): any;
    static hasAriaLabel(element: any): boolean;
    static hasUniqueAriaLabelsLocally(elements: any, isGlobal: any): boolean;
    static getAriaLabel(ele: any): any;
    static getAriaDescription(ele: any): any;
    static findAriaLabelDupes(elements: any): {};
    static hasUniqueAriaLabels(elements: any): boolean;
    static hasDuplicateAriaLabelsLocally(elements: any, isGlobal: any): false | any[];
    static hasDuplicateAriaLabels(elements: any): false | any[];
    static hasUniqueAriaLabelledby(elements: any): boolean;
    /**
     * this function is responsible for resolving ARIA requirements for an HTML element per ARIA in HTML
     * @param ruleContext the HTML element to be examined
     * @returns
     */
    static getElementAriaProperty(ruleContext: any): IDocumentConformanceRequirement;
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
    static areRolesDefined(roles: string[]): boolean;
    static getInvalidRoles(ruleContext: Element): any[];
    static getRolesUndefinedByAria(element: Element): any[];
    static getInvalidAriaAttributes(ruleContext: Element): string[];
    static getConflictAriaAndHtmlAttributes(elem: Element): any[];
    static getDeprecatedAriaRoles(element: Element): any[];
    static getDeprecatedAriaAttributes(element: Element): any[];
    static isNodeInGrid(node: any): boolean;
}
