# Archived scripts

These scripts were one-shot recoveries / migrations and aren't part of the
ongoing toolchain. Kept for git history; don't run them again.

| Script | What it did | When |
|---|---|---|
| `apply-triage.ts` | Bulk-applied a triage decision on placeholder products | Manus cleanup |
| `revert-bad-ingest.ts` | Reverted a bad GF sync batch | Early gf-sync iterations |
| `restore-corrupt-descriptions.ts` | Restored descriptions from git after corruption | Manus cleanup |
| `restore-images-from-git.ts` | Re-mirrored images from a previous commit | Image-host migration |
| `update-domain-to-com-au.ts` | Migrated affiliate URLs from .com to .com.au | Domain switch |
| `generate-brand-logo.py` | Python script that generated placeholder text-SVG logos | Replaced by `source-brand-logos.ts` (Wikimedia) |
| `reset-descriptions.ts` | Bulk-cleared corrupt descriptions | Manus cleanup |
| `find-corrupted-descriptions.ts` | Scanned for description corruption signatures | Manus cleanup |
| `fix-corrupted-images.ts` | Repaired broken image references | Manus cleanup |

If a similar problem recurs, write a NEW script with a clear name —
don't resurrect these.
