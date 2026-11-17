import { Button } from '@base-ui/react/button';
import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import '../../../../radix-storybook/.storybook/tailwind.css';
import { config, installProbe, classes as s, type ButtonType } from './contract';
import { ReactInteraction } from './interaction.react';

const settings = config();
const trace = installProbe('react', settings);
function ReactButton() {
    const [disabled, setDisabled] = useState(settings.disabled ?? false);
    const [focusable, setFocusable] = useState(settings.focusableWhenDisabled ?? false);
    const [type, setType] = useState<ButtonType>(settings.type ?? 'button');
    useEffect(() => {
        const listener = (event: KeyboardEvent) => {
            if (event.key === 'F6') {
                event.preventDefault();
                setDisabled((value) => !value);
            }
            if (event.key === 'F7') {
                event.preventDefault();
                setFocusable((value) => !value);
            }
            if (event.key === 'F8') {
                event.preventDefault();
                setType('submit');
            }
        };
        document.addEventListener('keydown', listener);
        return () => document.removeEventListener('keydown', listener);
    }, []);
    const host =
        settings.host === 'button' ? (
            <button />
        ) : settings.host === 'span' ? (
            <span />
        ) : settings.host === 'div' ? (
            <div />
        ) : settings.host === 'link' ? (
            <a href="#activated" />
        ) : (
            <a />
        );
    return (
        <>
            <button type="button" tabIndex={0} data-testid="before">
                Before
            </button>
            <form
                className={s.form}
                onSubmit={(event) => trace.submit(event.nativeEvent)}
                onReset={() => trace.reset()}
            >
                <input data-testid="field" name="field" defaultValue="initial" aria-label="Form field" />
                <Button
                    render={host}
                    nativeButton={settings.host === 'button'}
                    disabled={disabled}
                    focusableWhenDisabled={focusable}
                    {...(settings.host === 'button' ? { type } : {})}
                    onClick={(event) => trace.click(event.nativeEvent)}
                    className={s.button}
                    data-testid="subject"
                >
                    Action
                    {settings.action === 'descendant' && (
                        <span tabIndex={0} data-testid="child">
                            Child
                        </span>
                    )}
                </Button>
            </form>
            <button type="button" tabIndex={0} data-testid="after">
                After
            </button>
            <div className="h-[2400px]" />
        </>
    );
}
createRoot(document.getElementById('root')!).render(
    settings.interaction ? <ReactInteraction settings={settings} trace={trace} /> : <ReactButton />
);
