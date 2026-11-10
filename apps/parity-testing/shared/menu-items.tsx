import { Menu } from '@base-ui/react/menu';
import { menuClasses as s } from './menu-fixture';

export function MenuItems({ menu, select }: { menu: string; select: (id: string) => void }) {
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
        </>
    );
}
