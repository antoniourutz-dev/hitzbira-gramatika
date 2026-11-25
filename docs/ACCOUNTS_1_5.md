# HitzBira 1.5 — student access only

No self-registration, invitation, guest mode or previous-email option. Only username and password. The app appends @hitzbira.app, validates the Supabase session and the private allowlist before downloading the learning scripts or any bank content. All bank reads use the fixed authorized Supabase gateway. Local progress remains isolated by account UUID, and no cross-device sync is claimed. Browser storage contains a session, not the password. Login requires an internet connection.

## Administrator manual workflow
1. Lexikoa > Authentication > Users > Add user > Create user. Use a lower-case name plus @hitzbira.app and a strong password, and auto-confirm the user. Do not send the credentials yet.
2. SQL Editor: `select sustrai_private.hb_enable_manual_account('ikaslea01@hitzbira.app');` (substitute the exact email). This is administrative provisioning, not a public RPC. The domain guard sets an isolated JWT role; no existing other application memberships are granted. The explicit enable step prevents self-signups in the shared project from gaining HitzBira access.
3. Give the pupil only their username and password through a secure channel. To revoke access: update public.hb_registered_accounts set enabled=false where email='...'; existing gateway reads are then denied. There is no email reset workflow for the synthetic address.

Two existing confirmed domain accounts with student profile, no other pilot/admin membership and no sessions were enabled in the database; passwords were not changed. Outstanding invites revoked; previous registration endpoint rejects register. Public static bank copies removed from this branch's deploy (prior public Git history and deployments are unchanged). No canonical material newly published. A real student sign-in still needs testing with a manually held password; do not treat syntax checks as an end-to-end test.
