declare enum ExitCode {
    NoUnusedExportsFound = 0,
    UnusedExportsFound = 1,
    BadArgsOrException = 2
}
export declare const runCli: (exitWith: (code: ExitCode) => ExitCode, showError: (s: unknown) => void, showMessage: (s: string) => void, [tsconfig, ...tsFiles]: string[]) => ExitCode;
export {};
