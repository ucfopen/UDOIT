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
import { eRulePolicy } from "../api/IRule";
import { Guideline, eGuidelineCategory } from "../api/IGuideline";
import { IEngine } from "../api/IEngine";
import { Report } from "../api/IReport";
import { IChecker } from "../api/IChecker";
/**
 * @deprecated See ../api/IGuideline
 */
export type Ruleset = Guideline;
export declare class Checker implements IChecker {
    private guidelines;
    engine: IEngine;
    /**
     * @deprecated Use getGuidelines().
     */
    rulesets: Guideline[];
    /**
     * @deprecated Use getGuidelineIds().
     */
    rulesetIds: string[];
    rulesetRules: {
        [rsId: string]: string[];
    };
    ruleLevels: {
        [ruleId: string]: {
            [rsId: string]: eRulePolicy;
        };
    };
    ruleReasonLevels: {
        [ruleId: string]: {
            [rsId: string]: {
                [reasonCodes: string]: eRulePolicy;
            };
        };
    };
    ruleCategory: {
        [ruleId: string]: {
            [rsId: string]: eGuidelineCategory;
        };
    };
    constructor();
    /**
     * Adds a guideline to the engine. If the id already exists, the previous guideline will be replaced.
     * @param guideline
     */
    addGuideline(guideline: Guideline): void;
    /**
     * Enable a rule for all guidelines
     * @param ruleId
     */
    enableRule(ruleId: string): void;
    /**
     * Disable a rule for all guidelines
     * @param ruleId
     */
    disableRule(ruleId: string): void;
    /**
     * Remove a guideline from the engine
     *
     * Generally, there isn't a good reason to do this. Users should just not select the guideline as an option in check
     * @param guidelineId
     */
    private removeGuideline;
    /**
     * Get the guidelines available in the engine
     * @returns
     */
    getGuidelines(): Guideline[];
    /**
     * Get the ids of the guidelines available in the engine
     * @returns
     */
    getGuidelineIds(): string[];
    /**
     *
     * @deprecated See addGuideline
     */
    addRuleset(rs: Ruleset): void;
    /**
     * Perform a check of the specified node/document
     * @param node DOMNode or Document on which to run the check
     * @param guidelineIds Guideline ids to check with to specify which rules to run
     * @returns
     */
    check(node: Node | Document, guidelineIds?: string | string[]): Promise<Report>;
    private getLevel;
    private getReasonLevel;
    private getCategory;
}
