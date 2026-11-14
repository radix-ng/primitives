# Reference

#### Retrieve one versioned contract or example before loading the full documentation.

## Installed consumer bundle

Paths are relative to the installed skill, not this repository's contributor skills.

| Material                        | Path                                                         |
| ------------------------------- | ------------------------------------------------------------ |
| API for one primitive           | `radix-ng/references/api-contract/<slug>.json`               |
| Styling for one primitive       | `radix-ng/references/styling-contract/<slug>.json`           |
| Component index and anatomy     | `radix-ng-examples/references/components/<slug>.md`          |
| One example's source            | `radix-ng-examples/references/examples/<slug>--<example>.md` |
| Agents guides                   | `radix-ng-examples/references/agents/*.md`                   |
| Discovery index                 | `radix-ng-examples/references/llms.txt`                      |
| Complete rendered documentation | `radix-ng-examples/references/llms-full.txt`                 |

The whole-library `api-contract.json` and `styling-contract.json` files are deprecated compatibility
exports. Prefer individual primitive files to keep retrieval focused.

## Public contracts

These exports are generated from the same sources as the local bundle. Read their `version` field;
the installed package's types take precedence when versions differ.

| Primitive | API                                                               | Styling                                                               |
| --------- | ----------------------------------------------------------------- | --------------------------------------------------------------------- |
| Input     | [input.json](https://radix-ng.com/docs/api-contract/input.json)   | [input.json](https://radix-ng.com/docs/styling-contract/input.json)   |
| Select    | [select.json](https://radix-ng.com/docs/api-contract/select.json) | [select.json](https://radix-ng.com/docs/styling-contract/select.json) |
| Dialog    | [dialog.json](https://radix-ng.com/docs/api-contract/dialog.json) | [dialog.json](https://radix-ng.com/docs/styling-contract/dialog.json) |

Other primitive files use the same slug as their component index. Styling entries retain the
documented part name in `parts` and the authored value or presence description in `values`.
The styling export contains documented hooks, not an inferred inventory of private DOM attributes.

## Markdown and LLM discovery

- [llms.txt](https://radix-ng.com/docs/llms.txt): links to individual Markdown pages.
- [llms-full.txt](https://radix-ng.com/docs/llms-full.txt): complete documentation when broad context is needed.
- [Agents getting started](https://radix-ng.com/docs/agents/getting-started.md): this guide as Markdown.
- [Select index](https://radix-ng.com/docs/components/select.md): anatomy and links to focused source shards.

Storybook's **Agents** section and these files share their MDX source. The exports are generated
with `pnpm skills:build`; generation does not run a coding agent or certify its output.
