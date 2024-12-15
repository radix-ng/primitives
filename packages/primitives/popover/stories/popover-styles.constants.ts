const appliedAnimations = `
.PopoverContent[data-state='open'][data-side='top'] {
    animation-name: rdxSlideDownAndFade;
}

.PopoverContent[data-state='open'][data-side='right'] {
    animation-name: rdxSlideLeftAndFade;
}

.PopoverContent[data-state='open'][data-side='bottom'] {
    animation-name: rdxSlideUpAndFade;
}

.PopoverContent[data-state='open'][data-side='left'] {
    animation-name: rdxSlideRightAndFade;
}

.PopoverContent[data-state='closed'][data-side='top'] {
    animation-name: rdxSlideDownAndFadeReverse;
}

.PopoverContent[data-state='closed'][data-side='right'] {
    animation-name: rdxSlideLeftAndFadeReverse;
}

.PopoverContent[data-state='closed'][data-side='bottom'] {
    animation-name: rdxSlideUpAndFadeReverse;
}

.PopoverContent[data-state='closed'][data-side='left'] {
    animation-name: rdxSlideRightAndFadeReverse;
}
`;

const animationParams = `
.PopoverContent {
    animation-duration: 400ms;
    animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
    will-change: transform, opacity;
}
`;

const animationDefs = `
/* Open animations */

@keyframes rdxSlideUpAndFade {
    from {
        opacity: 0;
        transform: translateY(2px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes rdxSlideRightAndFade {
    from {
        opacity: 0;
        transform: translateX(-2px);
    }
    to {
        opacity: 1;
        transform: translateX(0);
    }
}

@keyframes rdxSlideDownAndFade {
    from {
        opacity: 0;
        transform: translateY(-2px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes rdxSlideLeftAndFade {
    from {
        opacity: 0;
        transform: translateX(2px);
    }
    to {
        opacity: 1;
        transform: translateX(0);
    }
}

/* Close animations */

@keyframes rdxSlideUpAndFadeReverse {
    from {
        opacity: 1;
        transform: translateY(0);
    }
    to {
        opacity: 0;
        transform: translateY(2px);
    }
}

@keyframes rdxSlideRightAndFadeReverse {
    from {
        opacity: 1;
        transform: translateX(0);
    }
    to {
        opacity: 0;
        transform: translateX(-2px);
    }
}

@keyframes rdxSlideDownAndFadeReverse {
    from {
        opacity: 1;
        transform: translateY(0);
    }
    to {
        opacity: 0;
        transform: translateY(-2px);
    }
}

@keyframes rdxSlideLeftAndFadeReverse {
    from {
        opacity: 1;
        transform: translateX(0);
    }
    to {
        opacity: 0;
        transform: translateX(2px);
    }
}
`;

const events = `
/* =============== Event messages =============== */

.MessagesContainer {
    padding: 20px;
}

.Message {
    color: var(--white-a12);
    font-size: 15px;
    line-height: 19px;
    font-weight: bolder;
}

.MessageId {
    font-size: 75%;
    font-weight: light;
}
`;

const params = `
/* =============== Params layout =============== */

.ParamsContainer {
    display: flex;
    column-gap: 8px;
    color: var(--white-a12);
    margin-bottom: 32px;
}
`;

function styles(withAnimations = false, withEvents = false, withParams = true) {
    return `
.container {
    height: 450px;
    display: flex;
    justify-content: center;
    align-items: center;
}

/* reset */
.reset {
    all: unset;
}

.ExampleSubtitle {
    color: var(--white-a12);
    font-size: 22px;
    line-height: 26px;
    font-weight: bolder;
    margin: 0 0 34px 16px;
}

.PopoverContent {
    border-radius: 4px;
    padding: 20px;
    width: 260px;
    background-color: white;
    box-shadow:
        hsl(206 22% 7% / 35%) 0px 10px 38px -10px,
        hsl(206 22% 7% / 20%) 0px 10px 20px -15px;
}

${withAnimations ? animationParams : ''}

${withAnimations ? appliedAnimations : ''}

.PopoverContent:focus {
    box-shadow:
        hsl(206 22% 7% / 35%) 0px 10px 38px -10px,
        hsl(206 22% 7% / 20%) 0px 10px 20px -15px,
        0 0 0 2px var(--violet-7);
}

.PopoverArrow {
    fill: white;
}

.PopoverClose {
    font-family: inherit;
    border-radius: 100%;
    height: 25px;
    width: 25px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: var(--violet-11);
    position: absolute;
    top: 5px;
    right: 5px;
}

.PopoverClose:hover {
    background-color: var(--violet-4);
}

.PopoverClose:focus {
    box-shadow: 0 0 0 2px var(--violet-7);
}

.IconButton {
    font-family: inherit;
    border-radius: 100%;
    height: 35px;
    width: 35px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: var(--violet-11);
    background-color: white;
    box-shadow: 0 2px 10px var(--black-a7);
}

.IconButton:hover {
    background-color: var(--violet-3);
}

.IconButton:focus {
    box-shadow: 0 0 0 2px black;
}

.Fieldset {
    display: flex;
    gap: 20px;
    align-items: center;
}

.Label {
    font-size: 13px;
    color: var(--violet-11);
    width: 75px;
}

.Input {
    width: 100%;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: 1;
    border-radius: 4px;
    padding: 0 10px;
    font-size: 13px;
    line-height: 1;
    color: var(--violet-11);
    box-shadow: 0 0 0 1px var(--violet-7);
    height: 25px;
}

.Input:focus {
    box-shadow: 0 0 0 2px var(--violet-8);
}

.Text {
    margin: 0;
    color: var(--mauve-12);
    font-size: 15px;
    line-height: 19px;
    font-weight: 500;
}

${withAnimations ? animationDefs : ''}

${withParams ? params : ''}

${withEvents ? events : ''}
`;
}

export const animationStylesOnly = `
${animationParams}

${appliedAnimations}

${animationDefs}
`;

export const paramsAndEventsOnly = `
${params}

${events}
`;

export default styles;
