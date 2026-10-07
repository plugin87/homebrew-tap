# plugin87/homebrew-tap

Homebrew formulae for [ux-ui-agent-skills](https://github.com/plugin87/ux-ui-agent-skills).

```bash
brew install plugin87/tap/ux-ui-agent-skills
```

Then, in any project:

```bash
ux-ui-skills init                   # CLAUDE.md + .claude/ skills, rules, hooks
ux-ui-skills init --agent codex     # AGENTS.md, for Codex, Cursor, Copilot, Aider
```

## What is in here

| Formula | What it installs |
|---|---|
| `ux-ui-agent-skills` | The design-system kit: DTCG tokens, component specs, WCAG 2.2 gates, 138 design systems, and the CLI that installs them into a project |

Homebrew is a convenience, not a different product: the formula downloads the
same npm tarball `npx ux-ui-skills` runs. Use whichever you already have.

## Maintenance

The formula is generated, never hand-edited - its version, URL and sha256 have
to agree with the registry, and retyping any of them is how a tap installs a
build it does not name. Homebrew cannot catch that, because the sha256 it
verifies is the one in the formula.

From a checkout of the main repo, sitting next to this one:

```bash
node scripts/update_homebrew_formula.mjs
```

It reads the version from `package.json`, fetches that version's registry entry,
downloads the tarball, computes the sha256 from the bytes it actually received,
and checks them against npm's `dist.integrity` before writing anything.

Issues and changes belong in the
[main repository](https://github.com/plugin87/ux-ui-agent-skills).
