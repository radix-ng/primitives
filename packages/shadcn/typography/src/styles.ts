import { cva } from 'class-variance-authority';

export const h1Variants = cva('scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl');

export const h2Variants = cva(
    'scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0'
);

export const ulVariants = cva('my-6 ml-6 list-disc [&>li]:mt-2');
