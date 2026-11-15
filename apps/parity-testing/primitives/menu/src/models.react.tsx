import { Menu } from '@base-ui/react/menu';
import { useEffect, useState } from 'react';
import { config, installProbe, classes as s, type Layer } from './contract';

export function ReactModels() {
    const p = config().models!;
    const [trace] = useState(() => installProbe('react'));
    const [open, setOpen] = useState(p.open);
    const [subOpen, setSubOpen] = useState(false);
    const [defaultOpen, setDefaultOpen] = useState(p.defaultOpen);
    const [value, setValue] = useState<string | null | undefined>(p.value);
    const [defaultValue, setDefaultValue] = useState(p.defaultValue);
    useEffect(() => {
        const command = (event: KeyboardEvent) => {
            if (event.key !== 'F3') return;
            event.preventDefault();
            setDefaultOpen((value) => !value);
            setDefaultValue((value) => (value === 'one' ? 'two' : 'one'));
        };
        document.addEventListener('keydown', command);
        return () => document.removeEventListener('keydown', command);
    }, []);
    const change = (layer: Layer, open: boolean, e: Menu.Root.ChangeEventDetails) =>
        trace.change(layer, open, e.reason, e.isCanceled, e.event, e.trigger);
    return (
        <div className={s.layout}>
            <Menu.Root
                open={p.explicitOpen ? open : undefined}
                defaultOpen={defaultOpen}
                onOpenChange={(next, e) => {
                    change('main', next, e);
                    if (p.explicitOpen) setOpen(next);
                }}
                onOpenChangeComplete={(open) => trace.complete('main', open)}
            >
                <Menu.Trigger className={s.trigger} data-testid="primary">
                    Actions
                </Menu.Trigger>
                <Menu.Portal>
                    <Menu.Positioner className="z-50">
                        <Menu.Popup className={s.popup} data-testid="popup">
                            {p.radio ? (
                                <Menu.RadioGroup
                                    value={p.explicitRadio ? value : undefined}
                                    defaultValue={defaultValue}
                                    onValueChange={(value, e) => {
                                        trace.value(value, e.reason, e.isCanceled);
                                        if (p.explicitRadio && p.value !== undefined) setValue(value);
                                    }}
                                >
                                    <Menu.RadioItem
                                        className={s.item}
                                        value="one"
                                        render={<button />}
                                        nativeButton
                                        data-testid="radio-one"
                                    >
                                        One
                                    </Menu.RadioItem>
                                    <Menu.RadioItem
                                        className={s.item}
                                        value="two"
                                        render={<button />}
                                        nativeButton
                                        data-testid="radio-two"
                                    >
                                        Two
                                    </Menu.RadioItem>
                                </Menu.RadioGroup>
                            ) : (
                                <Menu.Item className={s.item} render={<button />} nativeButton data-testid="alpha">
                                    Alpha
                                </Menu.Item>
                            )}
                            {p.nested && (
                                <Menu.SubmenuRoot
                                    open={subOpen}
                                    defaultOpen
                                    onOpenChange={(next, e) => {
                                        change('sub', next, e);
                                        setSubOpen(next);
                                    }}
                                    onOpenChangeComplete={(open) => trace.complete('sub', open)}
                                >
                                    <Menu.SubmenuTrigger
                                        className={s.item}
                                        render={<button />}
                                        nativeButton
                                        data-testid="more"
                                    >
                                        More
                                    </Menu.SubmenuTrigger>
                                    <Menu.Portal>
                                        <Menu.Positioner className="z-50">
                                            <Menu.Popup className={s.popup} data-testid="sub-popup">
                                                <Menu.Item
                                                    className={s.item}
                                                    render={<button />}
                                                    nativeButton
                                                    data-testid="sub-alpha"
                                                >
                                                    Child
                                                </Menu.Item>
                                            </Menu.Popup>
                                        </Menu.Positioner>
                                    </Menu.Portal>
                                </Menu.SubmenuRoot>
                            )}
                        </Menu.Popup>
                    </Menu.Positioner>
                </Menu.Portal>
            </Menu.Root>
        </div>
    );
}
