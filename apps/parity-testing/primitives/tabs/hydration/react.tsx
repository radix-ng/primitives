import { hydrateRoot } from 'react-dom/client';
import '../../../../radix-storybook/.storybook/main.css';
import { hydrationSettings } from './cases';
import { ReactHydrationTabs } from './react-app';
window.tabsHydration = { ready: false, changes: [], errors: [], reference: __PARITY_REFERENCE__ };
hydrateRoot(
    document.getElementById('hydration-root')!,
    <ReactHydrationTabs
        settings={hydrationSettings(location.href)}
        changes={window.tabsHydration.changes}
        onReady={() => {
            window.tabsHydration.ready = true;
        }}
    />,
    { onRecoverableError: (error) => window.tabsHydration.errors.push(String(error)) }
);
