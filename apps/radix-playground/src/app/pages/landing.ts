import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, resource, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideArrowUpRight, LucideMoon, LucideSend, LucideSun } from '@lucide/angular';
import { name as primitivesName, version as primitivesVersion } from '../../../../../packages/primitives/package.json';
import { ProjectSettings } from '../examples/project-settings';
import { ThemeStore } from '../shared/theme';
import { LandingAccordion } from './landing-accordion';

@Component({
    selector: 'app-landing',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        RouterLink,
        NgTemplateOutlet,
        LucideArrowUpRight,
        LucideMoon,
        LucideSend,
        LucideSun,
        LandingAccordion,
        ProjectSettings
    ],
    templateUrl: './landing.html'
})
export default class LandingPage {
    protected readonly theme = inject(ThemeStore);
    protected readonly docsUrl = '/docs/?path=/docs/overview-introduction--docs';
    protected readonly agentsUrl = '/docs/?path=/docs/agents-getting-started--docs';
    protected readonly repositoryUrl = 'https://github.com/radix-ng/primitives';
    protected readonly telegramUrl = 'https://t.me/headless_angular';
    protected readonly npmVersion = primitivesVersion;
    protected readonly npmUrl = `https://www.npmjs.com/package/${primitivesName}/v/${this.npmVersion}`;
    protected readonly skillCommand = 'npx skills add radix-ng/primitives/skills';
    protected readonly exampleSource = resource({
        loader: async ({ abortSignal }) => {
            const response = await fetch('/examples/project-settings.ts', { signal: abortSignal });
            if (!response.ok) throw new Error('Unable to load the Project settings example.');
            return response.text();
        }
    });
    protected readonly copyStatus = signal<{ label: string; copied: boolean } | null>(null);
    protected readonly prompts = [
        {
            id: 'setup-prompt',
            title: 'Set up Radix NG',
            copyLabel: 'Setup prompt',
            text: `Set up Radix NG in this Angular project.

1. Check the installed Angular version against the peer dependencies of @radix-ng/primitives. Use this workspace's package manager and dependency policy.
2. If Radix NG is missing, run ng add @radix-ng/primitives and opt in to its agent instructions. Keep any existing project instructions.
3. Install the radix-ng and radix-ng-examples skills using the command below. Confirm where both skills are installed.

   ${this.skillCommand}`
        },
        {
            id: 'project-settings-prompt',
            title: 'Adapt Project settings',
            copyLabel: 'Project settings prompt',
            text: `Use the radix-ng and radix-ng-examples skills to build a Project settings dialog in this Angular app.

Start with the ProjectSettings example if I provide it. Use Radix NG Dialog and Select with the app's existing styles and forms. Keep the environment as a draft until Save settings applies it. Cancel discards the draft.

Check that Tab stays in the dialog, Escape closes the Select first, and closing each overlay returns focus to its trigger. Run the Angular build and report the checks.`
        }
    ] as const;

    protected readonly coreTeam = [
        { login: 'pimenovoleg', avatarId: 567760, role: 'Maintainer' },
        { login: 'artembelik', avatarId: 24925224, role: 'Contributor' },
        { login: 'pawel-twardziak', avatarId: 180847852, role: 'Contributor' },
        { login: 'vitalyozza', avatarId: 109949088, role: 'Contributor' }
    ] as const;

    protected readonly community = [
        { login: 'jpsullivan', avatarId: 570899 },
        { login: 'lskramarov', avatarId: 9027254 },
        { login: 'olegdenisov', avatarId: 420945 },
        { login: 'mrfrac', avatarId: 19538736 },
        { login: 'KamilEmeleev', avatarId: 24388892 },
        { login: 'VictorZubr', avatarId: 35505401 },
        { login: 'zizifn', avatarId: 1803942 },
        { login: 'ayush-seth', avatarId: 24858182 }
    ] as const;

    protected async copy(text: string, label: string): Promise<void> {
        try {
            await navigator.clipboard.writeText(text);
            this.copyStatus.set({ label, copied: true });
        } catch {
            this.copyStatus.set({ label, copied: false });
        }
    }
}
