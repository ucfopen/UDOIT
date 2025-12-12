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
export declare function areRolesDefined(roles: string[]): boolean;
export declare function getInvalidRoles(ruleContext: Element): any[];
export declare function getRolesUndefinedByAria(element: Element): any[];
export declare function getInvalidAriaAttributes(ruleContext: Element): string[];
export declare function getConflictAriaAndHtmlAttributes(elem: Element): any[];
export declare function isTableDescendant(contextHierarchies?: RuleContextHierarchy): import("../api/IMapper").IMapResult[];
export declare function getDeprecatedAriaRoles(element: Element): any[];
export declare function getDeprecatedAriaAttributes(element: Element): any[];
export declare function containsCKJ(text: string): boolean;
