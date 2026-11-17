import { CSPProvider } from '@base-ui/react/csp-provider';
import { DirectionProvider } from '@base-ui/react/direction-provider';
import { Tabs } from '@base-ui/react/tabs';
import { useEffect, useState } from 'react';
import { hydrationNonce, hydrationClasses as s, type HydrationChange, type HydrationSettings } from './cases';
function HydrationGroup({
    settings,
    index,
    changes
}: {
    settings: HydrationSettings;
    index: number;
    changes: HydrationChange[];
}) {
    const [value, setValue] = useState<number | null>(settings.value);
    return (
        <DirectionProvider direction={settings.rtl ? 'rtl' : 'ltr'}>
            <Tabs.Root
                className={s.root}
                orientation={settings.vertical ? 'vertical' : 'horizontal'}
                {...(settings.implicit ? {} : { defaultValue: settings.value })}
                value={settings.controlled ? value : undefined}
                dir={settings.rtl ? 'rtl' : 'ltr'}
                data-hydration-root={index}
                onValueChange={(next, details) => {
                    changes.push({ group: index, value: next, reason: details.reason });
                    if (settings.controlled) setValue(next as number | null);
                }}
            >
                <Tabs.List className={settings.vertical ? s.vertical : s.list} aria-label="Hydration tabs">
                    {[0, 1, 2].map((item) => (
                        <Tabs.Tab
                            className={
                                s.tab +
                                (item === settings.value && settings.transformed ? ' translate-x-3' : '') +
                                (item === settings.value && settings.zero ? ' hidden' : '')
                            }
                            key={item}
                            value={item}
                            id={settings.authored ? 'authored-tab-' + item : undefined}
                            data-part={'tab-' + item}
                        >
                            Tab {item}
                        </Tabs.Tab>
                    ))}
                    <Tabs.Indicator
                        className={s.indicator}
                        renderBeforeHydration={settings.prepaint}
                        data-part="indicator"
                    />
                </Tabs.List>
                {[0, 1, 2].map((item) => (
                    <Tabs.Panel
                        className={s.panel}
                        key={item}
                        value={item}
                        keepMounted={!settings.presence}
                        data-part={'panel-' + item}
                    >
                        <input aria-label={'Panel ' + item} data-part={'field-' + item} />
                    </Tabs.Panel>
                ))}
            </Tabs.Root>
        </DirectionProvider>
    );
}
export function ReactHydrationTabs({
    settings,
    changes,
    onReady
}: {
    settings: HydrationSettings;
    changes: HydrationChange[];
    onReady?: () => void;
}) {
    useEffect(() => {
        onReady?.();
    }, [onReady]);
    return (
        <CSPProvider nonce={hydrationNonce}>
            <>
                {(settings.multiple ? [0, 1] : [0]).map((index) => (
                    <HydrationGroup key={index} settings={settings} index={index} changes={changes} />
                ))}
            </>
        </CSPProvider>
    );
}
