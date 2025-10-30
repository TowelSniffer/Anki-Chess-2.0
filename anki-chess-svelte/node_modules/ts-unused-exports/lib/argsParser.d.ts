import { ExtraCommandLineOptions } from './types';
declare type TsFilesAndOptions = {
    tsFiles?: string[];
    options?: ExtraCommandLineOptions;
};
export declare function extractOptionsFromFiles(files?: string[]): TsFilesAndOptions;
export declare function hasValidArgs(showError: (s: string) => void, tsconfig: string, tsFiles: string[]): boolean;
export {};
