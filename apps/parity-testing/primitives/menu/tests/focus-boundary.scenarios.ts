import { expect } from '@playwright/test';
import { focusBoundaryCases, focusBoundaryConfig } from '../src/focus-boundary';
import type { MenuDriver } from './driver';

export const focusBoundaryScenarios = focusBoundaryCases.map((name) => ({
    name,
    async run(d: MenuDriver) {
        const settings = focusBoundaryConfig(name)!;
        for (let session = 1; session <= (settings.retained ? 2 : 1); session++) {
            await d.open();
            if (settings.nested) await d.openSub();
            await d.checkpoint(`session ${session} focused`, { focus: settings.nested ? 'sub-alpha' : 'alpha' });
            await d.page.keyboard.press(settings.key);
            const expected = name.startsWith('focus-cancel-')
                ? {
                      open: true,
                      subOpen: settings.cancelChild,
                      focus:
                          settings.key === 'Shift+Tab'
                              ? 'sub-alpha'
                              : settings.parentControl
                                ? 'parent-control'
                                : 'more'
                  }
                : !settings.nested
                  ? {
                        open: false,
                        focus:
                            settings.key === 'Tab' ? 'after' : settings.rootPolicy === 'false' ? 'body' : 'root-final'
                    }
                  : settings.rootPolicy
                    ? { open: false, subOpen: false, focus: 'after' }
                    : {
                          open: true,
                          subOpen: false,
                          focus:
                              settings.childPolicy === 'false'
                                  ? 'body'
                                  : settings.key === 'Tab'
                                    ? 'parent-control'
                                    : 'child-final'
                      };
            await d.checkpoint(`session ${session} boundary requested`, {
                ...expected,
                finalFocusCalls: name.includes('-callback-')
                    ? Array.from({ length: session }, () => ({
                          layer: settings.nested ? 'sub' : 'main',
                          type: 'keyboard'
                      }))
                    : []
            });
            // The application only vetoes focus-out. A native trigger press ends a canceled session.
            if ((await d.trigger.getAttribute('aria-expanded')) === 'true') await d.trigger.click();
            await expect(d.trigger).toHaveAttribute('aria-expanded', 'false');
            await d.closed();
            await d.checkpoint(`session ${session} settled`);
        }
    }
}));
