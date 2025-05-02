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
export type IDocumentConformanceRequirement = {
    implicitRole: string[];
    validRoles: string[];
    globalAriaAttributesValid: boolean;
    otherAllowedAriaAttributes?: string[];
    otherDisallowedAriaAttributes?: string[];
    otherRolesForAttributes?: string[];
    allowAttributesFromImplicitRole?: boolean;
    prohibitedAriaAttributesWhenNoImplicitRole?: string[];
};
export declare class ARIADefinitions {
    static nameFromContent(role: string): boolean;
    static globalProperties: string[];
    static referenceProperties: string[];
    static globalDeprecatedRoles: string[];
    static globalDeprecatedProperties: string[];
    static propertyDataTypes: {
        [prop: string]: {
            type: string;
            hiddenIDRefSupported?: boolean;
            values?: string[];
        };
    };
    static designPatterns: {
        [role: string]: {
            container: string[];
            props: string[];
            reqProps: string[];
            reqChildren: string[];
            htmlEquiv: string;
            roleType?: string;
            nameRequired?: boolean;
            nameFrom?: string[];
            presentationalChildren?: boolean;
            deprecated?: boolean;
            deprecatedProps?: string[];
            prohibitedProps?: string[];
        };
    };
    static elementsAllowedDisabled: string[];
    static elementsAllowedRequired: string[];
    static elementsAllowedReadOnly: string[];
    static documentConformanceRequirement: {
        [role: string]: IDocumentConformanceRequirement;
    };
    static documentConformanceRequirementSpecialTags: {
        [role: string]: {
            [key: string]: IDocumentConformanceRequirement;
        } | IDocumentConformanceRequirement;
    };
    static relatedAriaHtmlAttributes: {
        [ariaAttr: string]: {
            conflict: {
                ariaAttributeValue: string | null;
                htmlAttributeNames: string[];
                htmlAttributeValues: string[] | null;
            }[];
            overlapping?: {
                ariaAttributeValue: string | null;
                htmlAttributeNames: string[];
                htmlAttributeValues: string[] | null;
            }[];
        };
    };
    static containers: any[];
}
