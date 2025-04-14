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
import { IMapResult } from "../api/IMapper";
import { RuleContextHierarchy } from "../api/IEngine";
export declare class AttrInfo {
    inclusive: boolean;
    attr: string;
    eq?: string;
    value?: string;
    constructor(inclusive: boolean, attr: string, eq?: string, value?: string);
    matches(context: IMapResult): boolean;
}
export declare class PartInfo {
    inclusive: boolean;
    namespace: string;
    role: string;
    attrs: AttrInfo[];
    connector: string;
    constructor(inclusive: boolean, namespace: string, role: string, attrs: AttrInfo[], connector: string);
    matches(contextHier: RuleContextHierarchy, hierLevel: number): boolean;
}
export declare class Context {
    contextInfo: PartInfo[];
    constructor(context: string);
    static cleanContext(context: string): string;
    static parse(context: string): Context[];
    /**
     * Handles initial processing of splitting on comma - context,context
     * @param context
     */
    static splitMultiple(context: string): string[];
}
