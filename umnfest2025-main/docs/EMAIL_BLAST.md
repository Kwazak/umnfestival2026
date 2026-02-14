# UNIFY 2025 Email Blast Tool

This tool lets the committee craft, preview, and send branded emails for UNIFY 2025 straight from the admin dashboard.

## Safety First
- **Trial-only by default.** Real audience blasts are blocked until `EMAIL_BLAST_ALLOW_PRODUCTION=true` is added to `.env` and cache/configs are refreshed.
- Trial sends will *only* go to the reviewer whitelist defined inside `config/email_blast.php`.
- Every blast attempt is logged inside the new `email_blast_logs` table for auditing.

## Admin Workflow
1. Visit **Admin → Email Blast** after logging in.
2. Adjust the subject, hero copy, run-down agenda, CTAs, and highlights.
3. Hit **Refresh Preview** to render the exact HTML template delivered by the Mailable.
4. Press **Save Template** to persist the draft (stored in `storage/app/email-blast/unify-2025.json`).
5. Send a **Trial Blast** to the review list to verify mailbox rendering.
6. Once approved, flip `EMAIL_BLAST_ALLOW_PRODUCTION=true`, reload config (`php artisan config:clear`), and the UI will unlock the **Full Send** pathway (requires typing `UNIFY2025-BLAST` as confirmation).

## API Surface
| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/api/admin/email-blast/template` | Fetch merged template + reviewer whitelist |
| `POST` | `/api/admin/email-blast/template` | Persist edits to storage |
| `POST` | `/api/admin/email-blast/preview` | Return HTML preview (Blade render) |
| `POST` | `/api/admin/email-blast/send` | Trigger trial or production blast |
| `GET` | `/api/admin/email-blast/logs` | Fetch latest send history |

All routes are guarded by the existing `admin.api.auth` middleware and throttled.

## Customisation
- Default copy and trial recipients live in `config/email_blast.php`.
- The Blade template is under `resources/views/emails/campaigns/unify-blast.blade.php` and is shared by both preview + delivery (ensuring parity).
- `app/Services/EmailBlastService.php` handles persistence, preview rendering, recipient resolution, and logging.

## Data Model
- `email_blast_logs` stores payload snapshots, counts, and errors for each attempt.

## Notes
- Mail sending is synchronous for now because the reviewer list is tiny. If production sends become large, plug a queue worker or chunk sending inside the service.
- When running tests locally, ensure dev dependencies are installed so `pest`/`phpunit` executables exist.
