# Installation
How to install dependencies and structure your app.

> **Warning**
> This library works only with Angular 18+.

```bash
npm install @radix-ng/shadcn tailwind-merge class-variance-authority clsx
```

### Add Tailwind to project

https://tailwindcss.com/docs/guides/angular

```bash
npm install -D tailwindcss postcss autoprefixer
```

### Configure tailwind.config.js

```js
/** @type {import('tailwindcss').Config} */

// https://ui.shadcn.com/docs/installation/manual#configure-tailwindconfigjs
const { shadcnUIPlugin } = require('@radix-ng/shadcn/theme');

module.exports = {
    content: [
        // yours config paths ...
        // Added all components
        './node_modules/@radix-ng/shadcn/**/*.{mjs,js}',
        // OR
        // to optimize the bundle size, add the components that you use
        './node_modules/@radix-ng/shadcn/**/(button|label|checkbox)/*.{mjs,js}',
    ],
    theme: {
        extend: {}
    },
    plugins: [shadcnUIPlugin()]
};
```

### Configure styles
Add the following to your **global styles** `src/styles.css` file

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

```
