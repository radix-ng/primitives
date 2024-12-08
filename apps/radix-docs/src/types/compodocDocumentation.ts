export type CompoDocInterfaceType = 'interface' | 'number' | 'string' | string;
export type HTMLString = string;

export interface CompodocEntity {
    id: string;
    name: string;
    type: string;
    subtype?: string;
    rawtype?: any;
    kind?: string;
    label?: string;
    file?: string;
    sourceCode?: string;
    deprecated?: boolean;
    deprecationMessage?: string;
    rawdescription?: string;
    description?: string;
}

export interface CompodocInput extends CompodocEntity {
    line: number;
    decorators: any[];
}

export interface CompodocOutput extends CompodocEntity {
    defaultValue: string;
    line: number;
}

export interface CompodocDirective extends CompodocEntity {
    animations?: string[];
    changeDetection?: string;
    encapsulation?: string;
    entryComponents?: string;
    exampleUrls?: string[];
    exportAs?: string;
    extends?: any;
    host?: string;
    hostBindings?: any[];
    hostListeners?: any[];
    implements?: any;
    inputs?: string[];
    inputsClass?: CompodocInput[];
    interpolation?: string;
    methodsClass?: any[];
    moduleId?: string;
    outputs?: string[];
    outputsClass?: CompodocOutput[];
    propertiesClass?: any[];
    queries?: any[];
    selector?: string;
    styleUrls?: string[];
    styles?: string[];
    template?: string;
    templateUrl?: string[];
    viewProviders?: any[];
}

export type CompodocComponent = CompodocDirective;

export interface CompodocDocumentation {
    classes?: any[];
    directives: CompodocDirective[];
}

export interface CompoDocInterfaceProperty {
    name: string;
    deprecated: boolean;
    deprecationMessage: string;
    type: CompoDocInterfaceType;
    optional: boolean;
    description: HTMLString;
    jsdoctags: {
        comment: HTMLString; // @default 123 -> "<p>123</p>"
        kind: number;
        deprecated: boolean;
        tagName: {
            escapedText: string; // @default 123 -> default
            text: string;
            kind: number;
        };
    }[];
    line: number;
}
