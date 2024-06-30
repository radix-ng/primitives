# Radix Angular
<p>
    <a href="https://www.npmjs.com/package/@radix-ng/primitives">
        <img src="https://img.shields.io/npm/dm/@radix-ng/primitives.svg?style=flat-round" alt="npm downloads">
    </a>
</p>

> This version is not yet stable.
> 
> It is very important for me to maintain API compatibility provided by the Radix primitives.
> However, there are some features that I would prefer not to carry over.
> For example, the horizontal arrangement of radio buttons — I have indicated the reason in the code as to why this should be avoided.


> Radix-NG is an unofficial Angular port of [Radix UI](https://www.radix-ui.com/), thus we share the same principal and vision when building primitives.

Radix Primitives is a low-level UI component library with a focus on accessibility, customization and developer experience.
You can use these components either as the base layer of your design system, or adopt them incrementally.


## Documentation

Visit [https://radix-ng.com](https://radix-ng.com) to view documentation.


## Showcase
1. [Taxonomy](https://github.com/shadcn-ui/taxonomy) build with AnalogJS – [https://primitives-taxonomy.vercel.app/](https://primitives-taxonomy.vercel.app/)
2. [Blocks](https://ui.shadcn.com/blocks) based on shadcn - [https://blocks-showcase.vercel.app/](https://blocks-showcase.vercel.app/)

## Components
1. [shadcn/ui](https://ui.shadcn.com/) Angular version – [https://shadcn.radix-ng.com](https://shadcn.radix-ng.com/)
2. Radix Components ...'soon'

## Project structure

```angular2html
.
├── apps
│   ├── docs               (//TODO: landing and docs)
│   └── showcase-taxonomy  (AnalogJS showcase Taxonomy app)
└── packages
    ├── components         (components based on primitives with custom styling)
    └── primitives         (headless primitives UI without any styling)
```

## Primitives Roadmap
- [ ] Accordion        (In progess) (will be based on angular/cdk)
- [x] Alert Dialog
- [x] Avatar
- [x] Checkbox         (need it more adaptation for FormGroup)
- [x] Collapsible
- [ ] Context Menu
- [ ] Dialog           (will be based on angular/cdk)
- [ ] Dropdown
- [ ] Hover Card
- [x] Label
- [ ] Menubar          (In progess)
- [ ] Navigation Menu
- [ ] Popover
- [x] Progress
- [x] Radio
- [ ] Select           (In progess)
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
