Use the installed radix-ng and radix-ng-examples consumer skills to implement this task in this application.
Read both .agents/skills/radix-ng/SKILL.md and .agents/skills/radix-ng-examples/SKILL.md, then choose relevant contracts and example shards. Check the installed library and Angular versions; installed exports/types win if bundle versions differ.

Create our own standalone Angular AppSelect inside a Project settings Dialog, using this application's CSS tokens in src/styles.css. There is no finished design system and no visual reference. Use plain CSS and public @radix-ng/primitives imports; do not add Tailwind, Storybook helpers, workspace aliases or NgModules.

AppSelect is a reusable consumer component, exported as AppSelect from src/app/app-select.ts, with selector app-select. Its public API is value (private | public) with valueChange for Angular two-way binding, disabled (boolean), and label (the accessible name). The parent owns the value. Options are Private and Public. Preserve the primitive's state, keyboard and focus behavior instead of replacing it with custom event handling.

Integrate it into the application:

- An Open project settings button opens a modal named Project settings.
- The AppSelect inside has the accessible name Visibility, initially Private.
- A Done button closes the Dialog. Selecting Public updates the parent value, and closing/reopening preserves it.
- Outside the Dialog, show the raw parent value in an output with data-testid="selected-value".
- Outside the Dialog, provide Set Public externally and Set Private externally buttons and a Disable selection checkbox, bound to the component's public API. These are application controls for demonstrating external ownership, not runtime tools.
- Disabled blocks selection/opening through keyboard and pointer interaction. Re-enabling restores operation; externally supplied values must still render correctly.
- Keyboard selection must work. When Select is open, Escape closes Select first and returns focus to its trigger while Dialog stays open. The next Escape closes Dialog and restores focus to Open project settings. Normal selection and Done should also restore the appropriate focus without late overlay interference.
- Use the existing application tokens for control, popup, modal, focus and disabled styles. Ensure visible labels and usable focus indicators. No exact visual design is prescribed.

Run pnpm build with strict Angular template checking. You may add your own focused checks and fix issues yourself within this one session. Report the implementation, checks actually run, results, and anything unverified; do not claim browser checks passed if you did not run them.

Environment note established before generation: the Angular production builder aborts with exit 134 inside this macOS sandbox even for the blank scaffold. The strict compiler command pnpm exec ngc -p tsconfig.app.json --noEmit works here. Use it to check and fix your templates; record the builder limitation. The independent evaluator will build the unchanged generated application and run browser checks outside the coding sandbox afterward.

Only this consumer project, its installed dependencies and its two installed skills are task context. Do not use other repositories, global skills, prepared test fixtures, GitHub source clones, or outside files. No web lookup, installation or network access is available to shell tools; all dependencies are already installed. Keep package.json, pnpm-lock.yaml, Angular/TypeScript build configuration and the installed skills unchanged. Do not commit. Finish with a concise report.
