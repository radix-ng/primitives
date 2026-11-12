import { installProbe } from './contract';
export function installHostProbe(framework: string) {
    const trace = installProbe(framework);
    window.menuParity.hostClicks = [];
    window.menuParity.hostSubmissions = 0;
    return {
        ...trace,
        clicked(event: MouseEvent) {
            window.menuParity.hostClicks!.push({
                type: event.type,
                trusted: event.isTrusted,
                ctrl: event.ctrlKey,
                meta: event.metaKey,
                shift: event.shiftKey,
                alt: event.altKey
            });
            // Application-owned navigation guard: observe modifiers without opening extra browser tabs.
            if (window.menuParity.config.host?.modified && window.menuParity.config.host.tag === 'a')
                event.preventDefault();
        }
    };
}
