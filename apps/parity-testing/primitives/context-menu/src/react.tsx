import { ContextMenu } from '@base-ui/react/context-menu';
import { DirectionProvider } from '@base-ui/react/direction-provider';
import { Menu } from '@base-ui/react/menu';
import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import '../../../../radix-storybook/.storybook/tailwind.css';
import { menuClasses as s } from '../../../shared/menu-fixture';
import { MenuItems } from '../../../shared/menu-items';
import { rootRemovalExitClass, rootRemovalFinalFocus } from '../../../shared/root-removal';
import { cancelComposition } from './composition';
import { config, installProbe, type Layer } from './contract';
import { ReactIndependentContextMenu } from './independent.react';
const settings = config(),
    trace = installProbe('react');
function ReactContextMenu() {
    const [rootPresent, setRootPresent] = useState(true);
    const [beforePresent, setBeforePresent] = useState(true);
    const popupClass = s.popup + (settings.removal?.animated ? rootRemovalExitClass : '');
    const [allow, setAllow] = useState(false);
    useEffect(() => {
        const command = (event: KeyboardEvent) => {
            if (settings.removal && ['F3', 'F4'].includes(event.key)) {
                event.preventDefault();
                setRootPresent(event.key === 'F4');
                if (event.key === 'F3' && settings.removal.missingFocus) setBeforePresent(false);
                return;
            }
            if (event.key === 'F5') {
                event.preventDefault();
                setAllow(true);
            }
        };
        document.addEventListener('keydown', command);
        return () => document.removeEventListener('keydown', command);
    }, []);
    const change = (layer: Layer, open: boolean, details: Menu.Root.ChangeEventDetails) => {
        if (settings.removal?.deferred && layer === 'context' && !open) details.preventUnmountOnClose();
        if (
            (open && settings.name === 'cancel-open') ||
            (!open && settings.name === 'cancel-close') ||
            (!allow && cancelComposition(settings.name, layer, open, details.reason))
        )
            details.cancel();
        trace.change(layer, open, details.reason, details.isCanceled, details.event, details.trigger);
    };
    return (
        <DirectionProvider direction={settings.dir}>
            <div dir={settings.dir}>
                <div className={s.layout}>
                    {beforePresent && (
                        <input data-testid="before" aria-label="Before context menu" className={s.outside} />
                    )}
                    {rootPresent && (
                        <ContextMenu.Root
                            disabled={settings.disabled}
                            onOpenChange={(open, details) => change('context', open, details)}
                            onOpenChangeComplete={(open) => trace.complete('context', open)}
                        >
                            {settings.nestedAreas ? (
                                <ContextMenu.Trigger
                                    id="context-trigger"
                                    data-testid="area"
                                    data-menu-trigger="context"
                                    className={s.trigger + ' grid gap-4 p-4'}
                                    tabIndex={0}
                                >
                                    Outer context area
                                    <ContextMenu.Trigger
                                        id="context-trigger-two"
                                        data-testid="area-two"
                                        data-menu-trigger="context"
                                        className={s.trigger}
                                        tabIndex={0}
                                    >
                                        Inner context area
                                    </ContextMenu.Trigger>
                                </ContextMenu.Trigger>
                            ) : (
                                <>
                                    <ContextMenu.Trigger
                                        render={<button type="button" />}
                                        id="context-trigger"
                                        data-testid="area"
                                        data-menu-trigger="context"
                                        className={
                                            s.trigger + (settings.name.startsWith('touch-') ? ' touch-none' : '')
                                        }
                                    >
                                        Context area
                                    </ContextMenu.Trigger>
                                    {settings.multiple && (
                                        <ContextMenu.Trigger
                                            render={<button type="button" />}
                                            id="context-trigger-two"
                                            data-testid="area-two"
                                            data-menu-trigger="context"
                                            className={s.trigger + ' ms-80'}
                                        >
                                            Second context area
                                        </ContextMenu.Trigger>
                                    )}
                                </>
                            )}
                            <ContextMenu.Portal keepMounted={settings.keepMounted}>
                                <ContextMenu.Positioner
                                    className="z-50"
                                    side={settings.side}
                                    align="start"
                                    sideOffset={4}
                                >
                                    <ContextMenu.Popup
                                        id="context-popup"
                                        className={popupClass}
                                        finalFocus={settings.removal?.finalFocus ? rootRemovalFinalFocus : undefined}
                                        data-testid="context-popup"
                                        data-menu-popup="context"
                                    >
                                        <MenuItems menu="context" select={trace.select}>
                                            {settings.nested && (
                                                <Menu.SubmenuRoot
                                                    onOpenChange={(open, details) =>
                                                        change('context-sub', open, details)
                                                    }
                                                    onOpenChangeComplete={(open) => trace.complete('context-sub', open)}
                                                >
                                                    <Menu.SubmenuTrigger
                                                        render={<button />}
                                                        nativeButton
                                                        className={s.item}
                                                        data-testid="context-more"
                                                        delay={settings.removal?.hoverPending ? 2000 : 100}
                                                    >
                                                        More
                                                    </Menu.SubmenuTrigger>
                                                    <Menu.Portal>
                                                        <Menu.Positioner
                                                            className="z-50"
                                                            side={settings.dir === 'rtl' ? 'left' : 'right'}
                                                            align="start"
                                                            sideOffset={4}
                                                        >
                                                            <Menu.Popup
                                                                id="context-sub-popup"
                                                                data-testid="context-sub-popup"
                                                                data-menu-popup="context-sub"
                                                                className={popupClass}
                                                            >
                                                                <Menu.Item
                                                                    render={<button />}
                                                                    nativeButton
                                                                    className={s.item}
                                                                    data-testid="context-sub-alpha"
                                                                    onClick={() => trace.select('context-sub-alpha')}
                                                                >
                                                                    Nested command
                                                                </Menu.Item>
                                                                <Menu.Item
                                                                    render={<button />}
                                                                    nativeButton
                                                                    className={s.item}
                                                                    data-testid="context-sub-bravo"
                                                                    onClick={() => trace.select('context-sub-bravo')}
                                                                >
                                                                    Last nested command
                                                                </Menu.Item>
                                                            </Menu.Popup>
                                                        </Menu.Positioner>
                                                    </Menu.Portal>
                                                </Menu.SubmenuRoot>
                                            )}
                                        </MenuItems>
                                    </ContextMenu.Popup>
                                </ContextMenu.Positioner>
                            </ContextMenu.Portal>
                        </ContextMenu.Root>
                    )}
                    <button
                        type="button"
                        data-testid="outside"
                        className={s.outside + ' fixed start-24 top-[30rem]'}
                        onClick={() => trace.probe.activations++}
                    >
                        Outside
                    </button>
                </div>
            </div>
            {settings.removal && <div className="min-h-[2000px]" />}
        </DirectionProvider>
    );
}
createRoot(document.getElementById('root')!).render(
    settings.independent ? <ReactIndependentContextMenu trace={trace} /> : <ReactContextMenu />
);
