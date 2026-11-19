import { Dialog } from '@base-ui/react/dialog';
import { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import '../../../../radix-storybook/.storybook/main.css';
import { chooseFocus, classes, config, installProbe, type NestedLayer } from './contract';
import { ReactDetachedDialog } from './detached.react';
import './fixture.css';
import { ReactMixedDialogs } from './mixed.react';
import { ReactOverlappingDialogs } from './overlap.react';

const settings = config();
const trace = installProbe();

function NestedDialog({ layer }: { layer: NestedLayer }) {
    const child = layer === 'child';
    const options = child ? settings.nested : undefined;
    const title = child ? 'Child dialog' : 'Grandchild dialog';
    const triggerId = `${layer}-trigger`;
    return (
        <Dialog.Root
            onOpenChange={(open, { reason, event, trigger, isCanceled }) =>
                trace.change(open, reason, event, trigger, isCanceled, layer)
            }
            onOpenChangeComplete={(open) => trace.probe.nestedCompletions.push({ layer, open })}
        >
            <Dialog.Trigger className={classes.trigger} id={triggerId} data-testid={triggerId}>
                Open {layer}
            </Dialog.Trigger>
            <Dialog.Portal keepMounted={options?.keepMounted}>
                <Dialog.Backdrop
                    className={classes.backdrop}
                    forceRender={options?.forceRender}
                    data-testid={`${layer}-backdrop`}
                />
                <Dialog.Popup
                    className={classes.popup}
                    data-motion={options?.animate ? '' : undefined}
                    data-testid={`${layer}-popup`}
                >
                    <Dialog.Title>{title}</Dialog.Title>
                    <input
                        className={classes.input}
                        defaultValue={child ? 'child draft' : undefined}
                        data-testid={`${layer}-field`}
                        aria-label={`${title} draft`}
                    />
                    {options?.grandchild && <NestedDialog layer="grandchild" />}
                    <Dialog.Close className={classes.trigger} data-testid={`${layer}-close`}>
                        Close {layer}
                    </Dialog.Close>
                </Dialog.Popup>
            </Dialog.Portal>
        </Dialog.Root>
    );
}

function ReactDialog() {
    const [open, setOpen] = useState(settings.open);
    const [defaultOpen, setDefaultOpen] = useState(settings.defaultOpen ?? false);
    const [triggerId, setTriggerId] = useState(settings.triggerId);
    const [secondary, setSecondary] = useState(!!settings.multiple);
    const [showNested, setShowNested] = useState(true);
    const [showPrimary, setShowPrimary] = useState(true);
    const [useSecondPortalTarget, setUseSecondPortalTarget] = useState(false);
    const portalA = useRef<HTMLDivElement>(null);
    const portalB = useRef<HTMLDivElement>(null);
    const actions = useRef<Dialog.Root.Actions>(null);
    const closeRef = useRef<HTMLButtonElement>(null);
    const finalTarget = useRef<HTMLInputElement>(null);
    const requested = useRef<boolean | undefined>(undefined);
    const cancelNextOpen = useRef(!!settings.cancelOpen);
    const holdNextClose = useRef(!!settings.hold);

    useEffect(() => {
        const command = (event: KeyboardEvent) => {
            if (!['F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10'].includes(event.key)) return;
            event.preventDefault();
            if (event.key === 'F2' && requested.current !== undefined) setOpen(requested.current);
            if (event.key === 'F3') setDefaultOpen((open) => !open);
            if (event.key === 'F4') setTriggerId(null);
            if (event.key === 'F5') setSecondary((present) => !present);
            if (event.key === 'F6') setShowNested((present) => !present);
            if (event.key === 'F7') setShowPrimary((present) => !present);
            if (event.key === 'F8') setUseSecondPortalTarget((second) => !second);
            if (event.key === 'F10') actions.current?.close();
            if (event.key === 'F9' || event.key === 'F10') actions.current?.unmount();
        };
        document.addEventListener('keydown', command);
        return () => document.removeEventListener('keydown', command);
    }, []);

    const initialFocus: Dialog.Popup.Props['initialFocus'] =
        settings.focus === 'elements'
            ? closeRef
            : settings.focus === 'disabled'
              ? false
              : settings.focus
                ? (interaction) => chooseFocus(trace.probe, settings.focus, 'initial', interaction, closeRef.current)
                : undefined;
    const finalFocus: Dialog.Popup.Props['finalFocus'] =
        settings.focus === 'elements'
            ? finalTarget
            : settings.focus === 'disabled'
              ? false
              : settings.focus
                ? (interaction) => chooseFocus(trace.probe, settings.focus, 'final', interaction, finalTarget.current)
                : undefined;

    return (
        <main className={settings.touch === 'page-pan' ? 'flex min-h-[1200px] items-start gap-2' : 'flex gap-2'}>
            <button className={classes.trigger} data-testid="outside" onClick={() => trace.probe.activations++}>
                Outside
            </button>
            {settings.focus && (
                <input
                    ref={finalTarget}
                    className={classes.input}
                    data-testid="final-target"
                    aria-label="Return target"
                />
            )}
            <Dialog.Root
                actionsRef={actions}
                open={open}
                defaultOpen={defaultOpen}
                triggerId={triggerId}
                defaultTriggerId={settings.defaultTriggerId}
                modal={settings.modal}
                disablePointerDismissal={settings.disablePointerDismissal}
                onOpenChange={(next, details) => {
                    if (next && cancelNextOpen.current) {
                        cancelNextOpen.current = false;
                        details.cancel();
                    }
                    if (!next && holdNextClose.current) {
                        holdNextClose.current = false;
                        details.preventUnmountOnClose();
                    }
                    trace.change(next, details.reason, details.event, details.trigger, details.isCanceled);
                    if (details.isCanceled) return;
                    requested.current = next;
                    if (open !== undefined && !settings.defer) setOpen(next);
                }}
                onOpenChangeComplete={(open) => trace.probe.completions.push(open)}
            >
                {showPrimary && (
                    <Dialog.Trigger className={classes.trigger} id="primary" data-testid="primary">
                        Primary
                    </Dialog.Trigger>
                )}
                {secondary && (
                    <Dialog.Trigger className={classes.trigger} id="secondary" data-testid="secondary">
                        Secondary
                    </Dialog.Trigger>
                )}
                <Dialog.Portal
                    container={settings.retarget ? (useSecondPortalTarget ? portalB : portalA) : undefined}
                    keepMounted={settings.keepMounted}
                >
                    {(settings.backdrop ?? settings.modal === undefined) && (
                        <Dialog.Backdrop className={classes.backdrop} data-testid="backdrop" />
                    )}
                    <Dialog.Popup
                        className={classes.popup}
                        initialFocus={initialFocus}
                        finalFocus={finalFocus}
                        data-motion={settings.animate ? '' : undefined}
                        data-testid="popup"
                    >
                        <Dialog.Title>Example dialog</Dialog.Title>
                        <Dialog.Description>Test a draft edit.</Dialog.Description>
                        <input className={classes.input} defaultValue="draft" data-testid="field" aria-label="Draft" />
                        {settings.touch === 'popup-pan' && (
                            <div className="h-32 touch-pan-y overflow-y-auto" data-testid="popup-scroll">
                                <div className="h-96">Scrollable dialog content</div>
                            </div>
                        )}
                        {settings.nested && showNested && <NestedDialog layer="child" />}
                        <Dialog.Close ref={closeRef} className={classes.trigger} data-testid="close">
                            Close
                        </Dialog.Close>
                    </Dialog.Popup>
                </Dialog.Portal>
            </Dialog.Root>
            {settings.retarget && (
                <>
                    <div ref={portalA} data-testid="portal-a" />
                    <div ref={portalB} data-testid="portal-b" />
                </>
            )}
            {settings.modal !== undefined && (
                <>
                    <input className={classes.input} data-testid="outside-field" aria-label="Outside field" />
                    <div
                        className={settings.touch === 'multitouch' ? 'size-16 touch-none' : 'size-16'}
                        data-testid="outside-surface"
                    />
                </>
            )}
        </main>
    );
}

createRoot(document.getElementById('root')!).render(
    settings.mixed ? (
        <ReactMixedDialogs variant={settings.mixed} trace={trace} />
    ) : settings.overlap ? (
        <ReactOverlappingDialogs {...settings.overlap} trace={trace} />
    ) : settings.detached ? (
        <ReactDetachedDialog settings={settings.detached} />
    ) : (
        <ReactDialog />
    )
);
