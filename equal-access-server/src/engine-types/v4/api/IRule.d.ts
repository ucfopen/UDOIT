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
import { eGuidelineCategory } from "./IGuideline";
import { IMapResult } from "./IMapper";
import { NlsMap as NlsMapNew, HelpMap as HelpMapNew, IEngine as IEngineNew } from "./IEngine";
import { Report as ReportNew } from "./IReport";
import { eToolkitLevel as eToolkitLevelNew } from "./IGuideline";
import { Bounds } from "./IBounds";
export declare enum eRuleConfidence {
    PASS = "PASS",
    FAIL = "FAIL",
    POTENTIAL = "POTENTIAL",
    MANUAL = "MANUAL"
}
export declare enum eRulePolicy {
    VIOLATION = "VIOLATION",
    RECOMMENDATION = "RECOMMENDATION",
    INFORMATION = "INFORMATION"
}
export declare function RulePass(reasonId: number | string, messageArgs?: string[], apiArgs?: any[]): RuleResult;
export declare function RuleRender(reasonId: number | string, messageArgs?: string[], apiArgs?: any[]): RuleResult;
export declare function RuleFail(reasonId: number | string, messageArgs?: string[], apiArgs?: any[]): RuleResult;
export declare function RulePotential(reasonId: number | string, messageArgs?: string[], apiArgs?: any[]): RuleResult;
export declare function RuleManual(reasonId: number | string, messageArgs?: string[], apiArgs?: any[]): RuleResult;
export type RuleResult = {
    value: [eRulePolicy, eRuleConfidence];
    reasonId?: number | string;
    messageArgs?: string[];
    apiArgs?: any[];
};
export type Issue = RuleResult & {
    ruleId: string;
    node: Node;
    category?: eGuidelineCategory;
    path: {
        [ns: string]: string;
    };
    ruleTime: number;
    message: string;
    bounds?: Bounds;
    snippet: string;
};
export type RuleContextHierarchy = {
    [namespace: string]: IMapResult[];
};
export type RuleContext = {
    [namespace: string]: IMapResult;
};
export type Rule = {
    id: string;
    rulesets: Array<{
        id: string | string[];
        num: string | string[];
        level: eRulePolicy;
        toolkitLevel: eToolkitLevelNew;
        reasonCodes?: string[];
    }>;
    refactor?: {
        [oldRuleId: string]: {
            [oldReasonCode: string]: string;
        };
    };
    messages: {
        [locale: string]: {
            [reasonId: string]: string;
        };
    };
    help: {
        [locale: string]: {
            [reasonId: string]: string;
        };
    };
    /**
     * How this rule maps to ACT rules, if any (https://act-rules.github.io/rules/)
     *
     * string: For a single rule mapping that matches exactly to the rule (Pass -> pass, Potential -> cantTell, Fail -> fail, unlisted => inapplicable)
     * Array<>: Custom mapping of rule to ACT results
     */
    act?: string | string[] | Array<string | {
        [actRuleId: string]: {
            [reasonId: string]: "pass" | "fail" | "cantTell" | "inapplicable";
        };
    }>;
    context: string;
    dependencies?: string[];
    run: (context: RuleContext, options?: {}, contextHierarchies?: RuleContextHierarchy) => RuleResult | RuleResult[] | null;
    enabled?: boolean;
};
/**
 * @deprecated
 */
export type RuleDetails = Issue;
/**
 * @deprecated See IEngine
 */
export type Report = ReportNew;
/**
 * @deprecated See IEngine
 */
export type NlsMap = NlsMapNew;
/**
 * @deprecated See IEngine
 */
export type HelpMap = HelpMapNew;
/**
 * @deprecated See ./IEngine
 */
export type IEngine = IEngineNew;
/**
 * @deprecated See ./IGuideline
 */
export { eToolkitLevel } from "./IGuideline";
/**
 * @deprecated See ./IGuideline:eGuidelineCategory
 */
export { eGuidelineCategory as eRuleCategory } from "./IGuideline";
/**
 * @deprecated See ./IGuideline:eGuidelineType
 */
export { eGuidelineType as eRulesetType } from "./IGuideline";
