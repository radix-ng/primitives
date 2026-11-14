# Skills

#### Help a coding agent build your own Angular UI on headless primitives.

`radix-ng` and `radix-ng-examples` give an agent documentation, API contracts and example source.
Use them to ask for components such as your own `AppSelect`, integrated with your application's
tokens, styles and forms while preserving the primitives' behavior. Your application owns the
appearance, wrapper API, content and business logic; you can start with one component before
building a design system.

Installing skills supplies context. A UI task should produce component code in your application
and a report of compilation, keyboard, focus and other requested checks. Installation alone does
not create that code or establish its correctness.

Install `radix-ng` and `radix-ng-examples` with:

```bash
npx skills add radix-ng/primitives/skills
```

Continue with [Agents — Getting started](../agents/getting-started.md) for version
checks and a starter prompt, [Build with Radix NG](../agents/build-with-radix-ng.md)
for the AppSelect deliverable, or [Reference](../agents/reference.md) for exports.

Use `radix-ng/references/api-contract/<slug>.json` and
`radix-ng/references/styling-contract/<slug>.json` for the primitive you are building. The installed
package's exports and types take precedence over a bundle from another version. Skills help retrieve
context; compile and test the resulting UI in your own application.

Agent Playground's `snapshot` / `query` / `act` runtime experiment is separate and is not installed
with these consumer skills.
