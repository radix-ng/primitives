import { Menu } from '@base-ui/react/menu';
import { useRef, useState } from 'react';
import { config, installProbe, classes as s, type Layer } from './contract';

export function ReactFocusBoundary() {
    const settings = config().focusBoundary!;
    const [trace] = useState(() => {
        const value = installProbe('react');
        window.menuParity.finalFocusCalls = [];
        return value;
    });
    const rootFinal = useRef<HTMLInputElement>(null);
    const childFinal = useRef<HTMLInputElement>(null);
    const policy = (layer: Layer, mode: string | undefined) => {
        if (!mode) return undefined;
        if (mode === 'false') return false;
        if (mode === 'target') return layer === 'main' ? rootFinal : childFinal;
        return (type: string | null) => {
            if (mode === 'callback') window.menuParity.finalFocusCalls!.push({ layer, type });
            return layer === 'main' ? rootFinal.current : childFinal.current;
        };
    };
    function change(layer: Layer, open: boolean, details: Menu.Root.ChangeEventDetails) {
        if (!open && details.reason === 'focus-out' && (layer === 'main' ? settings.cancelRoot : settings.cancelChild))
            details.cancel();
        trace.change(layer, open, details.reason, details.isCanceled, details.event, details.trigger);
    }
    return (
        <div className={s.layout}>
            <input ref={rootFinal} data-testid="root-final" aria-label="Root return target" />
            <button data-testid="outside">Background</button>
            <Menu.Root
                onOpenChange={(open, e) => change('main', open, e)}
                onOpenChangeComplete={(open) => trace.complete('main', open)}
            >
                <Menu.Trigger className={s.trigger} data-testid="primary">
                    Actions
                </Menu.Trigger>
                <Menu.Portal keepMounted={settings.retained}>
                    <Menu.Positioner className="z-50" sideOffset={4} data-testid="positioner">
                        <Menu.Popup
                            className={s.popup}
                            finalFocus={policy('main', settings.rootPolicy)}
                            data-testid="popup"
                        >
                            {settings.childPolicy && (
                                <input ref={childFinal} data-testid="child-final" aria-label="Child return target" />
                            )}
                            {settings.nested ? (
                                <Menu.SubmenuRoot
                                    onOpenChange={(open, e) => change('sub', open, e)}
                                    onOpenChangeComplete={(open) => trace.complete('sub', open)}
                                >
                                    <Menu.SubmenuTrigger
                                        render={<button />}
                                        nativeButton
                                        className={s.item}
                                        data-testid="more"
                                    >
                                        More
                                    </Menu.SubmenuTrigger>
                                    <Menu.Portal keepMounted={settings.retained}>
                                        <Menu.Positioner className="z-50" side="right" sideOffset={4}>
                                            <Menu.Popup
                                                className={s.popup}
                                                finalFocus={policy('sub', settings.childPolicy)}
                                                data-testid="sub-popup"
                                            >
                                                <Menu.Item
                                                    render={<button />}
                                                    nativeButton
                                                    className={s.item}
                                                    data-testid="sub-alpha"
                                                    onClick={() => trace.select('sub-alpha')}
                                                >
                                                    Child action
                                                </Menu.Item>
                                            </Menu.Popup>
                                        </Menu.Positioner>
                                    </Menu.Portal>
                                </Menu.SubmenuRoot>
                            ) : (
                                <Menu.Item render={<button />} nativeButton className={s.item} data-testid="alpha">
                                    Action
                                </Menu.Item>
                            )}
                            {settings.parentControl && (
                                <input data-testid="parent-control" aria-label="Parent control" />
                            )}
                        </Menu.Popup>
                    </Menu.Positioner>
                </Menu.Portal>
            </Menu.Root>
            <input data-testid="after" aria-label="After menu" />
        </div>
    );
}
