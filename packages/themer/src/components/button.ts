import { tv } from 'tailwind-variants';

const baseButton = tv({
    base: 'group flex justify-center gap-1.5 items-center rounded-[--btn-radius] outline-2 outline-offset-2 focus-visible:outline outline-primary-600 disabled:bg-gray-200 disabled:text-gray-400 disabled:shadow-none disabled:hover:brightness-100 dark:disabled:bg-gray-500/10 dark:disabled:[background-image:none] dark:disabled:text-gray-700 dark:disabled:shadow-none dark:disabled:border-none',
    variants: {
        size: {
            xs: 'text-sm h-7 px-3',
            sm: 'text-sm h-8 px-3.5',
            md: 'text-base h-9 px-4',
            lg: 'text-base h-10 px-5',
            xl: 'text-lg h-12 px-6'
        },
        iconOnlyButtonSize: {
            xs: 'size-7',
            sm: 'size-8',
            md: 'size-9',
            lg: 'size-10',
            xl: 'size-12'
        },
        defaultVariants: {
            intent: 'primary',
            size: 'md'
        }
    }
});

const solid = tv({
    extend: baseButton,
    variants: {
        intent: {
            primary:
                'text-primary-700 bg-primary-100 hover:bg-primary-200/75 active:bg-primary-100 dark:text-primary-300 dark:bg-primary-500/10 dark:hover:bg-primary-500/15 dark:active:bg-primary-500/10',
            secondary:
                'text-secondary-700 bg-secondary-100 hover:bg-secondary-200/75 active:bg-secondary-100 dark:text-secondary-300 dark:bg-secondary-500/10 dark:hover:bg-secondary-500/15 dark:active:bg-secondary-500/10',
            accent: 'text-accent-700 bg-accent-100 hover:bg-accent-200/75 active:bg-accent-100 dark:text-accent-300 dark:bg-accent-500/10 dark:hover:bg-accent-500/15 dark:active:bg-accent-500/10',
            danger: 'text-danger-700 bg-danger-100 hover:bg-danger-200/75 active:bg-danger-100 dark:text-danger-300 dark:bg-danger-500/10 dark:hover:bg-danger-500/15 dark:active:bg-danger-500/10',
            info: 'text-info-700 bg-info-100 hover:bg-info-200/75 active:bg-info-100 dark:text-info-300 dark:bg-info-500/10 dark:hover:bg-info-500/15 dark:active:bg-info-500/10',
            success:
                'text-success-700 bg-success-100 hover:bg-success-200/75 active:bg-success-100 dark:text-success-300 dark:bg-success-500/10 dark:hover:bg-success-500/15 dark:active:bg-success-500/10',
            warning:
                'text-warning-700 bg-warning-100 hover:bg-warning-200/75 active:bg-warning-100 dark:text-warning-300 dark:bg-warning-500/10 dark:hover:bg-warning-500/15 dark:active:bg-warning-500/10',
            gray: 'text-gray-800 bg-gray-100 hover:bg-gray-200/75 active:bg-gray-100 dark:text-gray-300 dark:bg-gray-500/10 dark:hover:bg-gray-500/15 dark:active:bg-gray-500/10',
            neutral:
                'text-gray-950 bg-gray-100 hover:bg-gray-950 hover:text-white active:text-white active:bg-gray-900 dark:text-gray-300 dark:bg-gray-500/10 dark:hover:bg-white dark:hover:text-gray-950 dark:active:bg-gray-200 dark:active:text-gray-950'
        }
    }
});

const ghost = tv({
    extend: baseButton,
    variants: {
        intent: {
            primary:
                'text-primary-600 hover:bg-primary-100 active:bg-primary-200/75 dark:text-primary-400 dark:hover:bg-primary-500/10 dark:active:bg-primary-500/15',
            secondary:
                'text-secondary-600 hover:bg-secondary-100 active:bg-secondary-200/75 dark:text-secondary-400 dark:hover:bg-secondary-500/10 dark:active:bg-secondary-500/15',
            accent: 'text-accent-600 hover:bg-accent-100 active:bg-accent-200/75 dark:text-accent-400 dark:hover:bg-accent-500/10 dark:active:bg-accent-500/15',
            danger: 'text-danger-600 hover:bg-danger-100 active:bg-danger-200/75 dark:text-danger-400 dark:hover:bg-danger-500/10 dark:active:bg-danger-500/15',
            info: 'text-info-600 hover:bg-info-100 active:bg-info-200/75 dark:text-info-400 dark:hover:bg-info-500/10 dark:active:bg-info-500/15',
            success:
                'text-success-600 hover:bg-success-100 active:bg-success-200/75 dark:text-success-400 dark:hover:bg-success-500/10 dark:active:bg-success-500/15',
            warning:
                'text-warning-600 hover:bg-warning-100 active:bg-warning-200/75 dark:text-warning-400 dark:hover:bg-warning-500/10 dark:active:bg-warning-500/15',
            gray: 'text-gray-800 hover:bg-gray-100 active:bg-gray-200/75 dark:text-gray-300 dark:hover:bg-gray-500/10 dark:active:bg-gray-500/15',
            neutral:
                'text-gray-950 hover:bg-gray-950 hover:text-white active:text-white active:bg-gray-900 dark:text-white dark:hover:bg-white dark:hover:text-gray-950 dark:active:bg-gray-200 dark:active:text-gray-950'
        }
    }
});

export const icon = tv({
    variants: {
        type: {
            leading: '-ml-1',
            trailing: '-mr-1',
            only: 'm-auto'
        },
        size: {
            xs: 'size-3.5',
            sm: 'size-4',
            md: 'size-[1.125rem]',
            lg: 'size-5',
            xl: 'size-6'
        }
    }
});

export const button = {
    solid,
    ghost
};

export type ButtonProps = {
    variant?: keyof typeof button | undefined;
    intent?: keyof typeof solid.variants.intent;
    size?: keyof typeof baseButton.variants.size;
};

export type ButtonIconProps = {
    type?: keyof typeof icon.variants.type;
    size?: keyof typeof icon.variants.size;
};
