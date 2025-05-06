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
export { Context } from "./v2/common/Context";
import { Checker } from "./v4/checker/Checker";
export { Checker };
export { ARIAMapper } from "./v2/aria/ARIAMapper";
export { Config } from "./v2/config/Config";
export { DOMWalker } from "./v2/dom/DOMWalker";
export declare function checkDemo(timeout?: number): void;
