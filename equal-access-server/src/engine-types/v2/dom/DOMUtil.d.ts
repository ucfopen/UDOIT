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
export declare class DOMUtil {
    static hasParent(node: Node, names: string[]): boolean;
    static getAncestor(node: Node, names: string[]): Element;
    static sameNode(a: Node, b: Node): boolean;
    static cleanWhitespace(s: string): string;
    static cleanSpace(s: string): string;
    static isInSameTable(element1: any, element2: any): boolean;
    static shadowRootNode(node: Node): Node | null;
    /**
     * Copies objects, but retains Node attributes as references
     * @param rhs
     */
    static objectCopyWithNodeRefs(rhs: any): any;
    static getAncestorWithAttribute(element: any, attrName: any, attrValue: any): Node;
}
