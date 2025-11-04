type NagValue = [string, string] | [string, string, string];

export type NagKey = `$${number}`;

export type NagMap = Record<NagKey, NagValue>;
