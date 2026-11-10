import { DirectionProvider } from '@base-ui/react/direction-provider';
import { Menu } from '@base-ui/react/menu';
import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import '../../../../radix-storybook/.storybook/tailwind.css';
import { config, installProbe, classes as s, type Layer } from './contract';

const settings = config();
const trace = installProbe('react');
function change(layer: Layer, open: boolean, details: Menu.Root.ChangeEventDetails) {
    if ((open && settings.name === 'cancel-open') || (!open && settings.name === 'cancel-close')) details.cancel();
    trace.change(layer, open, details.reason, details.isCanceled, details.event, details.trigger);
}
function ReactMenu() {
    const [triggerId, setTriggerId] = useState('custom-trigger');
    const [popupId, setPopupId] = useState('custom-popup');
    useEffect(() => {
        const outside = (event: MouseEvent) => {
            if ((event.target as Element)?.closest('[data-testid="outside"]')) trace.probe.activations++;
        };
        document.addEventListener('click', outside);
        const command = (event: KeyboardEvent) => {
            if (event.key !== 'F2') return;
            event.preventDefault();
            setTriggerId('renamed-trigger');
            setPopupId('renamed-popup');
        };
        document.addEventListener('keydown', command);
        return () => {
            document.removeEventListener('click', outside);
            document.removeEventListener('keydown', command);
        };
    }, []);
    return (
        <DirectionProvider direction={settings.dir}>
            <div className={s.layout}>
                <div className={s.outside} data-testid="outside">
                    Background
                </div>
                <input className={s.outside} aria-label="Before menu" data-testid="before" />
                <Menu.Root
                    modal={settings.modal}
                    loopFocus={settings.loop}
                    disabled={settings.disabled}
                    onOpenChange={(open, details) => change('main', open, details)}
                    onOpenChangeComplete={(open) => trace.complete('main', open)}
                >
                    <Menu.Trigger id={settings.ids ? triggerId : undefined} className={s.trigger} data-testid="primary">
                        Actions
                    </Menu.Trigger>
                    <Menu.Portal>
                        <Menu.Positioner className="z-50" align="start" sideOffset={4} collisionPadding={5}>
                            <Menu.Popup id={settings.ids ? popupId : undefined} className={s.popup} data-testid="popup">
                                <Menu.Item
                                    render={<button />}
                                    nativeButton
                                    className={s.item}
                                    label={settings.label}
                                    data-testid="alpha"
                                    onClick={() => trace.select('alpha')}
                                >
                                    Alpha
                                </Menu.Item>
                                <Menu.Item
                                    render={<button />}
                                    nativeButton
                                    className={s.item}
                                    disabled
                                    data-testid="blocked"
                                    onClick={() => trace.select('blocked')}
                                >
                                    Blocked
                                </Menu.Item>
                                <Menu.Item
                                    render={<button />}
                                    nativeButton
                                    className={s.item}
                                    data-testid="bravo"
                                    onClick={() => trace.select('bravo')}
                                >
                                    Bravo
                                </Menu.Item>
                                {settings.submenu && (
                                    <Menu.SubmenuRoot
                                        onOpenChange={(open, details) => change('sub', open, details)}
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
                                        <Menu.Portal>
                                            <Menu.Positioner
                                                className="z-50"
                                                side={settings.dir === 'rtl' ? 'left' : 'right'}
                                                align="start"
                                                sideOffset={4}
                                                collisionPadding={5}
                                            >
                                                <Menu.Popup className={s.popup} data-testid="sub-popup">
                                                    <Menu.Item
                                                        render={<button />}
                                                        nativeButton
                                                        className={s.item}
                                                        data-testid="sub-alpha"
                                                        onClick={() => trace.select('sub-alpha')}
                                                    >
                                                        Archive
                                                    </Menu.Item>
                                                    <Menu.Item
                                                        render={<button />}
                                                        nativeButton
                                                        className={s.item}
                                                        data-testid="sub-bravo"
                                                        onClick={() => trace.select('sub-bravo')}
                                                    >
                                                        Browse
                                                    </Menu.Item>
                                                </Menu.Popup>
                                            </Menu.Positioner>
                                        </Menu.Portal>
                                    </Menu.SubmenuRoot>
                                )}
                                <Menu.Item
                                    render={<button />}
                                    nativeButton
                                    className={s.item}
                                    closeOnClick={false}
                                    data-testid="stay"
                                    onClick={() => trace.select('stay')}
                                >
                                    Stay open
                                </Menu.Item>
                                {settings.checkbox && (
                                    <Menu.CheckboxItem
                                        render={<button />}
                                        nativeButton
                                        className={s.item}
                                        data-testid="check"
                                        onCheckedChange={(value, details) => {
                                            if (settings.name === 'checkbox-cancel') details.cancel();
                                            trace.value(value, details.reason, details.isCanceled);
                                        }}
                                    >
                                        Notifications
                                    </Menu.CheckboxItem>
                                )}
                                {settings.radio && (
                                    <Menu.RadioGroup
                                        defaultValue="one"
                                        onValueChange={(value, details) => {
                                            if (settings.name === 'radio-cancel') details.cancel();
                                            trace.value(value, details.reason, details.isCanceled);
                                        }}
                                    >
                                        <Menu.RadioItem
                                            render={<button />}
                                            nativeButton
                                            className={s.item}
                                            value="one"
                                            data-testid="radio-one"
                                        >
                                            Small
                                        </Menu.RadioItem>
                                        <Menu.RadioItem
                                            render={<button />}
                                            nativeButton
                                            className={s.item}
                                            value="two"
                                            data-testid="radio-two"
                                        >
                                            Large
                                        </Menu.RadioItem>
                                    </Menu.RadioGroup>
                                )}
                                <Menu.Item
                                    render={<button />}
                                    nativeButton
                                    className={s.item}
                                    data-testid="omega"
                                    onClick={() => trace.select('omega')}
                                >
                                    Omega
                                </Menu.Item>
                            </Menu.Popup>
                        </Menu.Positioner>
                    </Menu.Portal>
                </Menu.Root>
                <input className={s.outside} aria-label="After menu" data-testid="after" />
            </div>
        </DirectionProvider>
    );
}
createRoot(document.getElementById('root')!).render(<ReactMenu />);
