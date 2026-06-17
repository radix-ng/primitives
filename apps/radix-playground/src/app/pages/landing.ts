import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import {
    LucideArrowRight,
    LucideBox,
    LucideCheck,
    LucideChevronDown,
    LucideComponent,
    LucideCopy,
    LucideEyeOff,
    LucideMoon,
    LucidePlus,
    LucideSettings,
    LucideSun,
    LucideUsers,
    LucideZap
} from '@lucide/angular';
import {
    RdxAccordionContentDirective,
    RdxAccordionHeaderDirective,
    RdxAccordionItemDirective,
    RdxAccordionRootDirective,
    RdxAccordionTriggerDirective
} from '@radix-ng/primitives/accordion';
import { RdxButtonDirective } from '@radix-ng/primitives/button';
import {
    RdxCheckboxButtonDirective,
    RdxCheckboxIndicatorDirective,
    RdxCheckboxInputDirective,
    RdxCheckboxRootDirective
} from '@radix-ng/primitives/checkbox';
import { RdxSwitchRoot, RdxSwitchThumb } from '@radix-ng/primitives/switch';
import { ThemeStore } from '../shared/theme';

const installCommand = 'ng add @radix-ng/primitives';
const skillCommand = 'npx skills add radix-ng/primitives/skills';

type CopyTarget = 'install' | 'skill';

