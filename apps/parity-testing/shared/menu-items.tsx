import { Menu } from '@base-ui/react/menu';
import type { ReactNode } from 'react';
import { menuClasses as s } from './menu-fixture';

export function MenuItems({
    menu,
    select,
    children
}: {
    menu: string;
    select: (id: string) => void;
    children?: ReactNode;
}) {
    return (
        <>
            <Menu.Item
                render={<button />}
                nativeButton
                className={s.item}
                data-testid={`${menu}-alpha`}
                onClick={() => select(`${menu}-alpha`)}
            >
                Alpha
            </Menu.Item>
            <Menu.Item
                render={<button />}
                nativeButton
                disabled
                className={s.item}
                data-testid={`${menu}-blocked`}
                onClick={() => select(`${menu}-blocked`)}
            >
                Blocked
            </Menu.Item>
            <Menu.Item
                render={<button />}
                nativeButton
                className={s.item}
                data-testid={`${menu}-bravo`}
                onClick={() => select(`${menu}-bravo`)}
            >
                Bravo
            </Menu.Item>
            {children}
        </>
    );
}
