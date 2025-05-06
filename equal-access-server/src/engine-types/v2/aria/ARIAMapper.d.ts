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
    static computeName(cur: Node): string;
    static computeNameHelp(walkId: number, cur: Node, labelledbyTraverse: boolean, walkTraverse: boolean): string;
    static nodeToRole(node: Node): string;
}
export {};
