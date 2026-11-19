import { Dialog } from '@base-ui/react/dialog';
import { useState } from 'react';
import { classes, installProbe, overlappingLayers, type OverlappingLayer } from './contract';

export function ReactOverlappingDialogs({
    backdrop,
    keepMounted,
    trace
}: {
    backdrop: boolean;
    keepMounted?: boolean;
    trace: ReturnType<typeof installProbe>;
}) {
    const [open, setOpen] = useState<Record<OverlappingLayer, boolean>>({ first: false, second: false, third: false });
    const update = (layer: OverlappingLayer, next: boolean) => setOpen((current) => ({ ...current, [layer]: next }));

    return (
        <main>
            <button
                className={classes.trigger}
                onClick={() => trace.probe.activations++}
                type="button"
                data-testid="outside"
            >
                Outside
            </button>
            {overlappingLayers.map((layer, index) => {
                const next = overlappingLayers[index + 1];
                return (
                    <Dialog.Root
                        key={layer}
                        open={open[layer]}
                        onOpenChange={(next, details) => {
                            trace.change(
                                next,
                                details.reason,
                                details.event,
                                details.trigger,
                                details.isCanceled,
                                layer
                            );
                            update(layer, next);
                        }}
                        onOpenChangeComplete={(open) => trace.probe.overlappingCompletions.push({ layer, open })}
                    >
                        {index === 0 && (
                            <Dialog.Trigger className={classes.trigger} id="primary" data-testid="primary">
                                Open first
                            </Dialog.Trigger>
                        )}
                        <Dialog.Portal keepMounted={keepMounted}>
                            {backdrop && (
                                <Dialog.Backdrop
                                    className={classes.backdrop}
                                    style={{ zIndex: index * 2 + 1 }}
                                    data-testid={`${layer}-backdrop`}
                                />
                            )}
                            <Dialog.Popup
                                className={classes.popup}
                                style={{ zIndex: index * 2 + 2 }}
                                data-testid={`${layer}-popup`}
                            >
                                <Dialog.Title>Dialog {layer}</Dialog.Title>
                                <input
                                    className={classes.input}
                                    data-testid={`${layer}-field`}
                                    aria-label={`${layer} field`}
                                />
                                {next && (
                                    <button
                                        className={classes.trigger}
                                        onClick={() => update(next, true)}
                                        type="button"
                                        data-testid={`open-${next}`}
                                    >
                                        Open {next}
                                    </button>
                                )}
                                <Dialog.Close className={classes.trigger} data-testid={`${layer}-close`}>
                                    Close {layer}
                                </Dialog.Close>
                            </Dialog.Popup>
                        </Dialog.Portal>
                    </Dialog.Root>
                );
            })}
        </main>
    );
}
