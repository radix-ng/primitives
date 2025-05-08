# Radix Angular

[![downloads](https://img.shields.io/npm/dm/@radix-ng/primitives.svg?style=flat-round)](https://www.npmjs.com/package/@radix-ng/primitives)
[![Discord Chat](https://img.shields.io/discord/1231525968586346567.svg?color=5865F2&logo=discord&logoColor=FFFFFF)](https://discord.gg/NaJb2XRWX9)

> This version is not yet stable.
>
> It is very important for me to maintain API compatibility provided by the Radix primitives.

> Radix-NG is an unofficial Angular port of [Radix UI](https://www.radix-ui.com/), thus we share the same principal and vision when building primitives.

Radix Primitives is a low-level UI component library with a focus on accessibility, customization and developer experience.
You can use these components either as the base layer of your design system, or adopt them incrementally.

Some primitives are based on [@angular/cdk](https://material.angular.io/cdk/categories).

---

## Documentation

- [radix-ng.com](https://radix-ng.com)

- [sb-primitives.radix-ng.com](https://sb-primitives.radix-ng.com/) – Storybook

## OriginUI

- [OriginUI](https://originui-ng.com/)

## shadcn/ui

- shadcn/ui – [ui.adrianub.dev](https://ui.adrianub.dev/)

## Project structure

```angular2html
.
├── apps
│   ├── radix-docs         (documentation based on Astro)
│   ├── radix-ssr-testing  (SSR test for unstyle primitives)
│   └── radix-storybook
│
└── packages
    ├── components         (components based on primitives with custom styling)
    └── primitives         (headless primitives UI without any styling)
```

## Roadmap

### RadixUI Primitives

| Primitive       | Description | Status | A11y |
| --------------- | ----------- | ------ | ---- |
| Accordion       |             | ✅     |      |
| Alert Dialog    |             | beta   |      |
| Avatar          |             | ✅     |      |
| Aspect Ratio    |             | ✅     |      |
| Checkbox        |             | ✅     |      |
| Collapsible     |             | ✅     |      |
| Context Menu    |             | ✅     |      |
| Dialog          |             | ✅     |      |
| DropdownMenu    |             | ✅     |      |
| Form            |             |        |      |
| Hover Card      |             | ✅     |      |
| Label           |             | ✅     |      |
| Menubar         |             | ✅     |      |
| Navigation Menu |             | ✅     |      |
| Popover         |             | ✅     |      |
| Progress        |             | ✅     |      |
| Radio           |             | ✅     |      |
| Select          |             | beta   |      |
| Separator       |             | ✅     |      |
| Slider          |             | ✅     |      |
| Switch          |             | ✅     |      |
| Tabs            |             | ✅     |      |
| Toast           |             |        |      |
| Toggle          |             | ✅     |      |
| Toggle Group    |             | ✅     |      |
| Toolbar         |             | ✅     |      |
| Tooltip         |             | ✅     |      |

### Other Primitives

| Primitive    | Description | Status |
| ------------ | ----------- | ------ |
| Calendar     |             | ✅     |
| Date Field   |             | ✅     |
| Number Field |             | ✅     |
| Pagination   |             | ✅     |
| Stepper      |             | ✅     |

**Status Legend**
✅ Completed
🚀 In Progress
🛠 In Review

### Forms

- [ ] use validations framework – [https://vestjs.dev/](https://vestjs.dev/), [Angular example](https://github.com/simplifiedcourses/ngx-vest-forms)

### DataGrid

- [ ] (In progress) with [Tanstack Table](https://tanstack.com/table/latest), [https://shadcn-datagrid.vercel.app/](https://shadcn-datagrid.vercel.app/)

## Community

We're excited to see the community adopt, raise issues, and provide feedback.
Whether it's a feature request, bug report, or a project to showcase, please get involved!

- [Join our Discord](https://discord.gg/NaJb2XRWX9)
- [Join our Telegram](https://t.me/radixng)
- [GitHub Discussions](https://github.com/radix-ng/primitives/discussions)

## Contributor analytics

![Alt](https://repobeats.axiom.co/api/embed/7c1e0b2754a8973c9cfd458060d168e9dd7b5b8e.svg 'Repobeats analytics image')

## License

This project is licensed under the terms of the [MIT license](/LICENSE).
