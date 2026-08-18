#!/usr/bin/env node
/**
 * Validate every skill under skills/ against the dsh skill format that
 * dsh-skill-filesystem enforces on discovery:
 *   - one directory per skill containing SKILL.md
 *   - YAML frontmatter with non-empty `name` and `description`
 *   - `name` matches ^[a-z0-9]+(?:-[a-z0-9]+)*$ and equals the directory name
 *   - `disable-model-invocation` / `user-invocable`, when present, are booleans
 *   - no Codex adapter (agents/openai.yaml) and no removed fields (argument-hint)
 *
 * Exits non-zero on the first violation report; prints one line per skill.
 */

import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'

const skillsDir = new URL('../skills/', import.meta.url).pathname
  // Windows: strip the leading slash of file URLs (file:///C:/...)
  .replace(/^\/([A-Za-z]:)/, '$1')

const NAME_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const FORBIDDEN_FILES = ['agents/openai.yaml']
const FORBIDDEN_FIELDS = ['argument-hint', 'disableModelInvocation', 'modelInvocable', 'userInvocable']

/** Parse a flat `key: value` frontmatter block; throws on nested YAML. */
function parseFrontmatter(raw) {
  const lines = raw.split(/\r?\n/)
  if (lines[0] !== '---') return undefined
  const fields = {}
  let closed = false
  for (let i = 1; i < lines.length; i++) {
    if (lines[i] === '---') { closed = true; break }
    const match = /^([A-Za-z0-9_-]+):\s*(.*)$/.exec(lines[i])
    if (!match) throw new Error(`unparseable frontmatter line ${i + 1}: "${lines[i]}"`)
    fields[match[1]] = match[2].replace(/^["']|["']$/g, '')
  }
  if (!closed) throw new Error('frontmatter not closed')
  return fields
}

const entries = (await readdir(skillsDir, { withFileTypes: true }))
  .filter(entry => entry.isDirectory())
  .map(entry => entry.name)
  .sort()

let failures = 0
if (entries.length === 0) {
  console.error('FAIL: no skill directories found')
  process.exit(1)
}

for (const name of entries) {
  const dir = join(skillsDir, name)
  const problems = []
  let fields
  try {
    fields = parseFrontmatter(await readFile(join(dir, 'SKILL.md'), 'utf8'))
  } catch (error) {
    console.error(`FAIL ${name}: ${error.message}`)
    failures++
    continue
  }
  if (fields === undefined) problems.push('SKILL.md has no frontmatter')
  else {
    if (!fields.name) problems.push('frontmatter missing name')
    else if (fields.name !== name) problems.push(`frontmatter name "${fields.name}" != directory "${name}"`)
    else if (!NAME_RE.test(fields.name)) problems.push(`name "${fields.name}" is not kebab-case`)
    if (!fields.description) problems.push('frontmatter missing description')
    for (const field of ['disable-model-invocation', 'user-invocable']) {
      if (field in fields && !/^(true|false)$/i.test(fields[field])) problems.push(`${field} is not a boolean`)
    }
    for (const field of FORBIDDEN_FIELDS) {
      if (field in fields) problems.push(`forbidden field "${field}"`)
    }
  }
  for (const file of FORBIDDEN_FILES) {
    try {
      await readFile(join(dir, file), 'utf8')
      problems.push(`forbidden file "${file}"`)
    } catch { /* absent — expected */ }
  }
  if (problems.length > 0) {
    console.error(`FAIL ${name}: ${problems.join('; ')}`)
    failures++
  } else {
    console.log(`ok   ${name}`)
  }
}

console.log(failures === 0 ? `\nall ${entries.length} skills valid` : `\n${failures} skill(s) failed`)
process.exit(failures === 0 ? 0 : 1)
