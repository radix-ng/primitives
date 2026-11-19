import { AlertDialog } from '@base-ui/react/alert-dialog';
import { Dialog } from '@base-ui/react/dialog';
import { Drawer } from '@base-ui/react/drawer';
import type { ReactNode } from 'react';
import { classes, type installProbe } from './contract';

type Trace = ReturnType<typeof installProbe>;

function NestedDrawer({ children, trace }: { children: ReactNode; trace: Trace }) {
    return (
        <Drawer.Root
            onOpenChange={(open, details) =>
                trace.change(open, details.reason, details.event, details.trigger, details.isCanceled, 'child')
            }
            onOpenChangeComplete={(open) => trace.probe.nestedCompletions.push({ layer: 'child', open })}
        >
            <Drawer.Trigger className={classes.trigger} id="child-trigger" data-testid="child-trigger">
                Open nested drawer
            </Drawer.Trigger>
            <Drawer.Portal>
                <Drawer.Backdrop className={classes.backdrop} data-testid="child-backdrop" />
                <Drawer.Viewport className="fixed inset-0">
                    <Drawer.Popup className={classes.popup} data-testid="child-popup">
                        <Drawer.Title>Nested drawer</Drawer.Title>
                        <input className={classes.input} aria-label="Nested drawer draft" data-testid="child-field" />
                        {children}
                        <Drawer.Close className={classes.trigger} data-testid="child-close">
                            Close nested drawer
                        </Drawer.Close>
                    </Drawer.Popup>
                </Drawer.Viewport>
            </Drawer.Portal>
        </Drawer.Root>
    );
}

export function ReactMixedDialogs({ variant, trace }: { variant: 'dialog' | 'alert-dialog'; trace: Trace }) {
    const Leaf = variant === 'alert-dialog' ? AlertDialog : Dialog;
    const title = variant === 'alert-dialog' ? 'Alert dialog' : 'Dialog';
    return (
        <main className="flex gap-2">
            <button
                className={classes.trigger}
                onClick={() => trace.probe.activations++}
                type="button"
                data-testid="outside"
            >
                Outside
            </button>
            <Drawer.Root
                onOpenChange={(open, details) =>
                    trace.change(open, details.reason, details.event, details.trigger, details.isCanceled)
                }
                onOpenChangeComplete={(open) => trace.probe.completions.push(open)}
            >
                <Drawer.Trigger className={classes.trigger} id="primary" data-testid="primary">
                    Open drawer
                </Drawer.Trigger>
                <Drawer.Portal>
                    <Drawer.Backdrop className={classes.backdrop} data-testid="backdrop" />
                    <Drawer.Viewport className="fixed inset-0">
                        <Drawer.Popup className={classes.popup} data-testid="popup">
                            <Drawer.Title>Parent drawer</Drawer.Title>
                            <input className={classes.input} aria-label="Parent drawer draft" data-testid="field" />
                            <NestedDrawer trace={trace}>
                                <Leaf.Root
                                    onOpenChange={(open, details) =>
                                        trace.change(
                                            open,
                                            details.reason,
                                            details.event,
                                            details.trigger,
                                            details.isCanceled,
                                            'grandchild'
                                        )
                                    }
                                    onOpenChangeComplete={(open) =>
                                        trace.probe.nestedCompletions.push({ layer: 'grandchild', open })
                                    }
                                >
                                    <Leaf.Trigger
                                        className={classes.trigger}
                                        id="grandchild-trigger"
                                        data-testid="grandchild-trigger"
                                    >
                                        Open {title.toLowerCase()}
                                    </Leaf.Trigger>
                                    <Leaf.Portal>
                                        <Leaf.Backdrop className={classes.backdrop} data-testid="grandchild-backdrop" />
                                        <Leaf.Popup className={classes.popup} data-testid="grandchild-popup">
                                            <Leaf.Title>{title}</Leaf.Title>
                                            <input
                                                className={classes.input}
                                                aria-label={`${title} draft`}
                                                data-testid="grandchild-field"
                                            />
                                            <Leaf.Close className={classes.trigger} data-testid="grandchild-close">
                                                Close
                                            </Leaf.Close>
                                        </Leaf.Popup>
                                    </Leaf.Portal>
                                </Leaf.Root>
                            </NestedDrawer>
                            <Drawer.Close className={classes.trigger} data-testid="close">
                                Close drawer
                            </Drawer.Close>
                        </Drawer.Popup>
                    </Drawer.Viewport>
                </Drawer.Portal>
            </Drawer.Root>
        </main>
    );
}
