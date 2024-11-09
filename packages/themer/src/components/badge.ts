import { tv } from 'tailwind-variants';

const baseBadge = tv({
    base: 'rounded-[--badge-radius] font-medium block w-fit',
    variants: {
        size: {
            xs: 'px-1.5 py-0.5 text-xs',
            sm: 'px-2 py-0.5 text-sm',
            md: 'px-2.5 py-1 text-sm',
            lg: 'px-3 py-1 text-base'
        }
    }
});

const solid = tv({
    extend: baseBadge,
    base: 'text-white',
    variants: {
        intent: {
            primary: 'bg-primary-600 dark:bg-primary-400 dark:text-primary-950',
            secondary: 'bg-secondary-600 dark:bg-secondary-400 dark:text-secondary-950',
            accent: 'bg-accent-600 dark:bg-accent-400 dark:text-accent-950',
            success: 'bg-success-600 dark:bg-success-400 dark:text-success-950',
            danger: 'bg-danger-600 dark:bg-danger-400 dark:text-danger-950',
            warning: 'bg-warning-400 text-warning-950 dark:text-warning-950',
            info: 'bg-info-600 dark:bg-primary-400 dark:text-info-950',
            gray: 'bg-gray-600 dark:bg-gray-400 dark:text-gray-950'
        }
    }
});

const outlined = tv({
    extend: baseBadge,
    base: 'border',
    variants: {
        intent: {
            primary: 'border-primary-200 text-primary-800 dark:border-primary-300/15 dark:text-primary-300',
            secondary: 'border-secondary-200 text-secondary-800 dark:border-secondary-300/15 dark:text-secondary-300',
            accent: 'border-accent-200 text-accent-800 dark:border-accent-300/15 dark:text-accent-300',
            info: 'border-info-200 text-info-800 dark:border-info-300/15 dark:text-info-300',
            success: 'border-success-200 text-success-800 dark:border-success-300/15 dark:text-success-300',
            danger: 'border-danger-200 text-danger-800 dark:border-danger-300/15 dark:text-danger-300',
            warning: 'border-warning-300 text-warning-800 dark:border-warning-300/15 dark:text-warning-300',
            gray: 'border-gray-200 text-gray-800 dark:border-gray-300/15 dark:text-gray-300'
        }
    }
});

const soft = tv({
    extend: baseBadge,
    variants: {
        intent: {
            primary: 'bg-primary-200 text-primary-800 dark:bg-primary-500/15 dark:text-primary-300',
            secondary: 'bg-secondary-200 text-secondary-800 dark:bg-secondary-500/15 dark:text-secondary-300',
            accent: 'bg-accent-200 text-accent-800 dark:bg-accent-500/15 dark:text-accent-300',
            info: 'bg-info-200 text-info-800 dark:bg-info-500/15 dark:text-info-300',
            success: 'bg-success-200 text-success-800 dark:bg-success-500/15 dark:text-success-300',
            danger: 'bg-danger-200 text-danger-800 dark:bg-danger-500/15 dark:text-danger-300',
            warning: 'bg-warning-200 text-warning-900 dark:bg-warning-500/15 dark:text-warning-300',
            gray: 'bg-gray-200 text-gray-800 dark:bg-gray-500/15 dark:text-gray-300'
        }
    }
});

export const badge = {
    solid,
    outlined,
    soft
};

export type BadgeProps = {
    variant?: keyof typeof badge;
    size?: keyof typeof baseBadge.variants.size;
    intent?: keyof typeof solid.variants.intent;
};
