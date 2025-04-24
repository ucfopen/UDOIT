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
export interface CacheDocument extends Document {
    aceCache: {
        [key: string]: any;
    };
}
export interface CacheElement extends Element {
    aceCache: {
        [key: string]: any;
    };
}
export declare class CacheUtil {
    static getCache(cacheSpot: Element | Document | DocumentFragment, keyName: any, initValue: any): any;
    static setCache(cacheSpot: Document | Element | DocumentFragment | ShadowRoot, globalName: any, value: any): any;
    static clearCaches(cacheRoot: Node): void;
}
