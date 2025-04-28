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
import { Context } from "./Context";
import { Issue, Rule, RuleContext, RuleContextHierarchy } from "../../v4/api/IRule";
import { HelpMap, IEngine, NlsMap } from "../../v4/api/IEngine";
import { IMapper } from "../../v4/api/IMapper";
import { Report } from "../../v4/api/IReport";
declare class WrappedRule {
    rule: Rule;
    parsedInfo: Context;
    ns: string;
    idx?: number;
    constructor(rule: Rule, parsedInfo: Context);
    /**
     * This function is responsible converting the node into a snippet which can be added to report.
     *
     * Note: This function will take the node and extract the node name and the attributes and build the snippet based on this.
     *
     * TODO: Future, maybe we can extract more then just single line, add more info or even add closing tags etc...
     *
     * @param {HTMLElement} node - The html element to convert into element snippet with node name and attributes only.
     *
     * @return {String} nodeSnippet - return the element snippet of the element that was provided which only contains,
     *                                nodename and attributes. i.e. <table id=\"layout_table1\" role=\"presentation\">
     *
     * @memberOf this
     */
    static convertNodeToSnippet(node: Element): string;
    run(engine: Engine, context: RuleContext, options?: {}, contextHierarchies?: RuleContextHierarchy): Issue[];
}
export declare class Engine implements IEngine {
    static getLanguages(): readonly string[];
    mappers: {
        [namespace: string]: IMapper;
    };
    ruleMap: {
        [id: string]: Rule;
    };
    wrappedRuleMap: {
        [id: string]: WrappedRule;
    };
    nlsMap: NlsMap;
    helpMap: HelpMap;
    private inclRules;
    private exclRules;
    constructor();
    run(root: Document | Node, options?: {}): Promise<Report>;
    enableRules(ruleIds: string[]): void;
    getRule(ruleId: string): Rule;
    getRulesIds(): string[];
    addRules(rules: Rule[]): void;
    addRule(rule: Rule, skipSort?: boolean): void;
    _sortRules(): void;
    addNlsMap(map: NlsMap): void;
    addHelpMap(map: HelpMap): void;
    getMessage(ruleId: string, ruleIdx: number | string, msgArgs?: string[]): string;
    getHelp(ruleId: string, reasonId: number | string, archiveId?: string): string;
    getHelpRel(ruleId: string, ruleIdx: number | string): string;
    addMapper(mapper: IMapper): void;
    private static match;
    private getMatchingRules;
    /**
     * Sorts the rules in order to execute dependencies in the correct order
     * @param inRules List of wrapped rules to sort
     * @returns Sorted list of wrapped rules
     */
    sortDeps(inRules: WrappedRule[]): WrappedRule[];
}
export {};