@Component({
    selector: 'app-landing',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        RdxButtonDirective,
        RdxSwitchRoot,
        RdxSwitchThumb,
        RdxCheckboxRootDirective,
        RdxCheckboxButtonDirective,
        RdxCheckboxIndicatorDirective,
        RdxCheckboxInputDirective,
        RdxAccordionRootDirective,
        RdxAccordionItemDirective,
        RdxAccordionHeaderDirective,
        RdxAccordionTriggerDirective,
        RdxAccordionContentDirective,
        NgTemplateOutlet,
        LucideArrowRight,
        LucideBox,
        LucideCheck,
        LucideChevronDown,
        LucideComponent,
        LucideCopy,
        LucideEyeOff,
        LucideMoon,
        LucidePlus,
        LucideSettings,
        LucideSun,
        LucideUsers,
        LucideZap
    ],
    template: `
        <main class="bg-background text-foreground min-h-screen">
            <button
                class="border-border bg-card hover:bg-muted fixed top-4 right-4 z-50 inline-flex size-10 items-center justify-center rounded-full border text-[var(--landing-accent-text)] shadow-sm transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[var(--landing-accent-text)]"
                [attr.aria-label]="'Switch to ' + (theme.theme() === 'light' ? 'dark' : 'light') + ' theme'"
                (click)="theme.toggle()"
                type="button"
            >
                @if (theme.theme() === 'dark') {
                    <svg class="size-4" lucideSun></svg>
                } @else {
                    <svg class="size-4" lucideMoon></svg>
                }
            </button>

            <section class="relative overflow-hidden px-6 py-20 lg:py-24">
                <div
                    class="pointer-events-none absolute -top-24 -right-32 z-0 size-[600px] rotate-[-6deg] text-[var(--landing-accent-text)] opacity-[0.06] dark:opacity-[0.1]"
                    aria-hidden="true"
                >
                    <ng-container [ngTemplateOutlet]="logoMark" />
                </div>

                <div class="relative z-10 mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-[1.05fr_0.95fr]">
                    <div>
                        <span
                            class="text-muted-foreground mb-6 inline-flex items-center gap-2 rounded-full border border-[color:var(--landing-accent-border)] bg-[color:var(--landing-accent-tint)] px-3 py-1 text-xs font-medium whitespace-nowrap"
                        >
                            <svg class="size-3.5 text-[var(--landing-accent-text)]" lucideZap></svg>
                            Signals-first ·
                            <b class="font-semibold text-[var(--landing-accent-text)]">built for Angular</b>
                        </span>

                        <h1
                            class="mb-5 max-w-3xl text-5xl leading-[1.02] font-bold tracking-normal text-balance lg:text-6xl"
                        >
                            Headless UI
                            <em class="text-[var(--landing-accent-text)] not-italic">primitives</em>
                            <span class="whitespace-nowrap">for Angular.</span>
                        </h1>

                        <p class="text-muted-foreground mb-8 max-w-[30em] text-lg leading-8 text-pretty">
                            A low-level, accessible component library that adapts
                            <strong class="text-foreground font-semibold whitespace-nowrap">Base UI</strong>
                            's architecture and behavior to Angular. Primitives ship no styles and expose their state
                            through
                            <code
                                class="rounded bg-[color:var(--landing-accent-tint)] px-1.5 py-0.5 font-mono text-[0.85em] text-[var(--landing-accent-text)]"
                            >
                                data-*
                            </code>
                            attributes. Use them as the base layer of your
                            <span class="whitespace-nowrap">design system</span>
                            or adopt them incrementally.
                        </p>

                        <div class="mb-6 flex flex-wrap gap-3">
                            <a
                                class="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex h-11 items-center gap-2 rounded-md px-4 text-sm font-medium no-underline transition-colors"
                                href="/docs/?path=/docs/overview-introduction--docs"
                                rdxButton
                            >
                                Get started
                                <svg class="size-4" lucideArrowRight></svg>
                            </a>
                            <a
                                class="inline-flex h-11 items-center gap-2 rounded-md border border-[color:var(--landing-accent-border)] px-4 text-sm font-medium text-[var(--landing-accent-text)] no-underline transition-colors hover:bg-[color:var(--landing-accent-tint)]"
                                href="https://github.com/radix-ng/primitives"
                                target="_blank"
                                rel="noreferrer"
                                rdxButton
                            >
                                View on GitHub
                            </a>
                        </div>

                        <div
                            class="inline-flex h-10 max-w-full items-center gap-3 rounded-md border border-[color:var(--landing-accent-border)] bg-[color:var(--landing-accent-tint)] py-0 pr-1.5 pl-3.5 font-mono text-[0.8125rem]"
                        >
                            <span class="text-[var(--landing-accent-text)]">$</span>
                            <span class="truncate">{{ installCommand }}</span>
                            <button
                                class="hover:bg-background ml-auto inline-flex size-7 shrink-0 items-center justify-center rounded text-[var(--landing-accent-text)] transition-colors"
                                [attr.aria-label]="copied() === 'install' ? 'Copied' : 'Copy install command'"
                                (click)="copy('install', installCommand)"
                                type="button"
                            >
                                @if (copied() === 'install') {
                                    <svg class="size-3.5" lucideCheck></svg>
                                } @else {
                                    <svg class="size-3.5" lucideCopy></svg>
                                }
                            </button>
                        </div>
                    </div>

                    <div
                        class="bg-card overflow-hidden rounded-lg border border-[color:var(--landing-accent-border)] shadow-lg lg:rotate-[-1deg]"
                    >
                        <div
                            class="border-border flex items-center gap-2 border-b bg-[color:var(--landing-accent-tint)] px-3.5 py-2.5"
                        >
                            <span class="flex gap-1.5" aria-hidden="true">
                                <i class="block size-2.5 rounded-full bg-[color:var(--landing-red)]"></i>
                                <i class="block size-2.5 rounded-full bg-[color:var(--landing-accent-fill)]"></i>
                                <i class="block size-2.5 rounded-full bg-[color:var(--landing-green)]"></i>
                            </span>
                            <span class="text-muted-foreground ml-2 font-mono text-xs">switch.component.html</span>
                            <span
                                class="landing-code-status bg-background/75 relative ml-auto h-6 w-20 overflow-hidden rounded-full border border-[color:var(--landing-accent-border)] font-mono text-[0.68rem] text-[var(--landing-accent-text)]"
                                aria-hidden="true"
                            >
                                <span class="landing-code-status__label landing-code-status__label--behavior">
                                    Behavior
                                </span>
                                <span class="landing-code-status__label landing-code-status__label--state">State</span>
                                <span class="landing-code-status__label landing-code-status__label--styling">
                                    Styling
                                </span>
                            </span>
                        </div>
                        <pre
                            class="text-foreground m-0 overflow-x-auto p-5 font-mono text-[0.8125rem] leading-7"
                        ><span class="text-muted-foreground">&lt;!-- fully functional before a line of CSS --&gt;</span>
<span class="landing-code-line landing-code-line--behavior"><span class="text-[var(--landing-red)]">&lt;button</span> <span class="text-[var(--landing-accent-text)] font-semibold underline decoration-dotted underline-offset-4">rdxSwitchRoot</span> <span class="text-[var(--landing-blue)]">class</span>=<span class="text-[var(--landing-green)]">"switch"</span></span>
<span class="landing-code-line landing-code-line--state">        <span class="text-[var(--landing-blue)]">[(checked)]</span>=<span class="text-[var(--landing-green)]">"enabled"</span><span class="text-[var(--landing-red)]">&gt;</span></span>
  <span class="text-[var(--landing-red)]">&lt;span</span> <span class="text-[var(--landing-accent-text)] font-semibold underline decoration-dotted underline-offset-4">rdxSwitchThumb</span> <span class="text-[var(--landing-blue)]">class</span>=<span class="text-[var(--landing-green)]">"thumb"</span><span class="text-[var(--landing-red)]">&gt;&lt;/span&gt;</span>
<span class="text-[var(--landing-red)]">&lt;/button&gt;</span>

<span class="text-muted-foreground">/* style the published state */</span>
<span class="landing-code-line landing-code-line--styling"><span class="text-[var(--landing-red)]">.switch</span><span class="text-[var(--landing-blue)]">[data-checked]</span> &#123;</span>
  <span class="text-[var(--landing-blue)]">background</span>: <span class="text-[var(--landing-green)]">var(--primary)</span>;
&#125;</pre>
                    </div>
                </div>
            </section>

            <section class="border-border border-t bg-[color:var(--landing-accent-tint)]/35 px-6 py-20" id="try">
                <div class="mx-auto max-w-6xl">
                    <div class="mb-10">
                        <p
                            class="mb-3 text-xs font-semibold tracking-[0.08em] text-[var(--landing-accent-text)] uppercase"
                        >
                            Try it
                        </p>
                        <h2 class="mb-3 text-3xl leading-tight font-bold tracking-normal">Real behavior, live.</h2>
                        <p class="text-muted-foreground max-w-2xl text-base leading-7 text-pretty">
                            These are Radix NG primitives wired up exactly as they ship: keyboard, focus and state
                            included. The styling is ours; the behavior is theirs. Watch the published
                            <span class="whitespace-nowrap">
                                <code class="font-mono text-[0.85em] text-[var(--landing-accent-text)]">data-*</code>
                                state
                            </span>
                            change as you interact.
                        </p>
                    </div>

                    <div class="grid gap-5 lg:grid-cols-2">
                        <div
                            class="bg-card flex flex-col gap-5 rounded-lg border border-[color:var(--landing-accent-border)] p-6 shadow-sm"
                        >
                            <div class="flex items-center justify-between gap-3">
                                <span class="text-sm font-semibold">State as data</span>
                                <span
                                    class="rounded-full border border-[color:var(--landing-blue)]/30 bg-[color:var(--landing-blue)]/10 px-2 py-0.5 font-mono text-[0.7rem] text-[var(--landing-blue)]"
                                >
                                    Switch · Checkbox
                                </span>
                            </div>

                            <div class="flex items-center justify-between gap-4">
                                <span class="text-sm">Email notifications</span>
                                <div class="flex items-center gap-3">
                                    <span class="text-muted-foreground font-mono text-[0.72rem] whitespace-nowrap">
                                        data-checked=&quot;
                                        <b class="text-primary font-semibold">{{ emailEnabled() }}</b>
                                        &quot;
                                    </span>
                                    <button
                                        class="bg-muted relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-0 p-0 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[var(--landing-accent-text)] data-[checked]:bg-[color:var(--landing-accent-fill)]"
                                        [checked]="emailEnabled()"
                                        (onCheckedChange)="emailEnabled.set($event)"
                                        aria-label="Email notifications"
                                        rdxSwitchRoot
                                    >
                                        <span
                                            class="bg-background pointer-events-none block size-5 translate-x-0.5 rounded-full shadow-sm transition-transform data-[checked]:translate-x-[22px]"
                                            rdxSwitchThumb
                                        ></span>
                                    </button>
                                </div>
                            </div>

                            <div class="flex items-center justify-between gap-4">
                                <span class="text-sm">Accept the license terms</span>
                                <div class="flex items-center gap-3">
                                    <span class="text-muted-foreground font-mono text-[0.72rem] whitespace-nowrap">
                                        data-state=&quot;
                                        <b class="text-primary font-semibold">{{ checkboxState() }}</b>
                                        &quot;
                                    </span>
                                    <div
                                        [checked]="licenseAccepted()"
                                        (onCheckedChange)="licenseAccepted.set($event)"
                                        rdxCheckboxRoot
                                    >
                                        <button
                                            class="border-input inline-flex size-5 items-center justify-center rounded border bg-transparent text-white transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[var(--landing-accent-text)] data-[state=checked]:border-[color:var(--landing-accent-fill)] data-[state=checked]:bg-[color:var(--landing-accent-fill)]"
                                            aria-label="Accept the license terms"
                                            rdxCheckboxButton
                                        >
                                            <svg
                                                class="size-3 opacity-0 data-[state=checked]:opacity-100"
                                                rdxCheckboxIndicator
                                                lucideCheck
                                            ></svg>
                                        </button>
                                        <input rdxCheckboxInput />
                                    </div>
                                </div>
                            </div>

                            <div class="flex items-center justify-between gap-4">
                                <span class="text-sm">Marketing emails</span>
                                <div class="flex items-center gap-3">
                                    <span class="text-muted-foreground font-mono text-[0.72rem] whitespace-nowrap">
                                        data-checked=&quot;
                                        <b class="text-primary font-semibold">{{ marketingEnabled() }}</b>
                                        &quot;
                                    </span>
                                    <button
                                        class="bg-muted relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-0 p-0 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[var(--landing-accent-text)] data-[checked]:bg-[color:var(--landing-accent-fill)]"
                                        [checked]="marketingEnabled()"
                                        (onCheckedChange)="marketingEnabled.set($event)"
                                        aria-label="Marketing emails"
                                        rdxSwitchRoot
                                    >
                                        <span
                                            class="bg-background pointer-events-none block size-5 translate-x-0.5 rounded-full shadow-sm transition-transform data-[checked]:translate-x-[22px]"
                                            rdxSwitchThumb
                                        ></span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div
                            class="bg-card flex flex-col gap-5 rounded-lg border border-[color:var(--landing-accent-border)] p-6 shadow-sm"
                        >
                            <div class="flex items-center justify-between gap-3">
                                <span class="text-sm font-semibold">Accordion</span>
                                <span
                                    class="rounded-full border border-[color:var(--landing-green)]/30 bg-[color:var(--landing-green)]/10 px-2 py-0.5 font-mono text-[0.7rem] text-[var(--landing-green)]"
                                >
                                    single · collapsible
                                </span>
                            </div>

                            <div
                                class="border-border bg-background overflow-hidden rounded-md border"
                                [defaultValue]="'accessibility'"
                                collapsible
                                keepMounted
                                rdxAccordionRoot
                            >
                                @for (item of accordionItems; track item.value) {
                                    <div
                                        class="border-border border-t first:border-t-0 data-[state=open]:bg-[color:var(--landing-accent-tint)]"
                                        [value]="item.value"
                                        rdxAccordionItem
                                    >
                                        <h3 rdxAccordionHeader>
                                            <button
                                                class="hover:bg-muted flex w-full cursor-pointer items-center justify-between gap-3 border-0 bg-transparent px-3.5 py-3 text-left text-sm font-medium"
                                                type="button"
                                                rdxAccordionTrigger
                                            >
                                                {{ item.title }}
                                                <svg
                                                    class="size-4 shrink-0 text-[var(--landing-accent-text)]"
                                                    lucideChevronDown
                                                ></svg>
                                            </button>
                                        </h3>
                                        <div
                                            class="grid overflow-hidden transition-[grid-template-rows] duration-200 data-[state=closed]:grid-rows-[0fr] data-[state=open]:grid-rows-[1fr]"
                                            rdxAccordionContent
                                        >
                                            <div class="overflow-hidden">
                                                <p class="text-muted-foreground px-3.5 pb-3.5 text-sm leading-6">
                                                    {{ item.body }}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section class="border-border border-t px-6 py-20" id="compose">
                <div class="mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-[1fr_0.95fr]">
                    <div>
                        <p
                            class="mb-3 text-xs font-semibold tracking-[0.08em] text-[var(--landing-accent-text)] uppercase"
                        >
                            Composition
                        </p>
                        <h2 class="mb-3 text-3xl leading-tight font-bold tracking-normal">
                            Headless parts,
                            <em class="text-[var(--landing-accent-text)] not-italic">your</em>
                            markup.
                        </h2>
                        <p class="text-muted-foreground max-w-2xl text-base leading-7 text-pretty">
                            Every part is an unstyled element you fully own. Attach your classes, nest your own
                            children, drop in icons, wire ids and attributes. Assemble a component that's
                            <span class="whitespace-nowrap">unmistakably yours.</span>
                        </p>

                        <div class="mt-6 flex flex-col gap-4">
                            <div class="flex gap-3">
                                <span
                                    class="mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-md bg-[color:var(--landing-accent-tint)] text-[var(--landing-accent-text)]"
                                >
                                    <svg class="size-4" lucideComponent></svg>
                                </span>
                                <span class="text-muted-foreground text-sm leading-6">
                                    <b class="text-foreground font-semibold whitespace-nowrap">
                                        Bring your own element.
                                    </b>
                                    The directive attaches behavior to your
                                    <code class="font-mono">&lt;button&gt;</code>
                                    ,
                                    <code class="font-mono">&lt;span&gt;</code>
                                    or component.
                                </span>
                            </div>
                            <div class="flex gap-3">
                                <span
                                    class="mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-md bg-[color:var(--landing-blue)]/10 text-[var(--landing-blue)]"
                                >
                                    <svg class="size-4" lucideBox></svg>
                                </span>
                                <span class="text-muted-foreground text-sm leading-6">
                                    <b class="text-foreground font-semibold whitespace-nowrap">Slot in anything.</b>
                                    Icons, labels and badges drop into open slots.
                                </span>
                            </div>
                            <div class="flex gap-3">
                                <span
                                    class="mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-md bg-[color:var(--landing-green)]/10 text-[var(--landing-green)]"
                                >
                                    <svg class="size-4" lucideSettings></svg>
                                </span>
                                <span class="text-muted-foreground text-sm leading-6">
                                    <b class="text-foreground font-semibold whitespace-nowrap">
                                        Pass through attributes.
                                    </b>
                                    &nbsp;
                                    <code class="font-mono">class</code>
                                    ,
                                    <code class="font-mono">id</code>
                                    and ARIA all forward to the host element.
                                </span>
                            </div>
                            <div class="flex gap-3">
                                <span
                                    class="mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-md bg-[color:var(--landing-red)]/10 text-[var(--landing-red)]"
                                >
                                    <svg class="size-4" lucideEyeOff></svg>
                                </span>
                                <span class="text-muted-foreground text-sm leading-6">
                                    <b class="text-foreground font-semibold whitespace-nowrap">Style the state.</b>
                                    The primitive publishes
                                    <code class="font-mono">data-*</code>
                                    ; your CSS decides how each state looks.
                                </span>
                            </div>
                        </div>
                    </div>

                    <div class="flex flex-col gap-4">
                        <p
                            class="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.06em] text-[var(--landing-accent-text)] uppercase"
                        >
                            <svg class="size-3.5" lucideZap></svg>
                            <span class="whitespace-nowrap">Ready for coding agents</span>
                        </p>

                        <div
                            class="bg-card overflow-hidden rounded-lg border border-[color:var(--landing-accent-border)] shadow-lg lg:rotate-[-1deg]"
                        >
                            <div
                                class="border-border flex items-center gap-2 border-b bg-[color:var(--landing-accent-tint)] px-3.5 py-2.5"
                            >
                                <span class="flex gap-1.5" aria-hidden="true">
                                    <i class="block size-2.5 rounded-full bg-[color:var(--landing-red)]"></i>
                                    <i class="block size-2.5 rounded-full bg-[color:var(--landing-accent-fill)]"></i>
                                    <i class="block size-2.5 rounded-full bg-[color:var(--landing-green)]"></i>
                                </span>
                                <span class="text-muted-foreground ml-2 font-mono text-xs">SKILL.md</span>
                                <span
                                    class="ml-auto inline-flex items-center gap-1 rounded-full border border-[color:var(--landing-accent-border)] bg-[color:var(--landing-accent-tint)] px-2 py-0.5 font-mono text-[0.7rem] text-[var(--landing-accent-text)]"
                                >
                                    <svg class="size-3" lucideZap></svg>
                                    skills.sh
                                </span>
                            </div>
                            <pre
                                class="text-foreground m-0 overflow-x-auto p-5 font-mono text-[0.8125rem] leading-7"
                            ><span class="text-muted-foreground">---</span>
<span class="text-[var(--landing-blue)]">name</span>: <span class="text-[var(--landing-accent-text)] font-semibold">radix-ng</span>
<span class="text-[var(--landing-blue)]">description</span>: <span class="text-[var(--landing-green)]">Headless, signals-first Angular</span>
  <span class="text-[var(--landing-green)]">UI primitives. Wire up accessible Switch,</span>
  <span class="text-[var(--landing-green)]">Dialog &amp; Accordion via the data-* contract.</span>
<span class="text-[var(--landing-blue)]">when-to-use</span>: <span class="text-[var(--landing-green)]">Building Angular components</span>
<span class="text-muted-foreground">---</span></pre>
                            <div
                                class="border-border flex flex-col gap-2.5 border-t bg-[color:var(--landing-accent-tint)] px-5 py-4"
                            >
                                <div class="text-muted-foreground flex items-start gap-2.5 text-sm leading-6">
                                    <svg class="mt-1 size-3.5 shrink-0 text-[var(--landing-green)]" lucideCheck></svg>
                                    <span>
                                        Agents read the
                                        <span class="whitespace-nowrap">
                                            <code
                                                class="bg-background rounded px-1 font-mono text-[var(--landing-accent-text)]"
                                            >
                                                data-*
                                            </code>
                                            contract
                                        </span>
                                        , ARIA and keyboard rules
                                        <span class="whitespace-nowrap">up front.</span>
                                    </span>
                                </div>
                                <div class="text-muted-foreground flex items-start gap-2.5 text-sm leading-6">
                                    <svg class="mt-1 size-3.5 shrink-0 text-[var(--landing-green)]" lucideCheck></svg>
                                    <span>
                                        Primitives scaffold accessibly on the first try, with no guesswork on state.
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div
                            class="inline-flex h-10 max-w-full items-center gap-3 rounded-md border border-[color:var(--landing-accent-border)] bg-[color:var(--landing-accent-tint)] py-0 pr-1.5 pl-3.5 font-mono text-[0.8125rem]"
                        >
                            <span class="text-[var(--landing-accent-text)]">$</span>
                            <span class="truncate">{{ skillCommand }}</span>
                            <button
                                class="hover:bg-background ml-auto inline-flex size-7 shrink-0 items-center justify-center rounded text-[var(--landing-accent-text)] transition-colors"
                                [attr.aria-label]="copied() === 'skill' ? 'Copied' : 'Copy skill command'"
                                (click)="copy('skill', skillCommand)"
                                type="button"
                            >
                                @if (copied() === 'skill') {
                                    <svg class="size-3.5" lucideCheck></svg>
                                } @else {
                                    <svg class="size-3.5" lucideCopy></svg>
                                }
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            <section class="border-border border-t bg-[color:var(--landing-blue)]/5 px-6 py-20" id="primitives">
                <div class="mx-auto max-w-6xl">
                    <div class="mb-10">
                        <p
                            class="mb-3 text-xs font-semibold tracking-[0.08em] text-[var(--landing-accent-text)] uppercase"
                        >
                            35+ primitives
                        </p>
                        <h2 class="mb-3 text-3xl leading-tight font-bold tracking-normal">
                            Everything you
                            <span class="whitespace-nowrap">compose with.</span>
                        </h2>
                        <p class="text-muted-foreground max-w-2xl text-base leading-7 text-pretty">
                            Each primitive is a set of Angular directives wired up with full keyboard and ARIA behavior.
                            Import only the
                            <span class="whitespace-nowrap">entry points</span>
                            you use.
                        </p>
                    </div>

                    <div class="flex flex-wrap gap-2">
                        @for (primitive of primitives; track primitive) {
                            <span
                                class="bg-card inline-flex items-center gap-2 rounded-md border border-[color:var(--landing-accent-border)] px-3 py-1.5 text-sm transition-colors hover:border-[color:var(--landing-accent-text)] hover:bg-[color:var(--landing-accent-tint)]"
                            >
                                <svg class="size-3.5 text-[var(--landing-accent-text)]" lucideComponent></svg>
                                {{ primitive }}
                            </span>
                        }
                        <span
                            class="bg-card inline-flex items-center gap-2 rounded-md border border-[color:var(--landing-blue)]/25 px-3 py-1.5 text-sm text-[var(--landing-blue)] transition-colors hover:border-[color:var(--landing-blue)] hover:bg-[color:var(--landing-blue)]/10"
                        >
                            and more
                        </span>
                    </div>
                </div>
            </section>

            <section class="border-border bg-muted border-y px-6 py-20" id="contributors">
                <div class="mx-auto max-w-6xl">
                    <div class="mb-10 flex flex-wrap items-end justify-between gap-6">
                        <div>
                            <p class="text-primary mb-3 text-xs font-semibold tracking-[0.08em] uppercase">
                                Built in the open
                            </p>
                            <h2 class="mb-3 text-3xl leading-tight font-bold tracking-normal">
                                The people behind Radix NG.
                            </h2>
                            <p class="text-muted-foreground max-w-2xl text-base leading-7 text-pretty">
                                An MIT-licensed library maintained by a small core team and a growing community. Every
                                primitive, fix, and doc page is someone's contribution.
                            </p>
                        </div>
                        <a
                            class="border-border text-foreground hover:bg-background inline-flex h-10 items-center gap-2 rounded-md border px-4 text-sm font-medium no-underline transition-colors"
                            href="https://github.com/radix-ng/primitives/graphs/contributors"
                            target="_blank"
                            rel="noreferrer"
                            rdxButton
                        >
                            <svg class="size-4" lucideUsers></svg>
                            All contributors
                        </a>
                    </div>

                    <div class="mb-6 grid gap-4 lg:grid-cols-3">
                        @for (person of coreTeam; track person.login) {
                            <a
                                class="border-border bg-card hover:bg-background flex items-center gap-4 rounded-lg border px-5 py-4 no-underline shadow-sm transition-colors"
                                [href]="person.url"
                                target="_blank"
                                rel="noreferrer"
                            >
                                <img
                                    class="size-[52px] shrink-0 rounded-full"
                                    [src]="person.avatarUrl"
                                    [alt]="person.login + ' avatar'"
                                    width="52"
                                    height="52"
                                    loading="lazy"
                                />
                                <div class="min-w-0">
                                    <div class="flex flex-wrap items-center gap-1.5 text-base font-semibold">
                                        {{ person.login }}
                                        <span
                                            class="border-primary/30 bg-primary/10 text-primary rounded-full border px-2 py-0.5 text-[0.625rem] font-semibold tracking-[0.06em] uppercase"
                                        >
                                            {{ person.badge }}
                                        </span>
                                    </div>
                                    <div class="text-muted-foreground font-mono text-xs">@{{ person.login }}</div>
                                    <div class="text-muted-foreground mt-0.5 text-xs">
                                        {{ person.contributionsLabel }}
                                    </div>
                                </div>
                            </a>
                        }
                    </div>

                    <div class="border-border bg-card rounded-lg border p-6 shadow-sm">
                        <p class="text-muted-foreground mb-5 flex items-center gap-2 text-sm font-semibold">
                            <svg class="size-4" lucideUsers></svg>
                            Community contributors
                        </p>
                        <div class="grid grid-cols-1 gap-2 sm:grid-cols-[repeat(auto-fill,minmax(168px,1fr))]">
                            @for (person of community; track person.login) {
                                <a
                                    class="hover:bg-muted flex min-w-0 items-center gap-2.5 rounded-md p-2 no-underline transition-colors"
                                    [href]="person.url"
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    <img
                                        class="size-[34px] shrink-0 rounded-full"
                                        [src]="person.avatarUrl"
                                        [alt]="person.login + ' avatar'"
                                        width="34"
                                        height="34"
                                        loading="lazy"
                                    />
                                    <span class="min-w-0 leading-tight">
                                        <span class="block truncate text-sm font-medium">{{ person.login }}</span>
                                        <span class="text-muted-foreground block truncate font-mono text-[0.7rem]">
                                            {{ person.contributionsLabel }}
                                        </span>
                                    </span>
                                </a>
                            }
                            <a
                                class="border-border text-muted-foreground flex items-center justify-center gap-2 rounded-md border border-dashed p-2 text-sm no-underline"
                                href="https://github.com/radix-ng/primitives/graphs/contributors"
                                target="_blank"
                                rel="noreferrer"
                            >
                                View graph
                                <svg class="size-3.5" lucideArrowRight></svg>
                            </a>
                        </div>
                    </div>

                    <div class="mt-8 flex flex-wrap items-center justify-between gap-6">
                        <div class="flex flex-wrap gap-8 lg:gap-10">
                            @for (stat of stats; track stat.label) {
                                <div>
                                    <div class="text-2xl font-bold tracking-normal">{{ stat.value }}</div>
                                    <div class="text-muted-foreground text-xs">{{ stat.label }}</div>
                                </div>
                            }
                        </div>
                        <a
                            class="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex h-10 items-center gap-2 rounded-md px-4 text-sm font-medium no-underline transition-colors"
                            href="https://github.com/radix-ng/primitives/blob/main/CONTRIBUTING.md"
                            target="_blank"
                            rel="noreferrer"
                            rdxButton
                        >
                            <svg class="size-4" lucidePlus></svg>
                            Become a contributor
                        </a>
                    </div>
                </div>
            </section>

            <footer class="bg-[color:var(--landing-accent-tint)]/35 px-6 py-12">
                <div class="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-6">
                    <a class="inline-flex items-center gap-2 text-sm tracking-normal no-underline" href="/">
                        <span class="size-5 text-[var(--landing-accent-text)]">
                            <ng-container [ngTemplateOutlet]="logoMark" />
                        </span>
                        <span>
                            <b class="font-extrabold">Radix</b>
                            NG
                        </span>
                    </a>
                    <nav class="text-muted-foreground flex flex-wrap gap-5 text-sm">
                        <a class="hover:text-foreground no-underline" href="/docs/">Documentation</a>
                        <a class="hover:text-foreground no-underline" href="#primitives">Primitives</a>
                        <a class="hover:text-foreground no-underline" href="/docs/?path=/docs/guides-forms--docs">
                            Guides
                        </a>
                        <a
                            class="hover:text-foreground no-underline"
                            href="https://github.com/radix-ng/primitives"
                            target="_blank"
                            rel="noreferrer"
                        >
                            GitHub
                        </a>
                        <a
                            class="no-underline hover:text-[var(--landing-accent-text)]"
                            href="https://x.com/pimenovoleg"
                            target="_blank"
                            rel="noreferrer"
                        >
                            Twitter
                        </a>
                        <a
                            class="no-underline hover:text-[var(--landing-accent-text)]"
                            href="https://t.me/pimenovoleg"
                            target="_blank"
                            rel="noreferrer"
                        >
                            Telegram
                        </a>
                    </nav>
                    <span class="text-muted-foreground text-xs whitespace-nowrap">MIT licensed · community-driven</span>
                </div>
            </footer>
        </main>

        <ng-template #logoMark>
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M11.576 2.00343L3 6.28335L3.02794 16.4367C5.58784 15.3254 7.85549 13.3817 9.4478 10.6971C11.047 7.99289 11.7245 4.96369 11.5773 2.01016L11.576 2.00343ZM12.424 2.00343L21 6.28335L20.9721 16.4367C18.4122 15.3254 16.1445 13.3817 14.5522 10.6971C12.953 7.99289 12.2755 4.96369 12.4227 2.01016L12.424 2.00343ZM12.0978 22.25L3.79429 17.3315C6.13674 15.7832 8.99744 14.8743 12.0874 14.8723L12.1082 14.8723C15.1981 14.8743 18.0588 15.7832 20.3963 17.327L12.0978 22.25Z"
                />
            </svg>
        </ng-template>
    `
})
export default class LandingPage {
    protected readonly theme = inject(ThemeStore);

