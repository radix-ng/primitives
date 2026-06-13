---
name: project-knowledge
description: |
  Use when you need information about this project's architecture, tech stack,
  coding patterns, data model, deployment setup, git workflow, or UX guidelines.
  Contains comprehensive project documentation including design decisions,
  technical specifications, and development standards.
---

# Project Knowledge

This skill provides access to project documentation that defines how this project works, how code should be written, and how features should be developed.

## When to use

Activate this skill when you need to:

- Understand project architecture, tech stack, and data model
- Learn coding patterns, git workflow, and testing approach
- Check deployment setup, monitoring, and operational procedures
- Apply UX guidelines and design system
- Make technical decisions aligned with project standards

## Core references

All documentation is in the `references/` folder:

- **[project.md](references/project.md)** - Project overview, purpose, target audience, core features, scope boundaries
- **[architecture.md](references/architecture.md)** - Tech stack, project structure, dependencies, external integrations, data flow, data model (schema, migrations, sensitive data)
- **[patterns.md](references/patterns.md)** - Project-specific coding conventions, git workflow (branching, testing, security gates), testing & verification methods, business rules
- **[deployment.md](references/deployment.md)** - Deployment platform, environment variables, CI/CD triggers, rollback, monitoring & observability (logging, error tracking, health checks)

## Optional references

- **[ux-guidelines.md](references/ux-guidelines.md)** - Demo styling system, semantic tokens, animation patterns, accessibility conventions for Storybook stories
- **[signal-forms-readiness.md](references/signal-forms-readiness.md)** - Angular Signal Forms conformance matrix per form control, collisions, and Angular-21 prep backlog

## How to use

Read specific guides as needed for your task:

- Starting feature development - read [project.md](references/project.md), [architecture.md](references/architecture.md), [patterns.md](references/patterns.md)
- Implementing database changes - read [architecture.md](references/architecture.md) (Data Model section)
- Working on UI/UX - read [ux-guidelines.md](references/ux-guidelines.md)
- Setting up deployment - read [deployment.md](references/deployment.md)
- Creating branches or PRs - read [patterns.md](references/patterns.md) (Git Workflow section)
- Investigating logs or errors - read [deployment.md](references/deployment.md) (Monitoring section)
- Working with domain logic - read [patterns.md](references/patterns.md) (Business Rules section)
- Reporting a misuse / adding a dev-mode warning, error, or host-element check to a primitive - read [patterns.md](references/patterns.md) (Dev-mode diagnostics section). Always go through `core/src/dev/diagnostics.ts` (`rdxDevWarning` / `rdxDevError` / `rdxCheckTriggerElement` / `rdxCheckLabelElement`) with a stable `[rdx:<primitive>/<slug>]` code — never a fresh ad-hoc `console.warn` / `throw`
- Adopting Angular Signal Forms or touching form controls - read [signal-forms-readiness.md](references/signal-forms-readiness.md)

All guides are maintained as single source of truth for project knowledge.
