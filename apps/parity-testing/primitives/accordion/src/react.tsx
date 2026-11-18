import { Accordion } from '@base-ui/react/accordion';
import { createRoot } from 'react-dom/client';
import '../../../../radix-storybook/.storybook/tailwind.css';
import { installProbe, settings } from './contract';
import { ReactIdentityAccordion } from './identity.react';
import { ReactLifecycleAccordion } from './lifecycle.react';
import { ReactMotionAccordion } from './motion.react';
import { ReactSearchAccordion } from './search.react';

const s = settings();
const probe = installProbe(s);
createRoot(document.getElementById('root')!).render(
    s.identity ? (
        <ReactIdentityAccordion s={s} probe={probe} />
    ) : s.search ? (
        <ReactSearchAccordion s={s} probe={probe} />
    ) : s.motion ? (
        <ReactMotionAccordion s={s} probe={probe} />
    ) : s.lifetime ? (
        <ReactLifecycleAccordion s={s} probe={probe} />
    ) : (
        <>
            <button data-testid="before" type="button" tabIndex={0}>
                Before
            </button>
            <form onSubmit={(event) => probe.submit(event.nativeEvent)}>
                <Accordion.Root
                    value={s.controlled ? (s.initial ?? []) : undefined}
                    defaultValue={s.defaults}
                    multiple={s.multiple}
                    disabled={s.disabled === 'root'}
                    keepMounted
                    hiddenUntilFound={s.reveal}
                    onValueChange={(value, details) => probe.request('root', value, details)}
                >
                    {['a', 'b'].map((id) => (
                        <Accordion.Item
                            key={id}
                            value={id}
                            disabled={s.disabled === 'item'}
                            data-testid={`${id}-item`}
                            onOpenChange={(open, details) => probe.request(id, open, details)}
                        >
                            <Accordion.Header data-testid={`${id}-header`}>
                                <Accordion.Trigger
                                    render={s.span ? <span /> : <button />}
                                    nativeButton={!s.span}
                                    onClick={(event) => probe.click(event.nativeEvent)}
                                    disabled={s.disabled === 'trigger'}
                                    data-testid={`${id}-trigger`}
                                    id={s.authored ? `${id}-authored-trigger` : undefined}
                                    {...(!s.span ? { type: s.submit ? ('submit' as const) : ('button' as const) } : {})}
                                >
                                    {id}
                                </Accordion.Trigger>
                            </Accordion.Header>
                            <Accordion.Panel
                                data-testid={`${id}-panel`}
                                id={s.authored ? `${id}-authored-panel` : undefined}
                            >
                                Content {id}
                            </Accordion.Panel>
                        </Accordion.Item>
                    ))}
                </Accordion.Root>
            </form>
            <button data-testid="after" type="button" tabIndex={0}>
                After
            </button>
        </>
    )
);
