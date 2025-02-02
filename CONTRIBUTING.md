# Contributing

Thanks for your interest in contributing to Radix Angular. We're happy to have you here.
Please take a moment to review this document before submitting your first pull request. We also strongly recommend that you check for open issues and pull requests to see if someone else is working on something similar.

If you need any help, feel free to reach out to [Telegram](https://t.me/radixng).

## Development

### Fork this repo

You can fork this repo by clicking the fork button in the top right corner of this page.

### Clone on your local machine

```bash
git clone https://github.com/your-username/primitives.git
```

### Navigate to project directory

```bash
cd primitives
```

### Create a new Branch

```bash
git checkout -b my-new-branch
```

### Install dependencies

```bash
pnpm install
```

## Commit Convention

Before you create a Pull Request, please check whether your commits comply with
the commit conventions used in this repository.

When you create a commit we kindly ask you to follow the convention
`category(scope or module): message` in your commit message while using one of
the following categories:

- `feat / feature`: all changes that introduce completely new code or new
  features
- `fix`: changes that fix a bug (ideally you will additionally reference an
  issue if present)
- `refactor`: any code related change that is not a fix nor a feature
- `docs`: changing existing or creating new documentation (i.e. README, docs for
  usage of a lib or cli usage)
- `build`: all changes regarding the build of the software, changes to
  dependencies or the addition of new dependencies
- `test`: all changes regarding tests (adding new tests or changing existing
  ones)
- `ci`: all changes regarding the configuration of continuous integration (i.e.
  github actions, ci system)
- `chore`: all changes to the repository that do not fit into any of the above
  categories

  e.g. `feat(components): add new prop to the avatar component`

If you are interested in the detailed specification you can visit
https://www.conventionalcommits.org/ or check out the
[Angular Commit Message Guidelines](https://github.com/angular/angular/blob/22b96b9/CONTRIBUTING.md#-commit-message-guidelines).

## Requests for new components

If you have a request for a new component, please open a discussion on GitHub. We'll be happy to help you out.

## Naming Convention for Methods Declared in `host`

When declaring methods for event bindings in the host property of an Angular component or directive,
follow these naming conventions to maintain clarity, consistency, and alignment with Angular's style.

### Prefix with `on-`

All methods handling events should be prefixed with on followed by the event name, capitalized in camel case.

```typescript
@Directive({
  selector: 'app-example',
  host: {
    role: 'role',
    '(mouseenter)': 'onMouseEnter()',
    '(mouseleave)': 'onMouseLeave()'
  }
})
export class ExampleDirective {
  role = 'button';

  onMouseEnter(): void {
    console.log('Mouse entered!');
  }

  onMouseLeave(): void {
    console.log('Mouse left!');
  }
}
```

## Components, Directives

- Use `inject` for dependency injection.
- Avoid using native DOM APIs (e.g., `document.`, `window.`).
- Avoid using outdated lifecycle hooks (`ngOnChanges`, `ngAfterViewInit`, `ngAfterContentInit`, etc.).
- Minimize the use of `ngOnInit` and `ngOnDestroy`. Prefer the `constructor`, as it runs within the injection context.

```typescript
export class MyComponent {
  // dependency injection first
  private readonly myService = inject(MyService);

  // inputs
  readonly myInput = input();

  // outputs
  readonly myOutput = output();

  // private members
  private readonly shouldDoStuff = computed(() => {});

  // public members
  readonly ICQ_LINK = ICQ;
  readonly MSN_LINK = MSN;

  readonly computedStuff = computed(() => {});

  form = new FormGroup(...);

  stuff = useMyExternalUtilFunction();

  // constructor
  constructor(){
    effect(() => console.log(this.computedStuff()));

    // ngOnInit
    afterNextRender(() => console.log('init'));

    // ngOnDestroy
    inject(DestroyRef).onDestroy(() => console.log('cleanup'));
  }

  // lifecycle hooks (avoid if possible)

  // public methods
  greet() {
    console.log('hi mom');
  }

  // private methods
  private calculateGreeting() {}
}
```
