import { expect, test } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * One screenshot per Storybook story, generated from the built story index. This captures every
 * primitive's *default rendered state*. Overlay primitives (popover, dialog, …) render only their
 * trigger here; their open state is covered by `overlays.visual.spec.ts`.
 */
interface StoryEntry {
    id: string;
    type: 'story' | 'docs';
    title: string;
    name: string;
    tags?: string[];
}

const indexPath = resolve(__dirname, '../../../dist/radix-storybook/index.json');

function loadStories(): StoryEntry[] {
    let raw: string;
    try {
        raw = readFileSync(indexPath, 'utf8');
    } catch {
        throw new Error(
            `Storybook index not found at ${indexPath}.\n` +
                'Build Storybook first: `pnpm build-storybook` (or run `pnpm test-visual`, which builds it for you).'
        );
    }

    const index = JSON.parse(raw) as { entries?: Record<string, StoryEntry>; stories?: Record<string, StoryEntry> };
    const entries = Object.values(index.entries ?? index.stories ?? {});

    // Sweep only stories that carry the global `visual` tag (added in `.storybook/preview.ts`).
    // A story opts out with `tags: ['!visual']`, which removes `visual` from its published tags.
    return entries.filter((entry) => entry.type === 'story' && entry.tags?.includes('visual'));
}

const stories = loadStories();

test.describe('Storybook stories', () => {
    for (const story of stories) {
        test(story.id, async ({ page }) => {
            await page.goto(`/iframe.html?id=${encodeURIComponent(story.id)}&viewMode=story`);
            await page.waitForSelector('#storybook-root', { state: 'attached' });
            await page.evaluate(() => document.fonts.ready);

            await expect(page).toHaveScreenshot(`${story.id}.png`, { fullPage: true });
        });
    }
});
