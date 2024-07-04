# Radix Angular
[![downloads](https://img.shields.io/npm/dm/@radix-ng/primitives.svg?style=flat-round)](https://www.npmjs.com/package/@radix-ng/primitives)
[![downloads](https://img.shields.io/npm/dm/@radix-ng/shadcn.svg?style=flat-round)](https://www.npmjs.com/package/@radix-ng/shadcn)

> This version is not yet stable.
> 
> It is very important for me to maintain API compatibility provided by the Radix primitives.
> However, there are some features that I would prefer not to carry over.
> For example, the horizontal arrangement of radio buttons — I have indicated the reason in the code as to why this should be avoided.


> Radix-NG is an unofficial Angular port of [Radix UI](https://www.radix-ui.com/), thus we share the same principal and vision when building primitives.

Radix Primitives is a low-level UI component library with a focus on accessibility, customization and developer experience.
You can use these components either as the base layer of your design system, or adopt them incrementally.

Some primitives are based on [@angular/cdk](https://material.angular.io/cdk/categories).

## Documentation

Visit [https://radix-ng.com](https://radix-ng.com) to view documentation.

## Showcase
1. [Taxonomy](https://github.com/shadcn-ui/taxonomy) build with AnalogJS – [https://primitives-taxonomy.vercel.app/](https://primitives-taxonomy.vercel.app/)
2. [shadcn/ui blocks](https://ui.shadcn.com/blocks) - [https://blocks.shadcn-ng.com/](https://blocks.shadcn-ng.com/)

## Components
1. [shadcn/ui](https://ui.shadcn.com/) Angular version – [https://www.shadcn-ng.com/](https://www.shadcn-ng.com/)
2. RadixUI Components ...'soon'

## Project structure

```angular2html
.
├── apps
│   ├── shadcn-docs        (docs for shadcn/ui, based on ng-doc)
│   └── showcase-taxonomy  (AnalogJS showcase Taxonomy app)
└── packages
    ├── components         (components based on primitives with custom styling)
    ├── shadcn             (shadcn/ui port)
    └── primitives         (headless primitives UI without any styling)
```

## Primitives Roadmap
- [ ] Accordion        (In progress) (based on angular/cdk)
- [x] Alert Dialog
- [x] Avatar
- [x] Checkbox                       (adaptation for FormGroup)
- [x] Collapsible
- [ ] Context Menu     (next)        (based on angular/cdk)
- [ ] Dialog                         (based on angular/cdk)
- [ ] Dropdown         (In progress) (based on angular/cdk)
- [ ] Hover Card
- [x] Label
- [ ] Menubar          (In progress) (based on angular/cdk)
- [ ] Navigation Menu
- [ ] Popover
- [x] Progress
- [x] Radio                          (adaptation for FormGroup)
- [ ] Select           (In progress)
- [x] Separator
- [x] Switch
- [x] Tabs
- [ ] Toast
- [x] Toggle
- [x] Toggle Group
- [ ] Toolbar
- [ ] Tooltip


## Community

We're excited to see the community adopt, raise issues, and provide feedback.
Whether it's a feature request, bug report, or a project to showcase, please get involved!

- [Join our Discord](https://discord.gg/NaJb2XRWX9)
- [Join our Telegram](https://t.me/radixng)
- [GitHub Discussions](https://github.com/radix-ng/primitives/discussions)

## License

[MIT](https://choosealicense.com/licenses/mit/)
