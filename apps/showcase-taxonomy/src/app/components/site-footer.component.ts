import { Component } from '@angular/core';

@Component({
    standalone: true,
    selector: 'tx-site-footer',
    template: `
        <footer>
            <div
                class="container flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0"
            >
                <div class="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
                    <p class="text-center text-sm leading-loose md:text-left">
                        Built by
                        <a
                            href="https://twitter.com/shadcn"
                            target="_blank"
                            rel="noreferrer"
                            class="font-medium underline underline-offset-4"
                        >
                            shadcn
                        </a>
                        . Hosted on
                        <a
                            href="https://vercel.com"
                            target="_blank"
                            rel="noreferrer"
                            class="font-medium underline underline-offset-4"
                        >
                            Vercel
                        </a>
                        . Illustrations by
                        <a
                            href="https://popsy.co"
                            target="_blank"
                            rel="noreferrer"
                            class="font-medium underline underline-offset-4"
                        >
                            Popsy
                        </a>
                        . The source code is available on
                        <a
                            href="https://github.com/radix-ng/primitives/tree/main/apps/showcase-taxonomy"
                            target="_blank"
                            rel="noreferrer"
                            class="font-medium underline underline-offset-4"
                        >
                            GitHub
                        </a>
                        .
                    </p>
                </div>
            </div>
        </footer>
    `
})
export class TxSiteFooterComponent {}
