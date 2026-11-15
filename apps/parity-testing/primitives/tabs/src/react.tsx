import { Tabs } from '@base-ui/react/tabs';
import { createRoot } from 'react-dom/client';
import '../../../../radix-storybook/.storybook/tailwind.css';
import { config, installProbe, classes as s } from './contract';

const settings = config();
const trace = installProbe('react', settings);
function ReactTabs() {
    return (
        <Tabs.Root
            className={s.root}
            {...('defaultValue' in settings ? { defaultValue: settings.defaultValue } : {})}
            value={settings.value}
            onValueChange={(value, details) => {
                if (settings.cancelAutomatic && details.reason !== 'none') details.cancel();
                trace.change(
                    value,
                    details.reason,
                    details.activationDirection,
                    details.isCanceled,
                    details.event,
                    details.trigger
                );
            }}
            data-testid="tabs-root"
        >
            <Tabs.List className={s.list} aria-label="Example tabs">
                {settings.options.map((option, index) => (
                    <Tabs.Tab
                        className={s.tab}
                        key={option.value}
                        value={option.value}
                        disabled={option.disabled}
                        data-testid={`tab-${index}`}
                    >
                        {option.label}
                    </Tabs.Tab>
                ))}
            </Tabs.List>
            {settings.options.map((option, index) => (
                <Tabs.Panel
                    className={s.panel}
                    key={option.value}
                    value={option.value}
                    keepMounted
                    data-testid={`panel-${index}`}
                >
                    Panel {option.label}
                </Tabs.Panel>
            ))}
        </Tabs.Root>
    );
}
createRoot(document.getElementById('root')!).render(<ReactTabs />);
