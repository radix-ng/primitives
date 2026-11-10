import { ContextMenu } from '@base-ui/react/context-menu';
import { createRoot } from 'react-dom/client';
import '../../../../radix-storybook/.storybook/tailwind.css';
import { menuClasses as s } from '../../../shared/menu-fixture';
import { MenuItems } from '../../../shared/menu-items';
import { config, installProbe } from './contract';
const settings = config(),
    trace = installProbe('react');
function ReactContextMenu() {
    return (
        <div className={s.layout}>
            <input data-testid="before" aria-label="Before context menu" className={s.outside} />
            <ContextMenu.Root
                disabled={settings.disabled}
                onOpenChange={(open, details) => {
                    if ((open && settings.name === 'cancel-open') || (!open && settings.name === 'cancel-close'))
                        details.cancel();
                    trace.change('context', open, details.reason, details.isCanceled, details.event, details.trigger);
                }}
                onOpenChangeComplete={(open) => trace.complete('context', open)}
            >
                <ContextMenu.Trigger
                    render={<button type="button" />}
                    id="context-trigger"
                    data-testid="area"
                    data-menu-trigger="context"
                    className={s.trigger + (settings.name.startsWith('touch-') ? ' touch-none' : '')}
                >
                    Context area
                </ContextMenu.Trigger>
                <ContextMenu.Portal keepMounted={settings.keepMounted}>
                    <ContextMenu.Positioner className="z-50" side={settings.side} align="start" sideOffset={4}>
                        <ContextMenu.Popup
                            id="context-popup"
                            className={s.popup}
                            data-testid="context-popup"
                            data-menu-popup="context"
                        >
                            <MenuItems menu="context" select={trace.select} />
                        </ContextMenu.Popup>
                    </ContextMenu.Positioner>
                </ContextMenu.Portal>
            </ContextMenu.Root>
            <button
                type="button"
                data-testid="outside"
                className={s.outside + ' fixed start-24 top-[30rem]'}
                onClick={() => trace.probe.activations++}
            >
                Outside
            </button>
        </div>
    );
}
createRoot(document.getElementById('root')!).render(<ReactContextMenu />);
