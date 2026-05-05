# Gadget Style — SME Agents

Five specialist sub-agents you can summon via the `Agent` tool with `subagent_type: "<name>"`. Each owns a focused domain so the main session doesn't drag through irrelevant context.

| Agent | Domain | When to use |
|-------|--------|-------------|
| `gs-social` | Pinterest, Instagram, Meta, OAuth, posting, social cron | Anything social: dev apps, tokens, captions, scheduling |
| `gs-deploy` | Vercel, Crazy Domains DNS, CI/CD, custom domain, SSL | Anything hosting: deploys, broken builds, DNS, certs |
| `gs-catalog` | `data.ts`, drafts, validation, scraping (GF/T&T/Amazon), images | Anything catalog: add/remove products, run pipelines, fix validator |
| `gs-affiliates` | Amazon Associates, direct-brand programs, link wrapping | Anything monetization: signups, tracking links, commission |
| `gs-content` | Descriptions, captions, hashtags, brand voice, blog | Anything written: copy, voice, content audits |

## How they're invoked

```
Agent({
  subagent_type: "gs-social",
  description: "Refresh Pinterest token after expiry",
  prompt: "PINTEREST_REFRESH_TOKEN expired. Run social:oauth pinterest, write the new token to .env.local, then verify with a dry-run pin."
})
```

The main session can spawn multiple in parallel when their work is independent — e.g. while `gs-catalog` runs `gf:sync`, `gs-social` can refresh tokens.

## Cross-agent coordination

- `gs-affiliates` ↔ `gs-catalog`: when a brand-direct affiliate is approved, `gs-affiliates` writes the new tracking-link mapping; `gs-catalog` swaps the URLs in `data.ts` and revalidates.
- `gs-social` ↔ `gs-content`: pin captions and IG copy come from `gs-content`'s voice rules but get scheduled and posted by `gs-social`.
- `gs-deploy` ↔ everyone: every push to main triggers a deploy. If anyone's commit fails CI, `gs-deploy` is the one to debug.

## Memory model

All agents read from `~/.claude/projects/C--Users-User-Desktop-Gadget-Style-Website/memory/MEMORY.md` and the linked notes. Each agent's frontmatter lists which memory files are most relevant. Don't duplicate facts in the agent spec — point to the memory note.

## Tool surface per agent

Each agent's `tools:` frontmatter lists what it can do. Common pattern:

- All five: `Read, Write, Edit, Bash, Glob, Grep`
- Browser-driving (gs-social, gs-deploy): + `mcp__Claude_in_Chrome__*`
- Web-research (gs-deploy, gs-affiliates, gs-catalog, gs-content): + `WebFetch`

If an agent needs a tool not in its list, it'll fail with a clear "tool not available" — escalate to expand the agent's tools rather than fall through.
