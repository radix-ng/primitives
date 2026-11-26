import type { FrameLocator, Page } from '@playwright/test';

export function docsHeading(scope: Page | FrameLocator, title: string) {
    const escaped = title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // Storybook's heading permalink contributes an accessible label but no visible text.
    return scope.getByRole('heading').filter({ hasText: new RegExp(`^${escaped}$`) });
}
