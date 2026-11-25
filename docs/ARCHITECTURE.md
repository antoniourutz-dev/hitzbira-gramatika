# Architecture and migration direction

## Baseline

This repository preserves the exact nine runtime files from HitzBira-Gramatika 0.9, deployed as a preview. The historical data files are provisional snapshots, not the canonical operational bank. The application uses browser local storage and a client-side practice engine.

## Target architecture

- GitHub: application source, public technical documentation and non-sensitive migration code.
- Lexikoa (Supabase): operational content, versioned competencies, dependencies, approved grammar resources and secure student progress.
- Google Drive: editorial documentation, curriculum, audits and decisions.
- Vercel: deployment of the application; deploying this snapshot is a separate operation.

The curricular proposal has 54 learning nodes and 3 bridge nodes. Existing Lexikoa records should be reused by stable identifiers; new material requires comparison and review. Keep nominal declension and verbal nominalization as reusable components. Do not assume published editorial status equals independent academic approval.

## Quality gates

1. Preserve original IDs, source versions and variants; avoid duplicating existing structures.
2. Separate descriptive grammar, normative rules, accepted variants, stylistic options and uncertainty.
3. Validate each resource, example, exercise and accepted answer before publication.
4. Require independent review and regression checks; a match with the reference model is not a proficiency certificate.
5. Keep private staging and student data inaccessible to unauthorised clients. Never ship privileged credentials.
6. Migrate progressively; remove bundled legacy data only after the reviewed database-backed replacement is verified.

## Known limits of 0.9

The integration pilot has not completed independent linguistic validation or full end-to-end browser testing. Prior preview progress is not migrated. No production deployment or Supabase migration is performed by this commit.
