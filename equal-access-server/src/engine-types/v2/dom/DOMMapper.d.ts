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
import { Bounds } from "../api/IMapper";
export declare class DOMMapper extends CommonMapper {
    getRole(node: Node): string;
    getNamespace(): string;
    getAttributes(node: Node): {
        [key: string]: string;
    };
    /**
     * get scaled bounds for screenshot etc. adjusted for devicePixelRatio and scroll
     * @param node
     * @returns
     */
    getBounds(node: Node): Bounds;
    /**
     * get real CSS bounds in css pixels, adjusted for scroll only
     * @param node
     * @returns
     */
    getUnadjustedBounds(node: Node): Bounds;
}
