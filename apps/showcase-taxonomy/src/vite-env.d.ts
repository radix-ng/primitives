/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_ANALOG_PUBLIC_BASE_URL: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}

interface ImportAttributes {
    analog: 'imports' | 'providers' | 'viewProviders' | 'exposes';
}

declare global {
    import type { Component } from '@angular/core';

    interface Window {
        /**
         * Define the metadata for the component.
         * @param metadata
         */
        defineMetadata: (
            metadata: Omit<
                Component,
                | 'template'
                | 'templateUrl'
                | 'host'
                | 'standalone'
                | 'changeDetection'
                | 'styleUrls'
                | 'styleUrl'
                | 'styles'
            > & { exposes?: unknown[] }
        ) => void;
        /**
         * Invoke the callback when the component is initialized.
         */
        onInit: () => void;
        /**
         * Invoke the callback when the component is destroyed.
         */
        onDestroy: () => void;
    }
}

declare module '*.analog' {
    const cmp = any;
    export default cmp;
}
