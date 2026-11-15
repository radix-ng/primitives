import { Tabs } from '@base-ui/react/tabs';
import { classes as s, type installProbe } from './contract';
import { nestedMotionClass, panelMotionClass } from './panels';

export function ReactPanels({ trace }: { trace: ReturnType<typeof installProbe> }) {
    const settings = trace.probe.config;
    const panels = settings.panels!;
    return (
        <>
            <button data-testid="before" type="button">
                Before
            </button>
            <Tabs.Root
                className={s.root}
                defaultValue={settings.defaultValue}
                data-testid="tabs-root"
                onValueChange={(value, details) => {
                    trace.change(
                        value,
                        details.reason,
                        details.activationDirection,
                        details.isCanceled,
                        details.event,
                        details.trigger
                    );
                }}
            >
                <Tabs.List className={s.list} aria-label="Panel lifecycle">
                    {settings.options.map((option, i) => (
                        <Tabs.Tab key={option.value} className={s.tab} value={option.value} data-testid={`tab-${i}`}>
                            {option.label}
                        </Tabs.Tab>
                    ))}
                </Tabs.List>
                {settings.options.map((option, i) => (
                    <Tabs.Panel
                        key={option.value}
                        className={s.panel + ' group' + panelMotionClass(panels)}
                        value={option.value}
                        keepMounted={!panels.presence || panels.keepMounted}
                        data-testid={`panel-${i}`}
                    >
                        <div data-testid={`content-${i}`}>
                            <div className={panels.nested ? nestedMotionClass : ''} data-testid={`nested-${i}`}>
                                <input aria-label={`${option.label} note`} data-testid={`field-${i}`} />
                                <button
                                    onClick={() => trace.probe.activations[i]++}
                                    data-testid={`action-${i}`}
                                    type="button"
                                >
                                    Action {option.label}
                                </button>
                            </div>
                        </div>
                    </Tabs.Panel>
                ))}
            </Tabs.Root>
            <button data-testid="after" type="button">
                After
            </button>
        </>
    );
}
