# Activate optional accounts (free plans)

The frontend works without configuration. It deliberately shows “Account sign-in is being set up” until connected to your own backend. Guest image tools and downloads remain available. A public Supabase URL/key alone does **not** create the database, enable Google login, or deploy account deletion.

## 1. Create your backend

Create a **Free** project at https://supabase.com/dashboard. Use a dedicated project for this app so unrelated storage policies cannot grant access to this bucket. Keep the database password private. In the project's SQL Editor, run `migrations/202610040001_accounts.sql`, then `migrations/202610040002_admin_bootstrap.sql`, in that order, once each. The migration is transactional; if it fails, fix the error before retrying. Do not rerun a successful migration.

This creates profiles, saved-file metadata, bounded history, admin audit records, private storage, quotas, and server-side authorization. It grants no administrator access until a trusted project owner explicitly approves an account. A one-time email approval can activate the first admin only after Auth verifies that email.

In the project settings, copy:

- Project URL: `https://YOUR_PROJECT_REF.supabase.co`
- Public **publishable** key (`sb_publishable_...`), or legacy **anon** key.

These two values may be shared with the developer. Never send a database password, Google client secret, Supabase secret key, or service-role key in chat or commit one to Git.

## 2. Enable Google sign-in

Follow the [official Supabase Google setup](https://supabase.com/docs/guides/auth/social-login/auth-google).

1. Create a Google Cloud project and configure its OAuth consent screen. Use only `openid`, email, and profile scopes.
2. Create an OAuth client of type **Web application**. Add the exact callback URL shown in Supabase's Google provider settings to Google's authorized redirect URIs: `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`.
3. Put the Google client ID and client secret into **Supabase → Authentication → Sign In / Providers → Google**. Enable the provider. The secret belongs there, never in the public website.
4. In **Authentication → URL Configuration**, set Site URL to `https://ilovefreecompressor.vercel.app/`. Add these exact redirect URLs:
   - `https://ilovefreecompressor.vercel.app/`
   - `https://kathirvelm387.github.io/i-love-free-compressor/`
   - For development only: `http://localhost:4173/` and/or `http://127.0.0.1:4173/`.
5. If the Google OAuth application is in testing mode, add your test Google accounts. To allow public signups, complete Google's consent-screen publishing requirements.

The app uses the authorization-code PKCE flow. Google creates a **member** account on first login. No email/password signup, SMTP provider, or paid email service is required.

## 3. Deploy account deletion

Install/use the official Supabase CLI, authenticate **locally** with your own account, then run from the repository root:

```sh
supabase login
supabase link --project-ref YOUR_PROJECT_REF
supabase functions deploy delete-account --project-ref YOUR_PROJECT_REF
```

`supabase/config.toml` disables the gateway's legacy JWT verification for this function. The function itself always validates the bearer token using `auth.getUser()` before any privileged operation. Do not remove that validation.

Supabase provides the Edge Function's `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` server-side. None is copied from the function into the browser. If your project does not provide the legacy keys, configure equivalent public/server credentials in the function environment using the Supabase dashboard; keep the existing environment variable names.

By default, requests from the production Vercel and GitHub Pages origins are allowed. For local testing or a new deployment domain, set the `ACCOUNT_ALLOWED_ORIGINS` function secret to a comma-separated list of exact origins (no path/trailing slash). Keep production origins in that list. The browser's project-specific CSP must also allow the selected Supabase project.

Deletion freezes the caller's profile, removes their private objects using the Storage API, then deletes their Auth account. Database foreign keys cascade files/history/preferences. Failures leave an account in `deleting` status so the same authenticated user can retry. No request body can choose another account to delete. The last active admin must assign another active admin first. Administrative audit records retain UUIDs/actions, without email or display name.

## 4. Configure and deploy the website

Use Node.js 22 or newer:

```sh
npm ci
node scripts/configure-accounts.mjs https://YOUR_PROJECT_REF.supabase.co YOUR_PUBLIC_PUBLISHABLE_KEY
npm run test:accounts
npm run test:account-ui
npm test
```

The configuration script rejects secret/service-role keys. It writes the public config and allows network connections only to that project in all three CSP locations: HTML, Vercel headers, and `_headers`. Do not weaken `script-src` or enable arbitrary network access. OAuth uses a top-level redirect, not embedded third-party scripts.

Commit the public config/CSP changes and deploy the existing `public/` directory to Vercel and GitHub Pages. No frontend build is needed on the hosting service. `npm run build:auth` rebuilds the pinned local Supabase SDK if dependencies change; licenses are included beside the bundle.

## 5. Establish the first administrator

Before the intended owner's **first website sign-in**, enter their exact Google email address in the trusted SQL Editor:

```sql
insert into account_private.admin_bootstrap (approved_email)
values (lower('YOUR_GOOGLE_EMAIL_ADDRESS'));
```

This private, single-use approval cannot be read or changed by app users. An unverified signup receives the member role even if its metadata claims to be verified or an admin. Only Auth's server-managed email confirmation can activate the approved owner. The approval is consumed once; subsequent logins cannot restore a revoked admin role. No other email is promoted.

After Google sign-in is enabled, use the approved email to sign in on the website. The Admin tab appears automatically. Role, suspension, and quota changes then use the Admin screen and produce audit records. Administrators cannot read another user's private files through the application.

If the intended owner already signed in before preapproval was configured, use the following alternative with their verified UUID from Authentication → Users. Confirm that exactly the intended account is returned. Do not edit `auth.users` directly to fabricate email verification.

```sql
begin;
update public.account_profiles p
set role = 'admin'
from auth.users u
where p.id = u.id
  and u.id = 'REPLACE_WITH_VERIFIED_OWNER_UUID'::uuid
  and u.email_confirmed_at is not null
returning p.id, p.display_name, p.role;
-- Do not leave an unused matching approval that could regrant a revoked role.
delete from account_private.admin_bootstrap b
using auth.users u
where u.id = 'REPLACE_WITH_VERIFIED_OWNER_UUID'::uuid
  and u.email_confirmed_at is not null
  and b.approved_email = lower(u.email)
  and b.consumed_at is null;
commit;
```

Sign out/in after this alternative to refresh the interface.

## Limits and operations

- Per file: 5,000,000 bytes; per member: 20,000,000 bytes and 100 file entries.
- The site ceiling is 800,000,000 bytes; an admin can lower it, including zero to stop new saves. Quota changes do not remove existing files.
- A pending upload reserves the full 5 MB storage bucket limit. Finalization charges its verified actual size. This prevents small declared sizes from bypassing the quota. At least 5 MB of free quota is needed to start any upload. Interrupted uploads stay visible in My Files and can be deleted to release the reservation.
- Activity stores only tool names and output byte counts, retains the latest 100 entries per member, and can be disabled or cleared. No original filename/photo is recorded in automatic history. File bytes upload only on **Save to My Files**.
- Compression defaults apply when opening the next photo in Compress or Exact size; favorite tools appear on the dashboard.
- Sessions persist in browser storage. Sign out on shared devices. Signing out clears account-page data and saved preferences from the running app; it does not erase local image-tool selections or downloads.
- Free services have limits and availability conditions. Storage caps do not cap all Auth, bandwidth, database, or Edge Function usage. Keep the project on the Free plan, monitor its dashboard, and do not enable a paid upgrade to work around limits. Free Supabase projects may pause after inactivity; restore them in the dashboard if needed. Guest tools remain functional when the account service is unavailable.
- Back up important files by downloading them. Admin audit records are retained; monitor database usage and maintain an appropriate retention policy as the app grows.

## Required live acceptance checks

Local tests use real embedded PostgreSQL for the migration/RLS and the real browser SDK against intercepted test responses. They cannot prove that Google OAuth, a hosted Storage service, redirect configuration, or deployed Edge Functions are correctly configured. Before announcing live accounts:

1. Create two member accounts and one designated admin. Check Google signup, sign-out, sign-in, and the callback on both hosting URLs.
2. Save/download/delete a real image, PDF, ZIP, and palette text file. Check the private bucket and the ready-file byte count.
3. Use one member's session to request another's object/row; verify denial. Check admin access to another member's object is also denied. Do not add public or overlapping permissive storage policies.
4. Try an oversized save, exhausted quota, interrupted upload cleanup, disabled history, and preference persistence after signing back in.
5. Suspend/demote a user and verify backend access changes while their old session still exists.
6. Delete a disposable member account. Verify Storage objects are gone before Auth deletion, and profiles/history/file metadata are gone afterward. Verify the last admin cannot delete itself.

Sources: [Supabase Auth](https://supabase.com/docs/guides/auth/social-login/auth-google), [Storage access control](https://supabase.com/docs/guides/storage/security/access-control), [Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security), [Edge Function authentication](https://supabase.com/docs/guides/functions/auth).

## Optional hosted acceptance script

After deploying both migrations and the deletion function, `scripts/check-live-accounts.mjs` can check the actual hosted services. It requires an authenticated Supabase CLI, Node.js 22+, and Python/Pillow. Set `SUPABASE_CLI` if the CLI is not on PATH. It creates disposable users through the Admin API without sending emails, saves tiny real JPEG/PDF/ZIP/text files, exercises permissions and deletion, restores the original site quota, and removes its test users/files. It does not configure Google or replace a real browser Google login check.

```sh
node scripts/check-live-accounts.mjs YOUR_PROJECT_REF --confirm-live-test
```

The frontend checks Google provider availability on account pages. If it is disabled, visitors see an honest setup message. After enabling it, **Check again** makes the sign-in button available without another deployment.
