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
/**
 * Walks in a DOM order
 *
 * Assumption that nodes of shadow DOMs call assignSlots on the shadow root before
 * doing other processing in that tree. If you walk into a shadow root, the DOMWalker
 * will do it automatically.
 *
 * See also ../aria/ARIAWalker
 */
export declare class DOMWalker {
    root: Node;
    node: Node;
    bEndTag: boolean;
    considerHidden: boolean;
    DEBUG: boolean;
    constructor(element: Node, bEnd?: boolean, root?: Node, considerHidden?: boolean, DEBUG?: boolean);
    elem(): HTMLElement | null;
    static parentNode(node: Node): Node | null;
    static parentElement(node: Node): Element | null;
    static assignSlots(root: ShadowRoot): void;
    static firstChildNotOwnedBySlot(node: Node): ChildNode;
    static lastChildNotOwnedBySlot(node: Node): ChildNode;
    static nextSiblingNotOwnedBySlot(node: Node): ChildNode;
    static previousSiblingNotOwnedBySlot(node: Node): ChildNode;
    atRoot(): boolean;
    DEBUGIDX: number;
    indent: number;
    nextNode(): boolean;
    prevNode(): boolean;
}
