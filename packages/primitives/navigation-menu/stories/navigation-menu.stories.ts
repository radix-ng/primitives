import { CommonModule } from '@angular/common';
import { provideAnimations } from '@angular/platform-browser/animations';
import { componentWrapperDecorator, Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { RdxNavigationMenuModule } from '../index';

const html = String.raw;

export default {
    title: 'Primitives/Navigation Menu',
    decorators: [
        moduleMetadata({
            imports: [CommonModule, RdxNavigationMenuModule],
            providers: [provideAnimations()]
        }),
        componentWrapperDecorator(
            (story) => html`
                <div class="story-wrapper">${story}</div>

                <style>
                    .story-wrapper {
                        font-family:
                            -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell,
                            'Open Sans', 'Helvetica Neue', sans-serif;
                        padding: 50px 0;
                        min-height: 400px;
                        display: flex;
                        position: relative;
                        justify-content: center;
                        align-items: flex-start;
                        box-sizing: border-box;
                    }

                    /* reset */
                    *,
                    :after,
                    :before {
                        box-sizing: border-box;
                    }
                    button,
                    p {
                        all: unset;
                    }

                    .NavigationMenuRoot {
                        position: relative;
                        display: flex;
                        justify-content: center;
                        width: 100vw;
                        z-index: 1;
                    }

                    .NavigationMenuList {
                        display: flex;
                        justify-content: center;
                        background-color: white;
                        padding: 4px;
                        border-radius: 6px;
                        list-style: none;
                        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                        margin: 0;
                    }

                    .NavigationMenuTrigger,
                    .NavigationMenuLink {
                        padding: 8px 12px;
                        outline: none;
                        user-select: none;
                        font-weight: 500;
                        line-height: 1;
                        border-radius: 4px;
                        font-size: 15px;
                        color: #6952a7;
                    }
                    .NavigationMenuTrigger:focus,
                    .NavigationMenuLink:focus {
                        box-shadow: 0 0 0 2px #a28fd0;
                    }
                    .NavigationMenuTrigger:hover,
                    .NavigationMenuLink:hover {
                        background-color: #f1eefc;
                    }

                    .NavigationMenuTrigger {
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        gap: 2px;
                    }

                    .NavigationMenuLink {
                        display: block;
                        text-decoration: none;
                        font-size: 15px;
                        line-height: 1;
                    }

                    .NavigationMenuContentWrapper {
                        position: absolute;
                        top: 0;
                        left: 0;
                        width: 100%;
                        animation-duration: 250ms;
                        animation-timing-function: ease;
                        transition:
                            opacity 250ms ease,
                            transform 250ms ease;
                    }
                    .NavigationMenuContentWrapper[data-state='closed'] {
                        opacity: 0;
                    }
                    .NavigationMenuContentWrapper[data-state='open'] {
                        opacity: 1;
                    }
                    .NavigationMenuContentWrapper[data-motion='from-start'] {
                        animation-name: enterFromLeft;
                    }
                    .NavigationMenuContentWrapper[data-motion='from-end'] {
                        animation-name: enterFromRight;
                    }
                    .NavigationMenuContentWrapper[data-motion='to-start'] {
                        animation-name: exitToLeft;
                    }
                    .NavigationMenuContentWrapper[data-motion='to-end'] {
                        animation-name: exitToRight;
                    }

                    .NavigationMenuContent {
                        position: absolute;
                        top: 0;
                        left: 0;
                        width: 100%;
                        animation-duration: 250ms;
                        animation-timing-function: ease;
                    }

                    @media only screen and (min-width: 600px) {
                        .NavigationMenuContent {
                            width: auto;
                        }
                    }

                    .NavigationMenuIndicator {
                        display: flex;
                        align-items: flex-end;
                        justify-content: center;
                        height: 10px;
                        top: 100%;
                        overflow: hidden;
                        z-index: 1;
                        transition:
                            width,
                            transform 250ms ease;
                    }
                    .NavigationMenuIndicator[data-state='visible'] {
                        animation: fadeIn 200ms ease;
                    }
                    .NavigationMenuIndicator[data-state='hidden'] {
                        animation: fadeOut 200ms ease;
                    }

                    .NavigationMenuViewport {
                        position: relative;
                        transform-origin: top center;
                        margin-top: 10px;
                        width: 100%;
                        background-color: white;
                        border-radius: 6px;
                        overflow: hidden;
                        box-shadow:
                            0px 10px 38px -10px rgba(22, 23, 24, 0.35),
                            0px 10px 20px -15px rgba(22, 23, 24, 0.2);
                        height: var(--radix-navigation-menu-viewport-height);
                        transition:
                            width 300ms ease,
                            height 300ms ease,
                            opacity 200ms ease-out;
                        opacity: 1;
                    }
                    .NavigationMenuViewport[data-state='open'] {
                        opacity: 1;
                        animation: scaleIn 200ms ease;
                    }
                    .NavigationMenuViewport[data-state='closed'] {
                        opacity: 0;
                        animation: scaleOut 200ms ease;
                    }
                    @media only screen and (min-width: 600px) {
                        .NavigationMenuViewport {
                            width: var(--radix-navigation-menu-viewport-width);
                        }
                    }

                    .List {
                        display: grid;
                        padding: 22px;
                        margin: 0;
                        column-gap: 10px;
                        list-style: none;
                    }
                    @media only screen and (min-width: 600px) {
                        .List.one {
                            width: 500px;
                            grid-template-columns: 0.75fr 1fr;
                        }
                        .List.two {
                            width: 600px;
                            grid-auto-flow: column;
                            grid-template-rows: repeat(3, 1fr);
                        }
                    }

                    .ListItemLink {
                        display: block;
                        outline: none;
                        text-decoration: none;
                        user-select: none;
                        padding: 12px;
                        border-radius: 6px;
                        font-size: 15px;
                        line-height: 1;
                    }
                    .ListItemLink:focus {
                        box-shadow: 0 0 0 2px #9574db;
                    }
                    .ListItemLink:hover {
                        background-color: #f5f3ff;
                    }

                    .ListItemHeading {
                        font-weight: 500;
                        line-height: 1.2;
                        margin-bottom: 5px;
                        color: #1e085a;
                    }

                    .ListItemText {
                        color: #696096;
                        line-height: 1.4;
                        font-weight: initial;
                    }

                    .Callout {
                        display: flex;
                        justify-content: flex-end;
                        flex-direction: column;
                        width: 100%;
                        height: 100%;
                        background: linear-gradient(135deg, #8257e6 0%, #4120a9 100%);
                        border-radius: 6px;
                        padding: 25px;
                        text-decoration: none;
                        outline: none;
                        user-select: none;
                    }
                    .Callout:focus {
                        box-shadow: 0 0 0 2px #9574db;
                    }

                    .CalloutHeading {
                        color: white;
                        font-size: 18px;
                        font-weight: 500;
                        line-height: 1.2;
                        margin-top: 16px;
                        margin-bottom: 7px;
                    }

                    .CalloutText {
                        color: #e4e2e4;
                        font-size: 14px;
                        line-height: 1.3;
                    }

                    .ViewportPosition {
                        position: absolute;
                        display: flex;
                        justify-content: center;
                        width: 100%;
                        top: 100%;
                        left: 0;
                        perspective: 2000px;
                    }

                    .CaretDown {
                        position: relative;
                        color: #7952c7;
                        top: 1px;
                        transition: transform 250ms ease;
                    }

                    [data-state='open'] > .CaretDown {
                        transform: rotate(-180deg);
                    }

                    .Arrow {
                        position: relative;
                        top: 70%;
                        background-color: white;
                        width: 10px;
                        height: 10px;
                        transform: rotate(45deg);
                        border-top-left-radius: 2px;
                    }

                    @keyframes enterFromRight {
                        from {
                            opacity: 0;
                            transform: translateX(200px);
                        }
                        to {
                            opacity: 1;
                            transform: translateX(0);
                        }
                    }

                    @keyframes enterFromLeft {
                        from {
                            opacity: 0;
                            transform: translateX(-200px);
                        }
                        to {
                            opacity: 1;
                            transform: translateX(0);
                        }
                    }

                    @keyframes exitToRight {
                        from {
                            opacity: 1;
                            transform: translateX(0);
                        }
                        to {
                            opacity: 0;
                            transform: translateX(200px);
                        }
                    }

                    @keyframes exitToLeft {
                        from {
                            opacity: 1;
                            transform: translateX(0);
                        }
                        to {
                            opacity: 0;
                            transform: translateX(-200px);
                        }
                    }

                    @keyframes scaleIn {
                        from {
                            opacity: 0;
                            transform: rotateX(-30deg) scale(0.9);
                        }
                        to {
                            opacity: 1;
                            transform: rotateX(0deg) scale(1);
                        }
                    }

                    @keyframes scaleOut {
                        from {
                            opacity: 1;
                            transform: rotateX(0deg) scale(1);
                        }
                        to {
                            opacity: 0;
                            transform: rotateX(-10deg) scale(0.95);
                        }
                    }

                    @keyframes fadeIn {
                        from {
                            opacity: 0;
                        }
                        to {
                            opacity: 1;
                        }
                    }

                    @keyframes fadeOut {
                        from {
                            opacity: 1;
                        }
                        to {
                            opacity: 0;
                        }
                    }
                </style>
            `
        )
    ]
} as Meta;

type Story = StoryObj;

export const Default: Story = {
    render: () => ({
        template: html`
            <nav class="NavigationMenuRoot" rdxNavigationMenu>
                <ul class="NavigationMenuList" rdxNavigationMenuList>
                    <li class="NavigationMenuItem" rdxNavigationMenuItem value="learn">
                        <button class="NavigationMenuTrigger" rdxNavigationMenuTrigger>
                            Learn
                            <svg
                                class="CaretDown"
                                width="15"
                                height="15"
                                viewBox="0 0 15 15"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                aria-hidden="true"
                            >
                                <path
                                    d="M4.18179 6.18181C4.35753 6.00608 4.64245 6.00608 4.81819 6.18181L7.49999 8.86362L10.1818 6.18181C10.3575 6.00608 10.6424 6.00608 10.8182 6.18181C10.9939 6.35755 10.9939 6.64247 10.8182 6.81821L7.81819 9.81821C7.73379 9.9026 7.61934 9.95001 7.49999 9.95001C7.38064 9.95001 7.26618 9.9026 7.18179 9.81821L4.18179 6.81821C4.00605 6.64247 4.00605 6.35755 4.18179 6.18181Z"
                                    fill="currentColor"
                                    fill-rule="evenodd"
                                    clip-rule="evenodd"
                                ></path>
                            </svg>
                        </button>

                        <div class="NavigationMenuContent" *rdxNavigationMenuContent>
                            <ul class="List one">
                                <li style="grid-row: span 3;">
                                    <a class="Callout" href="https://www.radix-ng.com/">
                                        <svg width="38" height="38" viewBox="0 0 24 24" fill="white">
                                            <path
                                                fill-rule="evenodd"
                                                clip-rule="evenodd"
                                                d="M11.576 2.00343L3 6.28335L3.02794 16.4367L3.02533 16.4391L3.02794 16.4379L3.02795 16.4408L3.03419 16.4352C5.58784 15.3254 7.85549 13.3817 9.4478 10.6971L9.45551 10.6902L9.45806 10.6798C11.047 7.99289 11.7245 4.96369 11.5773 2.01016L11.5794 2.00173L11.577 2.00294L11.5768 2L11.576 2.00343ZM12.424 2.00343L21 6.28335L20.9721 16.4367L20.9747 16.4391L20.9721 16.4379L20.972 16.4408L20.9658 16.4352C18.4122 15.3254 16.1445 13.3817 14.5522 10.6971L14.5445 10.6902L14.5419 10.6798C12.953 7.99289 12.2755 4.96369 12.4227 2.01016L12.4206 2.00173L12.423 2.00294L12.4232 2L12.424 2.00343ZM12.0978 22.25L3.79429 17.3315L3.79085 17.3325L3.79328 17.3309L3.79085 17.3295L3.79922 17.327C6.13674 15.7832 8.99744 14.8743 12.0874 14.8723L12.0978 14.8692L12.1082 14.8723C15.1981 14.8743 18.0588 15.7832 20.3963 17.327L20.4048 17.3295L20.4023 17.3309L20.4047 17.3325L20.4013 17.3315L12.0978 22.25Z"
                                            ></path>
                                        </svg>
                                        <div class="CalloutHeading">Radix Primitives</div>
                                        <p class="CalloutText">Unstyled, accessible components for Angular.</p>
                                    </a>
                                </li>

                                <li>
                                    <a
                                        class="ListItemLink"
                                        href="https://www.radix-ng.com/themes/overview/getting-started"
                                    >
                                        <div class="ListItemHeading">Themes</div>
                                        <p class="ListItemText">
                                            Pre-styled component library designed to work out of the box.
                                        </p>
                                    </a>
                                </li>
                                <li>
                                    <a class="ListItemLink" href="/colors">
                                        <div class="ListItemHeading">Colors</div>
                                        <p class="ListItemText">Beautiful, thought-out palettes with auto dark mode.</p>
                                    </a>
                                </li>
                                <li>
                                    <a class="ListItemLink" href="https://icons.radix-ui.com/">
                                        <div class="ListItemHeading">Icons</div>
                                        <p class="ListItemText">A crisp set of 15x15 icons, balanced and consistent.</p>
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </li>

                    <li class="NavigationMenuItem" rdxNavigationMenuItem value="overview">
                        <button class="NavigationMenuTrigger" rdxNavigationMenuTrigger>
                            Overview
                            <svg
                                class="CaretDown"
                                width="15"
                                height="15"
                                viewBox="0 0 15 15"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                aria-hidden="true"
                            >
                                <path
                                    d="M4.18179 6.18181C4.35753 6.00608 4.64245 6.00608 4.81819 6.18181L7.49999 8.86362L10.1818 6.18181C10.3575 6.00608 10.6424 6.00608 10.8182 6.18181C10.9939 6.35755 10.9939 6.64247 10.8182 6.81821L7.81819 9.81821C7.73379 9.9026 7.61934 9.95001 7.49999 9.95001C7.38064 9.95001 7.26618 9.9026 7.18179 9.81821L4.18179 6.81821C4.00605 6.64247 4.00605 6.35755 4.18179 6.18181Z"
                                    fill="currentColor"
                                    fill-rule="evenodd"
                                    clip-rule="evenodd"
                                ></path>
                            </svg>
                        </button>

                        <div class="NavigationMenuContent" *rdxNavigationMenuContent>
                            <ul class="List two">
                                <li>
                                    <a
                                        class="ListItemLink"
                                        href="https://www.radix-ng.com/primitives/overview/introduction"
                                    >
                                        <div class="ListItemHeading">Introduction</div>
                                        <p class="ListItemText">
                                            Build high-quality, accessible design systems and web apps.
                                        </p>
                                    </a>
                                </li>
                                <li>
                                    <a
                                        class="ListItemLink"
                                        href="https://www.radix-ng.com/primitives/overview/getting-started"
                                    >
                                        <div class="ListItemHeading">Getting started</div>
                                        <p class="ListItemText">
                                            A quick tutorial to get you up and running with Radix Primitives.
                                        </p>
                                    </a>
                                </li>
                                <li>
                                    <a class="ListItemLink" href="https://www.radix-ng.com/primitives/overview/styling">
                                        <div class="ListItemHeading">Styling</div>
                                        <p class="ListItemText">Unstyled and compatible with any styling solution.</p>
                                    </a>
                                </li>
                                <li>
                                    <a
                                        class="ListItemLink"
                                        href="https://www.radix-ng.com/primitives/overview/accessibility"
                                    >
                                        <div class="ListItemHeading">Accessibility</div>
                                        <p class="ListItemText">
                                            Tested in a range of browsers and assistive technologies.
                                        </p>
                                    </a>
                                </li>
                                <li>
                                    <a
                                        class="ListItemLink"
                                        href="https://www.radix-ng.com/primitives/overview/contribute"
                                    >
                                        <div class="ListItemHeading">Contribute</div>
                                        <p class="ListItemText">Contribute to the open source project on GitHub.</p>
                                    </a>
                                </li>
                                <li>
                                    <a class="ListItemLink" href="https://github.com/radix-ng/primitives/releases">
                                        <div class="ListItemHeading">Releases</div>
                                        <p class="ListItemText">Radix Primitives releases and their changelogs.</p>
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </li>

                    <li class="NavigationMenuItem" rdxNavigationMenuItem>
                        <a class="NavigationMenuLink" rdxNavigationMenuLink href="https://github.com/radix-ui">
                            Github
                        </a>
                    </li>

                    <div class="NavigationMenuIndicator" rdxNavigationMenuIndicator>
                        <div class="Arrow"></div>
                    </div>
                </ul>

                <div class="ViewportPosition">
                    <div class="NavigationMenuViewport" rdxNavigationMenuViewport></div>
                </div>
            </nav>
        `
    })
};