    protected readonly installCommand = installCommand;
    protected readonly skillCommand = skillCommand;
    protected readonly copied = signal<CopyTarget | null>(null);
    protected readonly emailEnabled = signal(false);
    protected readonly licenseAccepted = signal(false);
    protected readonly marketingEnabled = signal(true);
    protected readonly checkboxState = () => (this.licenseAccepted() ? 'checked' : 'unchecked');

    protected readonly accordionItems = [
        {
            value: 'accessibility',
            title: 'Is it accessible?',
            body: 'Yes. It follows the WAI-ARIA pattern, manages focus, and is fully operable from the keyboard.'
        },
        {
            value: 'unstyled',
            title: 'Is it unstyled?',
            body: "By default, yes. It ships no styles - every surface you see here is CSS keyed off the primitive's data-state."
        },
        {
            value: 'animation',
            title: 'Can I animate it?',
            body: 'Yes. Transitions key off [data-state=open], so open and close animate without a line of JavaScript.'
        }
    ] as const;

    protected readonly primitives = [
        'Accordion',
        'Alert Dialog',
        'Avatar',
        'Checkbox',
        'Collapsible',
        'Context Menu',
        'Dialog',
        'Dropdown Menu',
        'Hover Card',
        'Label',
        'Menubar',
        'Popover',
        'Progress',
        'Radio Group',
        'Select',
        'Separator',
        'Slider',
        'Switch',
        'Tabs',
        'Toast',
        'Toggle Group',
        'Toolbar',
        'Tooltip'
    ] as const;

