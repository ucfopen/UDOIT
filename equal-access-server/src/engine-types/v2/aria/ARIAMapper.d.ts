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
import { CommonMapper } from "../common/CommonMapper";
import { IMapResult } from "../../v4/api/IMapper";
type ElemCalc = (elem: Element) => string;
type NodeCalc = (node: Node) => string;
export declare class ARIAMapper extends CommonMapper {
    childrenCanHaveRole(node: Node, role: string): boolean;
    getRole(node: Node): string;
    getNamespace(): string;
    getAttributes(node: Node): {
        [key: string]: string;
    };
    static getAriaOwnedBy(elem: HTMLElement): HTMLElement | null;
    private getNodeHierarchy;
    reset(node: Node): void;
    openScope(node: Node): IMapResult[];
    pushHierarchy(node: Node): void;
    closeScope(node: Node): IMapResult[];
    static elemAttrValueCalculators: {
        [nodeName: string]: {
            [attr: string]: string | ElemCalc;
        };
    };
    static textAttrValueCalculators: {
        [attr: string]: NodeCalc;
    };
    private static nameComputationId;
    /**public static computeName(cur: Node) : string {
        ++ARIAMapper.nameComputationId;
        return ARIAMapper.computeNameHelp(ARIAMapper.nameComputationId, cur, false, false);
    }

    public static computeNameHelp(walkId: number, cur: Node, labelledbyTraverse: boolean, walkTraverse: boolean) : string {
        // 2g. None of the other content applies to text nodes, so just do this first
        if (cur.nodeType === 3 ) return cur.nodeValue;
        if (cur.nodeType === 11) return "";
        if (cur.nodeType !== 1 ) {
            if (walkTraverse || labelledbyTraverse) return "";
            throw new Error ("Can only compute name on Element and Text " + cur.nodeType);
        }

        const elem = cur as Element;
        // We've been here before - prevent recursion
        if (CacheUtil.getCache(elem, "data-namewalk", null) === ""+walkId) return "";
        CacheUtil.setCache(elem, "data-namewalk", ""+walkId);
        // See https://www.w3.org/TR/html-aam-1.0/#input-type-text-input-type-password-input-type-search-input-type-tel-input-type-url-and-textarea-element

        // 2a. Only show hidden content if it's referenced by a labelledby
        if (!labelledbyTraverse && !VisUtil.isNodeVisible(cur)) {
            return "";
        }

        // 2b. collect valid id references
        if (!labelledbyTraverse && elem.hasAttribute("aria-labelledby")) {
            let labelledby = elem.getAttribute("aria-labelledby").split(" ");
            let validElems = [];
            for (const ref of labelledby) {
                const refElem = FragmentUtil.getById(cur, ref);
                if (refElem && !DOMUtil.sameNode(elem, refElem)) {
                    validElems.push(refElem);
                }
            }
            if (validElems.length > 0) {
                let accumulated = "";
                for (const elem of validElems) {
                    accumulated += " " + this.computeNameHelp(walkId, elem, true, false);
                }
                return accumulated.trim();
            }
        }

        // Since nodeToRole calls back here for form and section, we need special casing here to handle those two cases
        if (["section", "form"].includes(cur.nodeName.toLowerCase())) {
            if (elem.hasAttribute("aria-label") && elem.getAttribute("aria-label").trim().length > 0) {
                // If I'm not an embedded control or I'm not recursing, return the aria-label
                if (!labelledbyTraverse && !walkTraverse) {
                    return elem.getAttribute("aria-label").trim();
                }
            }
            if (elem.hasAttribute("title")) {
                return elem.getAttribute("title");
            }
            return "";
        }

        // 2c. If label or walk, and this is a control, skip to the value, otherwise provide the label
        const role = ARIAMapper.nodeToRole(cur);
        let isEmbeddedControl = [
            "textbox", "button", "combobox", "listbox",
            "progressbar", "scrollbar", "slider", "spinbutton"
        ].includes(role);
        if (elem.hasAttribute("aria-label") && elem.getAttribute("aria-label").trim().length > 0) {
            // If I'm not an embedded control or I'm not recursing, return the aria-label
            if (!labelledbyTraverse && !walkTraverse || !isEmbeddedControl) {
                return elem.getAttribute("aria-label").trim();
            }
        }

        // 2d.
        if (role !== "presentation" && role !== "none") {
            if ((cur.nodeName.toLowerCase() === "img" || cur.nodeName.toLowerCase() === "area") && elem.hasAttribute("alt")) {
                return DOMUtil.cleanWhitespace(elem.getAttribute("alt")).trim();
            }

            if (cur.nodeName.toLowerCase() === "input" && elem.hasAttribute("id") && elem.getAttribute("id").length > 0) {
                let label = elem.ownerDocument.querySelector("label[for='"+elem.getAttribute("id")+"']");
                if (label) {
                    if (label.hasAttribute("aria-label") || (label.hasAttribute("aria-labelledby") && !CommonUtil.isIdReferToSelf(cur, label.getAttribute("aria-labelledby")))) {
                        return this.computeNameHelp(walkId, label, false, false);
                    } else {
                        return label.textContent;
                    }
                }
            }
            if (cur.nodeName.toLowerCase() === "fieldset") {
                if( (<Element>cur).querySelector("legend")){
                    let legend = (<Element>cur).querySelector("legend");
                    return legend.innerText;
                }else{
                    return this.computeNameHelp(walkId, cur, false, false);
                }
                            
            }
            
        }

        // 2e.
        if ((walkTraverse || labelledbyTraverse) && isEmbeddedControl) {
            // If the embedded control has role textbox, return its value.
            if (role === "textbox") {
                if (elem.nodeName.toLowerCase() === "input") {
                    if (elem.hasAttribute("value")) return elem.getAttribute("value");
                } else {
                    walkTraverse = false;
                }
            }

            // If the embedded control has role button, return the text alternative of the button.
            if (role === "button") {
                if (elem.nodeName.toLowerCase() === "input") {
                    let type = elem.getAttribute("type").toLowerCase();
                    if (["button", "submit", "reset"].includes(type)) {
                        if (elem.hasAttribute("value")) return elem.getAttribute("value");
                        if (type === "submit") return "Submit";
                        if (type === "reset") return "Reset";
                    }
                } else {
                    walkTraverse = false;
                }
            }

            // TODO: If the embedded control has role combobox or listbox, return the text alternative of the chosen option.
            if (role === "combobox") {
                if (elem.hasAttribute("aria-activedescendant")) {
                    let selected = FragmentUtil.getById(elem, "aria-activedescendant");
                    if (selected && !DOMUtil.sameNode(elem, selected)) {
                        return ARIAMapper.computeNameHelp(walkId, selected, false, false);
                    }
                }
            }

            // If the embedded control has role range (e.g., a spinbutton or slider):
            if (["progressbar", "scrollbar", "slider", "spinbutton"].includes(role)) {
                // If the aria-valuetext property is present, return its value,
                if (elem.hasAttribute("aria-valuetext")) return elem.getAttribute("aria-valuetext");
                // Otherwise, if the aria-valuenow property is present, return its value,
                if (elem.hasAttribute("aria-valuenow")) return elem.getAttribute("aria-valuenow");
                // TODO: Otherwise, use the value as specified by a host language attribute.
            }
        }

        // 2f. 2h.
        if (walkTraverse || ARIADefinitions.nameFromContent(role) || labelledbyTraverse) {
            // 2fi. Set the accumulated text to the empty string.
            let accumulated = "";
            // 2fii. Check for CSS generated textual content associated with the current node and
            // include it in the accumulated text. The CSS :before and :after pseudo elements [CSS2]
            // can provide textual content for elements that have a content model.
            //   For :before pseudo elements, User agents MUST prepend CSS textual content, without
            //     a space, to the textual content of the current node.
            //   For :after pseudo elements, User agents MUST append CSS textual content, without a
            //     space, to the textual content of the current node.
            let before = null;
            before = elem.ownerDocument.defaultView.getComputedStyle(elem,"before").content;

            if (before && before !== "none") {
                before = before.replace(/^"/,"").replace(/"$/,"");
                accumulated += before;
            }
            // 2fiii. For each child node of the current node:
            //   Set the current node to the child node.
            //   Compute the text alternative of the current node beginning with step 2. Set the result
            //     to that text alternative.
            //   Append the result to the accumulated text.
            if (elem.nodeName.toUpperCase() === "SLOT") {
                //if no assignedNode, check its own text
                if (!(elem as HTMLSlotElement).assignedNodes() || (elem as HTMLSlotElement).assignedNodes().length === 0) {
                    let innerText = CommonUtil.getInnerText(elem);
                    if (innerText && innerText !== null && innerText.trim().length > 0)
                        accumulated +=  " " + innerText;
                } else {
                    // check text from all assigned nodes
                    for (const slotChild of (elem as HTMLSlotElement).assignedNodes()) {
                        let nextChildContent = ARIAMapper.computeNameHelp(walkId, slotChild, labelledbyTraverse, true);
                        accumulated += " " + nextChildContent;
                    }
                }
            } else {
                let walkChild = elem.firstChild;
                while (walkChild) {
                    let nextChildContent = ARIAMapper.computeNameHelp(walkId, walkChild, labelledbyTraverse, true);
                    accumulated += " " + nextChildContent;
                    walkChild = walkChild.nextSibling;
                }
            }

            let after = null;
            try {
                after = elem.ownerDocument.defaultView.getComputedStyle(elem,"after").content;
            } catch (e) {}

            if (after && after !== "none") {
                after = after.replace(/^"/,"").replace(/"$/,"");
                accumulated += after;
            }
            // 2fiv. Return the accumulated text.
            accumulated = accumulated.replace(/\s+/g," ").trim();
            if (accumulated.trim().length > 0) {
                return accumulated;
            }
        }

        // 2i. Otherwise, if the current node has a Tooltip attribute, return its value.
        if (elem.hasAttribute("title")) {
            return elem.getAttribute("title");
        }
        if (elem.tagName.toLowerCase() === "svg") {
            let title = elem.querySelector("title");
            if (title) {
                return title.textContent || title.innerText;
            }
        }

        return "";
    }
    */
    static nodeToRole(node: Node): string;
}
export {};
