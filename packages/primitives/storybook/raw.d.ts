// Vite/AnalogJS `?raw` imports return the file contents as a string. Used in
// stories to feed full component source into `parameters.docs.source.code`.
declare module '*?raw' {
    const content: string;
    export default content;
}
