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
import { IMapper, IMapResult, Bounds } from "../api/IMapper";
export declare abstract class CommonMapper implements IMapper {
    abstract getRole(node: Node): string;
    abstract getNamespace(): string;
    abstract getAttributes(node: Node): {
        [key: string]: string;
    };
    protected hierarchyRole: string[];
    protected hierarchyPath: Array<{
        rolePath: string;
        roleCount: {
            [role: string]: number;
        };
    }>;
    protected hierarchyResults: IMapResult[];
    getBounds(node: Node): Bounds;
    reset(node: Node): void;
    protected pushHierarchy(node: Node): void;
    protected popHierarchy(): void;
    openScope(node: Node): IMapResult[];
    closeScope(node: Node): IMapResult[];
}
