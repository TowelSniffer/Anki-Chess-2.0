declare module '$anki/*.json' {
  const content: any;
  export default content;
}

declare module '*.webp' {
  const value: string;
  export default value;
}

declare module '*.mp3' {
  const value: string;
  export default value;
}

declare module '*?raw' {
  const value: string;
  export default value;
}
