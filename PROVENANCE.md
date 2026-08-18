# Provenance and adaptation log

## Upstream

- Repository: https://github.com/mattpocock/skills
- Pinned commit: `9c9f36ccd3995266cd675468af71639c8dde1ec5` (2026-08-17)
- Upstream version at that commit: v1.2.3 (`.claude-plugin/plugin.json`)
- Scope: the 25 **promoted** skills — `skills/engineering/` (18) and `skills/productivity/` (7), as listed in upstream `.claude-plugin/plugin.json`. Buckets `misc/`, `in-progress/`, `deprecated/`, and `personal/` are intentionally not migrated.
- License: MIT, Copyright (c) 2026 Matt Pocock. This repository is a derivative work for DeepSeek Harness (dsh); see [LICENSE](LICENSE).

## Why a separate adaptation exists

The upstream skills target Claude Code. DeepSeek Harness (dsh) is format-compatible (same `<name>/SKILL.md` + YAML frontmatter, `disable-model-invocation` supported) but differs in tool surface and invocation mechanics, so the bodies needed rewriting to behave correctly under dsh.

## Adaptation rules applied

1. **Removed dsh-unrecognized artifacts**: `agents/openai.yaml` (Codex adapter metadata) from every skill; `argument-hint` frontmatter field (`handoff`, `teach`).
2. **Model-side skill invocations**: instructions like *"Call the Skill tool with X"* or *"use /tdd"* become *"call the `skill` tool with name `X`"*. Rationale: in dsh the `/name` gesture fires only on text the **user** types; output the model writes triggers nothing, and model-invocable skills load through the `skill` tool.
3. **Subagent references**: *"sub-agent / background agent / parallel sub-agents"* become `subagent`, named as the `subagent` tool where spawning is described (parallel = multiple `subagent` calls in one message; background = `run_in_background: true`).
4. **dsh-inexistent commands**: `/clear` (a Claude Code client command) becomes "start a new session"; `/compact` is kept (dsh command).
5. **Harness-swap example**: "Claude → Codex" becomes "Claude Code → dsh".
6. **Kept unchanged**: all 25 skill names (so installing into `~/.dsh/skills` shadows any older copy in `~/.agents/skills` — rank 400 beats rank 500); every `name`/`description`/`disable-model-invocation` frontmatter (natively supported); description trigger words (description is the only routing signal); slash references that describe what the **user** types (valid dsh gesture — `user-invocable` defaults to true for all 25).

## Per-skill log

| Skill | Changes |
|---|---|
| ask-matt | `/clear`ing → "starting a fresh session"; "`/clear`" option → "New session"; PHASE-BOUNDARIES.md: table row + §2 rewritten for new-session, harness example "Claude → Codex" → "Claude Code → dsh" |
| code-review | "sub-agent(s)" → "subagent(s)" throughout; §4 heading gains "Issue the two `subagent` tool calls in one message so they run concurrently" |
| codebase-design | SKILL.md: "parallel sub-agents" → "parallel subagents"; DESIGN-IT-TWICE.md: terminology + §2 names the `subagent` tool and one-message parallel issue |
| diagnosing-bugs | none (harness-neutral) |
| domain-modeling | none |
| grill-me | "Call the Skill tool with \"grilling\"" → `skill` tool wording |
| grill-with-docs | same rewrite, two names |
| grilling | "dispatch a sub-agent" → "dispatch a subagent (the `subagent` tool)" |
| handoff | `argument-hint` removed; "suggested skills" wording → `skill` tool / ask-user-to-invoke |
| implement | "Use /tdd" / "use /code-review" (model-facing) → `skill` tool calls |
| improve-codebase-architecture | 4× Skill-tool wording; "spawn a sub-agent" → `subagent` tool; "`/codebase-design`" → "`codebase-design`"; HTML-REPORT.md: 3× de-slash |
| prototype | none (`/prototype/<name>` in UI.md is a URL route, not a command) |
| research | "background agent" → "background subagent (`subagent` tool, `run_in_background: true`)" |
| resolving-merge-conflicts | none |
| setup-matt-pocock-skills | none — dsh's agent-instructions loads both `AGENTS.md` and `CLAUDE.md`, so the file-selection logic is valid as-is |
| tdd | Skill-tool wording for `codebase-design` |
| teach | `argument-hint` removed |
| to-questionnaire | none |
| to-spec | none ("tell the user to run `/setup-matt-pocock-skills`" is already the correct dsh framing) |
| to-tickets | none |
| triage | Skill-tool wording (grilling + domain-modeling) |
| wait-what | none |
| wayfinder | 6× Skill-tool wording; research tickets name the `subagent` + `skill` tools |
| wizard | none |

## Re-syncing from upstream

Re-clone upstream, diff `skills/engineering/` + `skills/productivity/` against this repository's `skills/`, and re-apply the rules above to any changed body. Update the pinned commit in this file with the sync.
