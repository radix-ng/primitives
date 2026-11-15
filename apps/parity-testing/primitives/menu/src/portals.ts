export const portalCases = [
    'portal-shadow',
    'portal-shadow-keep',
    'portal-shadow-ref',
    'portal-shadow-switch',
    'portal-frame',
    'portal-frame-keep',
    'portal-frame-ref',
    'portal-frame-switch',
    'portal-shadow-pointer',
    'portal-frame-pointer'
] as const;

export function portalConfig(name: string) {
    if (!(portalCases as readonly string[]).includes(name)) return undefined;
    return {
        frame: name.includes('-frame'),
        retained: name.endsWith('-keep'),
        ref: name.endsWith('-ref'),
        switchTarget: name.endsWith('-switch'),
        pointer: name.endsWith('-pointer')
    };
}

export interface PortalSurface {
    document: Document;
    scope: Document | ShadowRoot;
    target: HTMLElement | ShadowRoot;
    alternate: HTMLElement;
    appRoot: HTMLElement;
}
declare global {
    interface Window {
        menuPortalSurface: PortalSurface;
    }
}

async function copyStyles(target: HTMLElement | ShadowRoot) {
    await Promise.all(
        [...document.querySelectorAll('style, link[rel="stylesheet"]')].map((source) => {
            const clone = source.cloneNode(true) as HTMLStyleElement | HTMLLinkElement;
            const loaded =
                clone instanceof HTMLLinkElement
                    ? new Promise<void>((resolve, reject) => {
                          clone.onload = () => resolve();
                          clone.onerror = () => reject(new Error(`Stylesheet failed: ${clone.href}`));
                      })
                    : Promise.resolve();
            target.appendChild(clone);
            return loaded;
        })
    );
}

/** Test-app DOM setup only. The complete widget shares its target's tree/document for native ARIA. */
export async function preparePortalSurface(frame: boolean): Promise<PortalSurface> {
    let doc = document;
    let scope: Document | ShadowRoot;
    let target: HTMLElement | ShadowRoot;
    if (frame) {
        const iframe = document.createElement('iframe');
        iframe.dataset.testid = 'portal-frame';
        iframe.title = 'Portal document';
        iframe.className = 'fixed inset-0 h-full w-full border-0';
        iframe.srcdoc =
            '<!doctype html><html data-theme="light"><head></head><body data-demo="tailwind"></body></html>';
        const loaded = new Promise<void>((resolve) => {
            iframe.onload = () => resolve();
        });
        document.body.appendChild(iframe);
        await loaded;
        doc = iframe.contentDocument!;
        await copyStyles(doc.head);
        scope = doc;
        target = doc.createElement('div');
        target.dataset.testid = 'portal-target';
        doc.body.appendChild(target);
    } else {
        const host = doc.createElement('div');
        host.dataset.testid = 'portal-shadow-host';
        doc.body.appendChild(host);
        scope = host.attachShadow({ mode: 'open' });
        await copyStyles(scope);
        target = scope;
    }
    const appRoot = doc.createElement('parity-menu');
    const alternate = doc.createElement('div');
    alternate.dataset.testid = 'portal-alternate';
    (frame ? doc.body : scope).append(appRoot, alternate);
    const surface = { document: doc, scope, target, alternate, appRoot };
    window.menuPortalSurface = surface;
    return surface;
}
