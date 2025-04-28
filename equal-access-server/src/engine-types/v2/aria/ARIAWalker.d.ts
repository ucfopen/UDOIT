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
 * Walks in an ARIA order
 *
 * See also ../dom/DOMWalker
 */
export declare class ARIAWalker {
    root: Node;
    node: Node;
    bEndTag: boolean;
    constructor(element: Node, bEnd?: boolean, root?: Node);
    atRoot(): boolean;
    nextNode(): boolean;
    prevNode(): boolean;
}
