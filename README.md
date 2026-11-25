# HitzBira-Gramatika

Version 0.9 — integration pilot.

Basque grammar learning application. The interface is in Euskara. The pilot contains 18 grammar families, 128 grammar cards and 60 nominal paradigms. Content remains provisional and is not independently academically validated.

## Run locally

Serve the repository root over HTTP (for example `python -m http.server 8000`) and open `http://localhost:8000`. Opening index.html directly with `file://` is not supported.

## Architecture

- `index.html`, `style.css`, `app.js`: shared interface and practice engine.
- `legacy/`: original pilot data snapshots, kept for traceability and migration.
- `audit.js`: preliminary review notes, not publication approval.
- `docs/ARCHITECTURE.md`: migration direction and quality gates.

The next architecture uses Lexikoa/Supabase as the operational content source, with versioned competencies, prerequisites and reviewed resources. Google Drive remains the editorial documentation repository. Do not put private database records, credentials, user data or service-role keys in this public repository. The existing pilot uses local storage and does not yet fetch content from Supabase.

No official language proficiency certification is implied by practice results.
