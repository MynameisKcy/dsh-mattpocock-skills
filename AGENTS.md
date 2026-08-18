# AGENTS.md

This repository is `dsh-mattpocock-skills`: a dsh (DeepSeek Harness) skill pack adapted from mattpocock/skills. You are likely reading it because a user asked you to install it.

## How to install this pack (for agents)

The user's dsh version determines nothing about these steps — all channels work on any dsh with the standard base composition. Ask the user which they prefer only if installation fails; otherwise pick by context:

1. **Preferred — `dsh plugin` (bundle channel, per-profile):**

   ```sh
   dsh plugin --profile <name> add dsh-mattpocock-skills        # from npm
   dsh plugin --profile <name> add github:<owner>/dsh-mattpocock-skills   # from git
   ```

   Verify with `dsh --profile <name> --dump-config` — a `# == dsh-mattpocock-skills` layer must appear. Requires the `dsh` CLI on PATH.

2. **Fallback — directory drop (all profiles, no CLI needed):** from this repository's root:

   - POSIX / Git Bash: `bash scripts/install.sh`
   - Windows PowerShell: `powershell -ExecutionPolicy Bypass -File scripts\install.ps1`
   - Other targets: `--user-agents` → `~/.agents/skills`; `--project <dir>` → `<dir>/.dsh/skills`; `--uninstall` removes the pack.

If this clone is the user's own checkout, install from the local path: `dsh plugin --profile <name> add <absolute path of this repo>`.

After installing either way, tell the user: new sessions pick the skills up automatically; to start, run `/setup-matt-pocock-skills` once in the target repo, then `/ask-matt`.

## Repository layout

- `skills/` — the 25 adapted skills (`<name>/SKILL.md`, dsh format)
- `src/index.js` + `cordis.patch.yml` + `package.json` — the dsh bundle (registers a rank-400 skill provider over `skills/`)
- `scripts/install.sh`, `scripts/install.ps1` — directory-drop installers; `scripts/lint-skills.mjs` — format validation
- `PROVENANCE.md` — pinned upstream commit and the adaptation rules; read it before editing skill bodies
- `README.md` / `README.zh-CN.md` — install and usage documentation

## Conventions when editing skills

- Frontmatter stays the flat dsh subset: `name`, `description`, `disable-model-invocation`, `user-invocable`. No `argument-hint`, no `agents/openai.yaml`.
- Model-facing instructions load other skills via the `skill` tool ("call the `skill` tool with name `x`"); `/name` slash syntax is reserved for text the user types (a valid dsh gesture for every skill here).
- Subagents are spawned with the `subagent` tool; parallel means several calls in one message, background means `run_in_background: true`.
- `/compact` is a real dsh command; there is no `/clear` — write "start a new session" instead.
- Keep all 25 skill names identical to upstream (shadowing and re-sync depend on it). Run `node scripts/lint-skills.mjs` before committing.
