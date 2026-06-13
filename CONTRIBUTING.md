# Contributing

Thanks for your interest in contributing to Radix NG. We're happy to have you here.
Please take a moment to review this document before submitting your first pull request. We also strongly recommend that you check for open issues and pull requests to see if someone else is working on something similar.

If you need any help, feel free to reach out on [Discord](https://discord.gg/NaJb2XRWX9). Follow
[Telegram](https://t.me/headless_angular) for development news and releases.

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

The repository is an Nx monorepo managed with [pnpm](https://pnpm.io) (see `packageManager` in
`package.json`; with corepack enabled the right version is picked up automatically):

```bash
pnpm install
```

## Development workflow

```bash
pnpm storybook:primitives         # Storybook dev server (http://localhost:4400)
pnpm primitives:test              # run the Vitest suite
pnpm primitives:build             # build the library
pnpm eslint:fix                   # lint + autofix
pnpm prettier:fix                 # format
nx run primitives:test --testFile packages/primitives/<name>/__tests__/<file>.spec.ts   # single spec
```

CI requires **zero lint warnings** (`--max-warnings=0`), clean Prettier formatting, green tests,
and successful builds. Husky hooks run `lint-staged` on commit and `commitlint` on the commit
message, so most issues surface before push.

Note on tests: the suite runs **zoneless** — `fakeAsync` / `tick` / `waitForAsync` are unavailable.
Use `vi.useFakeTimers()`, `await fixture.whenStable()`, or a macrotask to drain async work.

### Generated files (`skills/`)

The LLM-facing docs bundle under `skills/` is **generated** from the Storybook docs and the
compodoc metadata. If your change touches any `stories/*.docs.mdx` **or a primitive's public API**
(inputs, outputs, selectors), regenerate and commit the result:

```bash
pnpm skills:build
```

CI verifies the bundle is up to date and fails the PR otherwise.

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

  The scope is the primitive (package) name, e.g. `feat(avatar): add new prop`,
  `fix(select): keep highlight in view on arrow navigation`. Commit messages are checked by
  commitlint on commit.

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
- Avoid using native DOM APIs (e.g., `document.`, `window.`) directly — guard with
  `isPlatformBrowser` where unavoidable (the primitives must be SSR-safe).
- **Avoid lifecycle hooks** in primitive source (`packages/primitives/*/src/**`) — an ESLint rule
  warns on `ngOnInit` / `ngOnChanges` / `ngOnDestroy` there. Pick the replacement by what the code
  needs:
  - DI and host-element work → the **`constructor`** (the host element exists there; `input()`
    values do **not** yet);
  - logic that depends on `input()` values → **`effect()` / `computed()` / `linkedSignal()`**;
  - rendered DOM / measurements → **`afterNextRender()` / `afterRenderEffect()`**, signal
    `viewChild()` / `contentChild()`;
  - cleanup → **`inject(DestroyRef).onDestroy(() => …)`**.

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
