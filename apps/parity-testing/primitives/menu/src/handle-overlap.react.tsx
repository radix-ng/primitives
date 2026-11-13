import { Menu } from '@base-ui/react/menu';
import { useEffect, useState } from 'react';
import { installProbe, classes as s } from './contract';
import { handleOwners, type HandleOwner } from './handle-overlap';

export function ReactHandleOverlap() {
    const [trace] = useState(() => installProbe('react'));
    const [handle] = useState(() => Menu.createHandle<string>());
    const [otherHandle] = useState(() => Menu.createHandle<string>());
    const [owners, setOwners] = useState<readonly HandleOwner[]>(handleOwners.slice(0, 1));
    const [rebound, setRebound] = useState(false);
    const [label, setLabel] = useState('Alpha');
    const [triggerVersion, setTriggerVersion] = useState(0);
    trace.probe.handleOpen = () => handle.isOpen;
    useEffect(() => {
        function command(event: KeyboardEvent) {
            if (!['F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10'].includes(event.key)) return;
            event.preventDefault();
            if (event.key === 'F2') setRebound((value) => !value);
            if (event.key === 'F3') setLabel('Updated');
            if (event.key === 'F4') setOwners((current) => (current.length === 2 ? current.slice(0, 1) : handleOwners));
            if (event.key === 'F5') setOwners(handleOwners.slice(1));
            if (event.key === 'F6') handle.open('primary');
            if (event.key === 'F7') handle.close();
            if (event.key === 'F8') setOwners([]);
            if (event.key === 'F9') setOwners(handleOwners.slice(0, 1));
            if (event.key === 'F10') setTriggerVersion((version) => version + 1);
        }
        document.addEventListener('keydown', command);
        return () => document.removeEventListener('keydown', command);
    }, [handle]);
    return (
        <div className={s.layout}>
            <input data-testid="before" aria-label="Before" />
            <Menu.Trigger
                key={triggerVersion}
                id="primary"
                data-testid="primary"
                className={s.trigger}
                handle={handle}
                payload={label}
                render={<button />}
                nativeButton
            >
                {label}
            </Menu.Trigger>
            {owners.map((owner) => (
                <Menu.Root
                    key={owner.id}
                    handle={owner.id === 'newer' && rebound ? otherHandle : handle}
                    modal={false}
                    onOpenChange={(open, details) =>
                        trace.change(
                            owner.layer,
                            open,
                            details.reason,
                            details.isCanceled,
                            details.event,
                            details.trigger
                        )
                    }
                    onOpenChangeComplete={(open) => trace.complete(owner.layer, open)}
                >
                    {({ payload }) => (
                        <>
                            <output data-testid={`${owner.id}-payload`}>{payload ?? ''}</output>
                            <Menu.Portal>
                                <Menu.Positioner className="z-50" align="start" sideOffset={4}>
                                    <Menu.Popup className={s.popup} data-testid={owner.popup}>
                                        <Menu.Item
                                            className={s.item}
                                            data-testid={`${owner.id}-action`}
                                            onClick={() => trace.select(owner.id)}
                                            render={<button />}
                                            nativeButton
                                        >
                                            {payload} action
                                        </Menu.Item>
                                    </Menu.Popup>
                                </Menu.Positioner>
                            </Menu.Portal>
                        </>
                    )}
                </Menu.Root>
            ))}
            <input data-testid="after" aria-label="After" />
        </div>
    );
}
