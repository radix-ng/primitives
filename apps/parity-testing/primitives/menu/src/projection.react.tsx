import { DirectionProvider } from '@base-ui/react/direction-provider';
import { Menu } from '@base-ui/react/menu';
import { createContext, useContext, useEffect, useRef, useState, type ReactNode, type RefObject } from 'react';
import { config, installProbe, classes as s, type Layer } from './contract';
import { projectionEntries } from './projection';

const settings = config();
const p = settings.projection!;
const Trace = createContext<ReturnType<typeof installProbe> | undefined>(undefined);

function ProjectionPopup({
    layer = 'main',
    children,
    finalTarget
}: {
    layer?: Layer;
    children: ReactNode;
    finalTarget?: RefObject<HTMLInputElement | null>;
}) {
    return (
        <Menu.Portal keepMounted={p.retained}>
            <Menu.Positioner
                className="z-50"
                side={layer === 'main' ? 'bottom' : settings.dir === 'rtl' ? 'left' : 'right'}
                align="start"
                sideOffset={4}
                data-testid={layer === 'main' ? 'positioner' : 'sub-positioner'}
            >
                <Menu.Popup
                    className={s.popup}
                    finalFocus={finalTarget}
                    data-testid={layer === 'main' ? 'popup' : 'sub-popup'}
                >
                    {p.mixed && layer === 'main' && <ProjectionItem id="inner">Internal</ProjectionItem>}
                    {children}
                </Menu.Popup>
            </Menu.Positioner>
        </Menu.Portal>
    );
}
function ProjectionItem({
    id,
    children,
    disabled = false,
    label
}: {
    id: string;
    children: ReactNode;
    disabled?: boolean;
    label?: string;
}) {
    const trace = useContext(Trace)!;
    return (
        <Menu.Item
            render={<button />}
            nativeButton
            className={s.item}
            data-testid={id}
            disabled={disabled}
            label={label}
            onClick={() => trace.select(id)}
        >
            {children}
        </Menu.Item>
    );
}
function ProjectionRoot({ layer = 'main', children }: { layer?: Layer; children: ReactNode }) {
    const trace = useContext(Trace)!;
    const props = {
        onOpenChange(open: boolean, e: Menu.Root.ChangeEventDetails) {
            if (p.cancelFocus && !open && e.reason === 'focus-out') e.cancel();
            trace.change(layer, open, e.reason, e.isCanceled, e.event, e.trigger);
        },
        onOpenChangeComplete: (open: boolean) => trace.complete(layer, open)
    };
    return layer === 'sub' ? (
        <Menu.SubmenuRoot {...props}>{children}</Menu.SubmenuRoot>
    ) : (
        <Menu.Root modal={!p.cancelFocus} {...props}>
            {children}
        </Menu.Root>
    );
}

export function ReactProjection() {
    const [trace] = useState(() => installProbe('react'));
    const [items, setItems] = useState(p.late ? [] : projectionEntries);
    const target = useRef<HTMLInputElement>(null);
    useEffect(() => {
        const command = (event: KeyboardEvent) => {
            if (event.key !== 'F3') return;
            event.preventDefault();
            setItems(p.late ? projectionEntries : [...projectionEntries].reverse());
        };
        document.addEventListener('keydown', command);
        return () => document.removeEventListener('keydown', command);
    }, []);
    return (
        <Trace.Provider value={trace}>
            <DirectionProvider direction={settings.dir}>
                <div className={s.layout}>
                    <input ref={target} data-testid="root-final" aria-label="Return target" />
                    <input data-testid="before" aria-label="Before menu" />
                    <ProjectionRoot>
                        <Menu.Trigger className={s.trigger} data-testid="primary">
                            Actions
                        </Menu.Trigger>
                        <ProjectionPopup finalTarget={p.finalTarget ? target : undefined}>
                            {items.map((item) => (
                                <ProjectionItem
                                    key={item.id}
                                    id={item.id}
                                    disabled={item.disabled}
                                    label={
                                        settings.name === 'projection-typeahead' && item.id === 'alpha'
                                            ? 'Zebra'
                                            : undefined
                                    }
                                >
                                    {item.label}
                                </ProjectionItem>
                            ))}
                            {p.link && (
                                <Menu.LinkItem
                                    closeOnClick
                                    className={s.item}
                                    href="#projection-target"
                                    data-testid="link"
                                    onClick={() => trace.select('link')}
                                >
                                    Visit target
                                </Menu.LinkItem>
                            )}
                            {p.nested && (
                                <ProjectionRoot layer="sub">
                                    <Menu.SubmenuTrigger
                                        render={<button />}
                                        nativeButton
                                        className={s.item}
                                        data-testid="more"
                                    >
                                        More
                                    </Menu.SubmenuTrigger>
                                    <ProjectionPopup layer="sub">
                                        <ProjectionItem id="sub-alpha">Child action</ProjectionItem>
                                    </ProjectionPopup>
                                </ProjectionRoot>
                            )}
                            {p.values && (
                                <>
                                    <Menu.CheckboxItem
                                        render={<button />}
                                        nativeButton
                                        className={s.item}
                                        data-testid="check"
                                        onCheckedChange={(value, e) => trace.value(value, e.reason, e.isCanceled)}
                                    >
                                        Notifications
                                    </Menu.CheckboxItem>
                                    <Menu.RadioGroup
                                        defaultValue="one"
                                        onValueChange={(value, e) => trace.value(value, e.reason, e.isCanceled)}
                                    >
                                        <Menu.RadioItem
                                            render={<button />}
                                            nativeButton
                                            className={s.item}
                                            value="one"
                                            data-testid="radio-one"
                                        >
                                            Small
                                        </Menu.RadioItem>
                                        <Menu.RadioItem
                                            render={<button />}
                                            nativeButton
                                            className={s.item}
                                            value="two"
                                            data-testid="radio-two"
                                        >
                                            Large
                                        </Menu.RadioItem>
                                    </Menu.RadioGroup>
                                </>
                            )}
                            <ProjectionItem id="omega">Omega</ProjectionItem>
                        </ProjectionPopup>
                    </ProjectionRoot>
                    <input data-testid="after" aria-label="After menu" />
                </div>
            </DirectionProvider>
        </Trace.Provider>
    );
}
