import { Component } from '@angular/core';

@Component({
    selector: 'radix-ng-home',
    standalone: true,
    template: `
        <div class="container relative">
            <section
                class="mx-auto flex max-w-[980px] flex-col items-center gap-2 py-8 md:py-12 md:pb-8 lg:py-24 lg:pb-20"
            >
                <h1
                    class="text-center text-3xl font-bold leading-tight tracking-tighter md:text-6xl lg:leading-[1.1]"
                >
                    Radix Angular
                </h1>

                <span
                    class="max-w-[750px] text-center text-lg text-muted-foreground sm:text-xl"
                    style="display: inline-block; vertical-align: top; text-decoration: inherit; max-width: 568px;"
                >
                    Unstyled, accessible components for building high‑quality design systems and web
                    apps in Angular.
                </span>

                <div class="flex w-full items-center justify-center space-x-4 py-4 md:pb-10">
                    <a
                        data-accent-color
                        class="rt-reset rt-BaseButton rt-r-size-2 rt-variant-solid rt-high-contrast rt-Button"
                        href="https://sb.radix-ng.com"
                    >
                        Get Started
                    </a>
                    <a
                        data-accent-color
                        class="rt-reset rt-BaseButton rt-r-size-2 rt-variant-surface rt-high-contrast rt-Button"
                        href="https://github.com/radix-ng/primitives"
                    >
                        Github
                    </a>
                </div>
            </section>

            <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <div
                    class="flex-col bg-clip-border text-gray-700 shadow-none relative !grid overflow-hidden rounded-xl border-[1.5px] border-blue-gray-50 bg-white col-span-1"
                >
                    <div class="p-6 relative z-10 grid">
                        <div>
                            <h3
                                class="block antialiased tracking-normal font-sans text-3xl font-semibold leading-snug my-2 text-black"
                            >
                                Save time. Ship faster.
                            </h3>
                            <p
                                class="block antialiased font-sans text-base leading-relaxed font-normal text-gray-600"
                            >
                                Building on top Radix components will save you time and money, so
                                you can ship a better product faster.
                            </p>
                        </div>
                        <div class="self-end">
                            <div class="mt-16 flex items-center gap-12 px-4">
                                <div class="flex flex-col items-center justify-center gap-2">
                                    <h6
                                        class="block antialiased tracking-normal font-sans text-base font-semibold leading-relaxed text-black"
                                    >
                                        Angular
                                    </h6>
                                </div>
                                <div class="flex flex-col items-center justify-center gap-2">
                                    <h6
                                        class="block antialiased tracking-normal font-sans text-base font-semibold leading-relaxed text-black"
                                    >
                                        Angular CDK
                                    </h6>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div
                    class="flex-col bg-clip-border text-gray-700 shadow-none relative !grid overflow-hidden rounded-xl border-[1.5px] border-blue-gray-50 bg-white col-span-1"
                >
                    <div class="p-6 relative z-10 grid">
                        <div>
                            <h3
                                class="block antialiased tracking-normal font-sans text-3xl font-semibold leading-snug my-2 text-black"
                            >
                                Accessibility out of the box.
                            </h3>
                            <p
                                class="block antialiased font-sans text-base leading-relaxed font-normal text-gray-600"
                            >
                                WAI-ARIA compliant. Support Keyboard navigation & Focus management.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `
})
export default class HomePageComponent {}
