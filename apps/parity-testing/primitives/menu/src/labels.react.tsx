import { Menu } from '@base-ui/react/menu';
import { useEffect, useState } from 'react';
import { config, installProbe, classes as s } from './contract';

export function ReactLabels() {
    const p = config().labels!;
    const [trace] = useState(() => installProbe('react'));
    const [id, setId] = useState<string | undefined>(p.generated ? undefined : 'custom-label');
    const [primary, setPrimary] = useState(true);
    const [secondary, setSecondary] = useState(false);
    useEffect(() => {
        const command = (event: KeyboardEvent) => {
            if (event.key === 'F3') setId((id) => (id === 'renamed-label' ? undefined : 'renamed-label'));
            else if (event.key === 'F4') setPrimary((show) => !show);
            else if (event.key === 'F6') setSecondary((show) => !show);
            else return;
            event.preventDefault();
        };
        document.addEventListener('keydown', command);
        return () => document.removeEventListener('keydown', command);
    }, []);
    const content = (
        <>
            {primary && (
                <Menu.GroupLabel id={id} data-testid="label">
                    Planets
                </Menu.GroupLabel>
            )}
            {secondary && (
                <Menu.GroupLabel id="secondary-label" data-testid="secondary-label">
                    Alternative
                </Menu.GroupLabel>
            )}
            {p.radio ? (
                <Menu.RadioItem className={s.item} value="mars" render={<button />} nativeButton data-testid="alpha">
                    Mars
                </Menu.RadioItem>
            ) : (
                <Menu.Item className={s.item} render={<button />} nativeButton data-testid="alpha">
                    Mars
                </Menu.Item>
            )}
        </>
    );
    return (
        <div className={s.layout}>
            <Menu.Root
                onOpenChange={(open, e) => trace.change('main', open, e.reason, e.isCanceled, e.event, e.trigger)}
                onOpenChangeComplete={(open) => trace.complete('main', open)}
            >
                <Menu.Trigger className={s.trigger} data-testid="primary">
                    Actions
                </Menu.Trigger>
                <Menu.Portal>
                    <Menu.Positioner className="z-50">
                        <Menu.Popup className={s.popup} data-testid="popup">
                            {p.radio ? (
                                <Menu.RadioGroup data-testid="group">{content}</Menu.RadioGroup>
                            ) : (
                                <Menu.Group data-testid="group">{content}</Menu.Group>
                            )}
                        </Menu.Popup>
                    </Menu.Positioner>
                </Menu.Portal>
            </Menu.Root>
        </div>
    );
}
