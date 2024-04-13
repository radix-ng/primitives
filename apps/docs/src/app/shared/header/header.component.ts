import { Component } from '@angular/core';

@Component({
    selector: 'radix-ng-docs-header',
    standalone: true,
    template: `
        <div class="sticky top-0 z-[999] flex w-full items-center">
            <nav
                class="block px-8 backdrop-saturate-200 backdrop-blur-2xl bg-opacity-80 border border-white/80 text-white w-full max-w-full rounded-none border-b-[1.5px] !border-blue-gray-50 bg-white py-1.5 !pl-2 !pr-3 lg:!px-4 lg:!py-0.5"
            >
                <div class="container mx-auto">
                    <div class="flex w-full items-center !justify-between">
                        <a
                            class="py-2.375 mr-4 flex flex-shrink-0 items-center gap-2 text-inherit lg:ml-0"
                            href="/"
                        >
                            <p
                                class="block antialiased font-sans text-lg leading-10 font-bold text-primary"
                            >
                                Radix Angular
                            </p>
                        </a>
                        <div
                            class="lg:base-auto hidden flex-grow basis-full items-center lg:flex lg-max:max-h-0"
                        >
                            <div class="flex w-full flex-col justify-end lg:!ml-auto lg:flex-row">
                                <nav
                                    class="flex flex-col gap-1 p-2 font-sans text-base font-normal text-blue-gray-700 min-w-max px-0 lg:!flex-row"
                                ></nav>
                                <div class="ml-2 flex items-center gap-2">
                                    <div
                                        class="pt-1 pb-0 flex items-center w-full rounded-lg text-start transition-all hover:bg-blue-gray-50 hover:bg-opacity-80 focus:bg-blue-gray-50 focus:bg-opacity-80 active:bg-blue-gray-50 active:bg-opacity-80 focus:text-blue-gray-900 active:text-blue-gray-900 outline-none text-sm text-gray-800 hover:text-gray-900"
                                    >
                                        <a
                                            class="github-button"
                                            href="https://github.com/radix-ng/primitives"
                                            data-color-scheme="no-preference: light; light: light; dark: dark;"
                                            data-icon="octicon-star"
                                            data-show-count="true"
                                            aria-label="Star radix-ng/primitives on GitHub"
                                            style="margin-bottom: 0"
                                        >
                                            Stars
                                        </a>
                                    </div>
                                    <a
                                        target="_blank"
                                        class="flex items-center gap-2 p-1.5 text-black"
                                        href="https://github.com/radix-ng/primitives"
                                    >
                                        <i
                                            class="bi bi-github text-xl leading-none"
                                            aria-hidden="true"
                                        ></i>
                                    </a>
                                    <a
                                        target="_blank"
                                        rel="noreferrer"
                                        class="p-1.5 leading-none text-black"
                                        href="https://github.com/radix-ng/primitives/discussions"
                                    >
                                        <i
                                            class="bi bi-chat-fill text-xl leading-none"
                                            aria-hidden="true"
                                        ></i>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>
        </div>
    `
})
export class HeaderComponent {}
