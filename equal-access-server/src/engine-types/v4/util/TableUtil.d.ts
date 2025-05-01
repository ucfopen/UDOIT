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
import { RuleContextHierarchy } from "../api/IRule";
export declare class TableUtil {
    static isDataTable(tableNode: any): boolean;
    static isComplexDataTable(table: any): boolean;
    static isTableCellEmpty(cell: any): boolean;
    static isTableRowEmpty(row: any): boolean;
    static tableHeaderExists(ruleContext: any): boolean;
    static isLayoutTable(tableNode: any): boolean;
    static isTableDescendant(contextHierarchies?: RuleContextHierarchy): import("../api/IMapper").IMapResult[];
}
