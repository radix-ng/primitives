import { Dialog } from '@base-ui/react/dialog';
import { DirectionProvider } from '@base-ui/react/direction-provider';
import { Popover } from '@base-ui/react/popover';
import { Select } from '@base-ui/react/select';
import type { ReactNode } from 'react';
import { useLayoutEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { demoSelect } from '../../../../../packages/primitives/storybook/styles';
import '../../../../radix-storybook/.storybook/tailwind.css';
import {
    changeOptions,
    fixtureConfig,
    installProbe,
    itemKey,
    itemLabel,
    ItemValue,
    OptionAction,
    optionActions
} from './contract';
import { anchoredHeightClass } from './geometry';
import { liveCommands, liveFormClass, liveHeightClass, liveItemClass, type LiveState } from './live';
import { shellStyles } from './nested';

const config = fixtureConfig();
document.documentElement.dir = config.dir;
const trace = installProbe('react', config);

function ReactSelectFixture() {
    const [portalHost, setPortalHost] = useState<HTMLDivElement | null>(null);
    const [options, setOptions] = useState(config.options);
    const [live, setLive] = useState<LiveState>({});
    const mutate = (action: OptionAction) => {
        const next = changeOptions(options, action);
        trace.observeOptions(next);
        setOptions(next);
    };
    useLayoutEffect(() => {
        if (!config.dynamic && !config.name.startsWith('live-')) return;
        const onCommand = (event: KeyboardEvent) => {
            const command = config.name.startsWith('live-') && liveCommands.find((c) => c.shortcut === event.key);
            if (command) {
                event.preventDefault();
                const next = { ...live, [command.key]: !live[command.key] };
                setLive(next);
                if (command.key === 'renamed')
                    setOptions(
                        config.options.map((o) => ({ ...o, label: o.label + (next.renamed ? ' renamed' : '') }))
                    );
                return;
            }
            const action = optionActions.find((action) => action.shortcut === event.key);
            if (!action) return;
            event.preventDefault();
            mutate(action.key);
        };
        document.addEventListener('keydown', onCommand);
        return () => document.removeEventListener('keydown', onCommand);
    });
    const actions = useRef<Select.Root.Actions | null>(null);
    useLayoutEffect(() => {
        trace.probe.close = () => actions.current?.close();
        trace.probe.unmount = () => actions.current?.unmount();
    }, []);
    return (
        <DirectionProvider direction={config.dir}>
            <ReactSelectShell>
                <div className={config.geometry?.shellClass ?? 'contents'} data-testid="scroller">
                    <form
                        className={(config.geometry?.formClass ?? 'grid w-64 gap-3') + liveFormClass(live)}
                        dir={config.dir}
                        data-testid="form"
                        onSubmit={(event) => event.preventDefault()}
                    >
                        <button onClick={() => trace.probe.backgroundActivations++} data-testid="before" type="button">
                            Before
                        </button>
                        <Select.Root<ItemValue, boolean>
                            defaultValue={config.initial}
                            multiple={config.multiple}
                            disabled={config.disabled}
                            readOnly={config.readOnly}
                            modal={config.modal}
                            items={config.dynamic ? options : undefined}
                            isItemEqualToValue={
                                config.name === 'dynamic-objects' ? (a, b) => itemKey(a) === itemKey(b) : undefined
                            }
                            name="choice"
                            itemToStringLabel={(value) => itemLabel(value, options)}
                            itemToStringValue={itemKey}
                            actionsRef={actions}
                            onOpenChange={(open, details) => {
                                if (
                                    (open && config.name === 'cancel-open') ||
                                    (!open && (config.name === 'cancel-close' || config.name === 'modal-cancel-close'))
                                )
                                    details.cancel();
                                const held = !open && config.defer && !details.isCanceled;
                                if (held) details.preventUnmountOnClose();
                                trace.open(open, details.reason, details.isCanceled, details.event, held);
                            }}
                            onValueChange={(value, details) => {
                                if (
                                    config.name === 'cancel-value' ||
                                    config.name === 'typeahead-cancel-value' ||
                                    config.name === 'dynamic-cancel-value'
                                )
                                    details.cancel();
                                trace.value(value, details.reason, details.isCanceled, details.event);
                            }}
                            onOpenChangeComplete={trace.complete}
                        >
                            <Select.Label>Fruit</Select.Label>
                            <Select.Trigger className={demoSelect.trigger} data-testid="trigger">
                                <Select.Value data-testid="value" placeholder="Choose a fruit" />
                            </Select.Trigger>
                            <Select.Portal
                                container={
                                    config.geometry?.customPortal || config.nested?.customPortal
                                        ? portalHost
                                        : undefined
                                }
                            >
                                <Select.Positioner
                                    className={demoSelect.positioner + ' pointer-events-auto'}
                                    sideOffset={5}
                                    align={config.name === 'anchor-default' ? undefined : 'start'}
                                    alignItemWithTrigger={config.aligned}
                                    disableAnchorTracking={config.geometry?.disableAnchorTracking}
                                    data-testid="positioner"
                                >
                                    <Select.Popup
                                        className={
                                            ((config.dir === 'rtl' && !config.aligned) ||
                                            config.name === 'anchor-default'
                                                ? demoSelect.popup + ' w-48 min-w-48!'
                                                : demoSelect.popup) +
                                            (config.geometry
                                                ? ' flex min-h-0 flex-col overflow-hidden' +
                                                  config.geometry.heightClass +
                                                  liveHeightClass(live) +
                                                  anchoredHeightClass
                                                : '')
                                        }
                                        data-testid="popup"
                                    >
                                        {config.geometry?.arrows && (
                                            <Select.ScrollUpArrow
                                                className={demoSelect.scrollButton + ' absolute inset-x-0 top-0 z-10'}
                                                data-testid="scroll-up"
                                            >
                                                Up
                                            </Select.ScrollUpArrow>
                                        )}
                                        <Select.List
                                            className={
                                                demoSelect.list +
                                                (config.name === 'touch-scroll'
                                                    ? ' max-h-48 overflow-y-auto'
                                                    : config.geometry
                                                      ? ' min-h-0 overflow-y-auto'
                                                      : '')
                                            }
                                            data-testid="list"
                                        >
                                            {options.map((option) => (
                                                <Select.Item
                                                    key={option.key}
                                                    value={option.value}
                                                    disabled={option.disabled}
                                                    className={demoSelect.item + liveItemClass(live)}
                                                    data-option-key={option.key}
                                                >
                                                    <Select.ItemText data-option-text={option.key}>
                                                        {option.label}
                                                    </Select.ItemText>
                                                </Select.Item>
                                            ))}
                                        </Select.List>
                                        {config.geometry?.arrows && (
                                            <Select.ScrollDownArrow
                                                className={
                                                    demoSelect.scrollButton + ' absolute inset-x-0 bottom-0 z-10'
                                                }
                                                data-testid="scroll-down"
                                            >
                                                Down
                                            </Select.ScrollDownArrow>
                                        )}
                                    </Select.Popup>
                                </Select.Positioner>
                            </Select.Portal>
                        </Select.Root>
                        <button onClick={() => trace.probe.backgroundActivations++} data-testid="after" type="button">
                            After
                        </button>
                    </form>
                    {config.geometry?.spacerClass && <div className={config.geometry.spacerClass} aria-hidden="true" />}
                    <div
                        ref={setPortalHost}
                        className={config.geometry?.portalClass ?? 'contents'}
                        data-testid="portal-host"
                    />
                </div>
                {config.dynamic && (
                    <div className="mt-4 grid w-64 gap-2" aria-label="Option data actions">
                        {optionActions.map((action) => (
                            <button
                                key={action.key}
                                className="border-border rounded border px-2 py-1 text-start text-xs"
                                type="button"
                                onClick={() => mutate(action.key)}
                            >
                                {action.label} ({action.shortcut})
                            </button>
                        ))}
                    </div>
                )}
                {config.scrollable && <div className="h-[150vh]" aria-hidden="true" />}
            </ReactSelectShell>
        </DirectionProvider>
    );
}

function ReactSelectShell({ children }: { children: ReactNode }) {
    const s = shellStyles;
    if (config.nested?.kind === 'dialog')
        return (
            <div className="min-h-[180vh]">
                <Dialog.Root>
                    <Dialog.Trigger className={s.trigger} data-testid="shell-trigger">
                        Open container
                    </Dialog.Trigger>
                    <Dialog.Portal>
                        <Dialog.Backdrop className="fixed inset-0 z-30" />
                        <Dialog.Popup className={s.dialog} data-testid="shell-popup">
                            <Dialog.Title>Nested Select</Dialog.Title>
                            <Dialog.Description>Choose a fruit and continue.</Dialog.Description>
                            {children}
                            <Dialog.Close className={s.trigger} data-testid="shell-close">
                                Close container
                            </Dialog.Close>
                        </Dialog.Popup>
                    </Dialog.Portal>
                </Dialog.Root>
            </div>
        );
    if (config.nested?.kind === 'popover')
        return (
            <div className="min-h-[180vh]">
                <Popover.Root>
                    <Popover.Trigger className={s.trigger} data-testid="shell-trigger">
                        Open container
                    </Popover.Trigger>
                    <Popover.Portal>
                        <Popover.Positioner className="z-40" sideOffset={5} align="start">
                            <Popover.Popup className={s.popover} data-testid="shell-popup">
                                <Popover.Title>Nested Select</Popover.Title>
                                <Popover.Description>Choose a fruit and continue.</Popover.Description>
                                {children}
                                <Popover.Close className={s.trigger} data-testid="shell-close">
                                    Close container
                                </Popover.Close>
                            </Popover.Popup>
                        </Popover.Positioner>
                    </Popover.Portal>
                </Popover.Root>
            </div>
        );
    return children;
}

createRoot(document.getElementById('root')!).render(<ReactSelectFixture />);