    protected readonly coreTeam = [
        {
            login: 'pimenovoleg',
            avatarUrl: 'https://avatars.githubusercontent.com/u/567760?v=4',
            url: 'https://github.com/pimenovoleg',
            contributionsLabel: '1,081 contributions',
            badge: 'Maintainer'
        },
        {
            login: 'artembelik',
            avatarUrl: 'https://avatars.githubusercontent.com/u/24925224?v=4',
            url: 'https://github.com/artembelik',
            contributionsLabel: '23 contributions',
            badge: 'Contributor'
        },
        {
            login: 'pawel-twardziak',
            avatarUrl: 'https://avatars.githubusercontent.com/u/180847852?v=4',
            url: 'https://github.com/pawel-twardziak',
            contributionsLabel: '16 contributions',
            badge: 'Contributor'
        }
    ] as const;

    protected readonly community = [
        {
            login: 'jpsullivan',
            avatarUrl: 'https://avatars.githubusercontent.com/u/570899?v=4',
            url: 'https://github.com/jpsullivan',
            contributionsLabel: '13 contributions'
        },
        {
            login: 'lskramarov',
            avatarUrl: 'https://avatars.githubusercontent.com/u/9027254?v=4',
            url: 'https://github.com/lskramarov',
            contributionsLabel: '12 contributions'
        },
        {
            login: 'olegdenisov',
            avatarUrl: 'https://avatars.githubusercontent.com/u/420945?v=4',
            url: 'https://github.com/olegdenisov',
            contributionsLabel: '5 contributions'
        },
        {
            login: 'mrfrac',
            avatarUrl: 'https://avatars.githubusercontent.com/u/19538736?v=4',
            url: 'https://github.com/mrfrac',
            contributionsLabel: '3 contributions'
        },
        {
            login: 'KamilEmeleev',
            avatarUrl: 'https://avatars.githubusercontent.com/u/24388892?v=4',
            url: 'https://github.com/KamilEmeleev',
            contributionsLabel: '2 contributions'
        },
        {
            login: 'VictorZubr',
            avatarUrl: 'https://avatars.githubusercontent.com/u/35505401?v=4',
            url: 'https://github.com/VictorZubr',
            contributionsLabel: '2 contributions'
        },
        {
            login: 'zizifn',
            avatarUrl: 'https://avatars.githubusercontent.com/u/1803942?v=4',
            url: 'https://github.com/zizifn',
            contributionsLabel: '1 contribution'
        },
        {
            login: 'vitalyozza',
            avatarUrl: 'https://avatars.githubusercontent.com/u/109949088?v=4',
            url: 'https://github.com/vitalyozza',
            contributionsLabel: 'listed in docs'
        },
        {
            login: 'ayush-seth',
            avatarUrl: 'https://avatars.githubusercontent.com/u/24858182?v=4',
            url: 'https://github.com/ayush-seth',
            contributionsLabel: 'listed in docs'
        }
    ] as const;

    protected readonly stats = [
        { value: '12', label: 'Listed contributors' },
        { value: '1,158', label: 'Human contributions' },
        { value: '1,081', label: 'Maintainer contributions' },
        { value: '9', label: 'Dependabot updates' }
    ] as const;

    protected copy(target: CopyTarget, command: string): void {
        void navigator.clipboard?.writeText(command);
        this.copied.set(target);
        window.setTimeout(() => {
            if (this.copied() === target) {
                this.copied.set(null);
            }
        }, 1200);
    }
}
