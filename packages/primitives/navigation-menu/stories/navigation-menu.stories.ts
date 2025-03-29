// src/navigation-menu/stories/navigation-menu.stories.ts
import { CommonModule } from '@angular/common';
import { componentWrapperDecorator, Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { LucideAngularModule } from 'lucide-angular';
import { RdxNavigationMenuContentDirective } from '../src/navigation-menu-content.directive';
import { RdxNavigationMenuIndicatorDirective } from '../src/navigation-menu-indicator.directive';
import { RdxNavigationMenuItemDirective } from '../src/navigation-menu-item.directive';
import { RdxNavigationMenuLinkDirective } from '../src/navigation-menu-link.directive';
import { RdxNavigationMenuListDirective } from '../src/navigation-menu-list.directive';
import { RdxNavigationMenuTriggerDirective } from '../src/navigation-menu-trigger.directive';
import { RdxNavigationMenuViewportDirective } from '../src/navigation-menu-viewport.directive';
import { RdxNavigationMenuDirective } from '../src/navigation-menu.directive';

const html = String.raw;

export default {
    title: 'Primitives/Navigation Menu',
    decorators: [
        moduleMetadata({
            imports: [
                CommonModule,
                RdxNavigationMenuDirective,
                RdxNavigationMenuListDirective,
                RdxNavigationMenuItemDirective,
                RdxNavigationMenuTriggerDirective,
                RdxNavigationMenuContentDirective,
                RdxNavigationMenuLinkDirective,
                RdxNavigationMenuIndicatorDirective,
                RdxNavigationMenuViewportDirective,
                LucideAngularModule
            ]
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
                        background: linear-gradient(330deg, rgba(161, 140, 209, 0.5) 0%, rgba(251, 194, 235, 0.5) 100%);
                        display: flex;
                        justify-content: center;
                        min-height: 400px;
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
            <nav class="NavigationMenuRoot" rdxNavigationMenu [orientation]="'horizontal'">
                <ul class="NavigationMenuList" rdxNavigationMenuList>
                    <li class="NavigationMenuItem" rdxNavigationMenuItem value="learn">
                        <button class="NavigationMenuTrigger" rdxNavigationMenuTrigger>
                            Learn
                            <svg
                                class="CaretDown"
                                width="12"
                                height="12"
                                viewBox="0 0 12 12"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path d="M6 8.5L2 4.5H10L6 8.5Z" fill="currentColor"></path>
                            </svg>
                        </button>
                        <div class="NavigationMenuContent" rdxNavigationMenuContent>
                            <ul class="List one">
                                <li style="grid-row: span 3;">
                                    <a class="Callout" href="/">
                                        <svg aria-hidden="true" width="38" height="38" viewBox="0 0 25 25" fill="white">
                                            <path
                                                d="M12 25C7.58173 25 4 21.4183 4 17C4 12.5817 7.58173 9 12 9V25Z"
                                            ></path>
                                            <path d="M12 0H4V8H12V0Z"></path>
                                            <path
                                                d="M17 8C19.2091 8 21 6.20914 21 4C21 1.79086 19.2091 0 17 0C14.7909 0 13 1.79086 13 4C13 6.20914 14.7909 8 17 8Z"
                                            ></path>
                                        </svg>
                                        <div class="CalloutHeading">Radix Primitives</div>
                                        <p class="CalloutText">Unstyled, accessible components for Angular.</p>
                                    </a>
                                </li>

                                <li>
                                    <a class="ListItemLink" href="https://tailwindcss.com/">
                                        <div class="ListItemHeading">Tailwind CSS</div>
                                        <p class="ListItemText">
                                            A utility-first CSS framework for rapid UI development.
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
                                    <a class="ListItemLink" href="https://lucide.dev/">
                                        <div class="ListItemHeading">Icons</div>
                                        <p class="ListItemText">A beautifully crafted open-source icon set.</p>
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
                                width="12"
                                height="12"
                                viewBox="0 0 12 12"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path d="M6 8.5L2 4.5H10L6 8.5Z" fill="currentColor"></path>
                            </svg>
                        </button>
                        <!-- Content is invisible here, but gets rendered in the viewport when active -->
                        <div class="NavigationMenuContentWrapper" style="visibility: hidden; position: absolute;">
                            <div class="NavigationMenuContent" rdxNavigationMenuContent>
                                <ul class="List two">
                                    <li>
                                        <a class="ListItemLink" href="/docs/introduction">
                                            <div class="ListItemHeading">Introduction</div>
                                            <p class="ListItemText">
                                                Build high-quality, accessible design systems and web apps.
                                            </p>
                                        </a>
                                    </li>
                                    <li>
                                        <a class="ListItemLink" href="/docs/getting-started">
                                            <div class="ListItemHeading">Getting started</div>
                                            <p class="ListItemText">
                                                A quick tutorial to get you up and running with Radix Primitives.
                                            </p>
                                        </a>
                                    </li>
                                    <li>
                                        <a class="ListItemLink" href="/docs/styling">
                                            <div class="ListItemHeading">Styling</div>
                                            <p class="ListItemText">
                                                Unstyled and compatible with any styling solution.
                                            </p>
                                        </a>
                                    </li>
                                    <li>
                                        <a class="ListItemLink" href="/docs/animation">
                                            <div class="ListItemHeading">Animation</div>
                                            <p class="ListItemText">
                                                Use CSS keyframes or any animation library of your choice.
                                            </p>
                                        </a>
                                    </li>
                                    <li>
                                        <a class="ListItemLink" href="/docs/accessibility">
                                            <div class="ListItemHeading">Accessibility</div>
                                            <p class="ListItemText">
                                                Tested in a range of browsers and assistive technologies.
                                            </p>
                                        </a>
                                    </li>
                                    <li>
                                        <a class="ListItemLink" href="/docs/releases">
                                            <div class="ListItemHeading">Releases</div>
                                            <p class="ListItemText">Radix Primitives releases and their changelogs.</p>
                                        </a>
                                    </li>
                                </ul>
                            </div>
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

            <style>
                /* reset */
                button,
                p {
                    all: unset;
                }

                .NavigationMenuRoot {
                    position: relative;
                    display: flex;
                    justify-content: center;
                    width: 100%;
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
                    position: relative; /* Important for indicator positioning */
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
                    color: #6c4ac9; /* violet-11 */
                }

                .NavigationMenuTrigger:focus,
                .NavigationMenuLink:focus {
                    box-shadow: 0 0 0 2px #9a83db; /* violet-7 */
                }

                .NavigationMenuTrigger:hover,
                .NavigationMenuLink:hover {
                    background-color: #eeedfc; /* violet-3 */
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

                .NavigationMenuIndicator {
                    position: absolute;
                    display: flex;
                    align-items: flex-end;
                    justify-content: center;
                    height: 10px;
                    bottom: -7px; /* Position right below the menu */
                    left: 0;
                    width: 20px; /* Default width */
                    overflow: hidden;
                    z-index: 1;
                    transition: all 250ms ease;
                    /* Hide by default */
                    opacity: 0;
                    pointer-events: none;
                }

                .NavigationMenuIndicator[data-state='visible'] {
                    opacity: 1;
                    animation: fadeIn 200ms ease;
                }

                .NavigationMenuIndicator[data-state='hidden'] {
                    opacity: 0;
                    animation: fadeOut 200ms ease;
                }

                .NavigationMenuContent {
                    visibility: hidden;
                    position: absolute;
                    top: 0;
                    left: 0;
                    pointer-events: none;
                }

                .NavigationMenuViewport .NavigationMenuContent {
                    visibility: visible;
                    position: relative;
                    pointer-events: auto;
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
                        hsla(206, 22%, 7%, 0.35) 0px 10px 38px -10px,
                        hsla(206, 22%, 7%, 0.2) 0px 10px 20px -15px;
                    height: var(--radix-navigation-menu-viewport-height);
                    transition:
                        width,
                        height,
                        300ms ease;
                }

                .NavigationMenuViewport[data-state='open'] {
                    animation: scaleIn 200ms ease;
                }

                .NavigationMenuViewport[data-state='closed'] {
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
                    box-shadow: 0 0 0 2px #9a83db; /* violet-7 */
                }

                .ListItemLink:hover {
                    background-color: #f5f5f7; /* mauve-3 */
                }

                .ListItemHeading {
                    font-weight: 500;
                    line-height: 1.2;
                    margin-bottom: 5px;
                    color: #1a1523; /* violet-12 */
                }

                .ListItemText {
                    color: #8e8c95; /* mauve-11 */
                    line-height: 1.4;
                    font-weight: initial;
                }

                .Callout {
                    display: flex;
                    justify-content: flex-end;
                    flex-direction: column;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(135deg, #8257e6 0%, #4120a9 100%); /* purple-9 to indigo-9 */
                    border-radius: 6px;
                    padding: 25px;
                    text-decoration: none;
                    outline: none;
                    user-select: none;
                }

                .Callout:focus {
                    box-shadow: 0 0 0 2px #9a83db; /* violet-7 */
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
                    color: #e4e2e4; /* mauve-4 */
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
                    color: #825ed1; /* violet-10 */
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
    })
};
