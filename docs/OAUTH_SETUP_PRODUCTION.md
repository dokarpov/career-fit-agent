# RoleHint OAuth provider registration — production

## GitHub OAuth App
Open https://github.com/settings/developers → OAuth Apps → New OAuth App.
- Application name: RoleHint
- Homepage URL: https://dokarpov.github.io/rolehint/site/
- Authorization callback URL: https://rolehint-api-worker-production.up.railway.app/oauth/github/callback
- Create the app and generate a new client secret.
- In Railway → RoleHint → rolehint-api-worker → Variables, set `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET`. **Do not paste secrets into chat or GitHub source.**
- Callback URL is already configured in Railway as `GITHUB_OAUTH_CALLBACK_URL`.
- Note: current OAuth flow requests `read:user repo`; `repo` gives broad private-repository access, not read-only access. Review permissions and use a test account before enabling public access. A GitHub App with fine-grained read-only repository permissions is the preferred future production model.

## Google OAuth Client
Open https://console.cloud.google.com/auth/overview. Configure Google Auth Platform branding, audience, authorized domains, and a Web application OAuth client.
- App name: RoleHint
- Authorized redirect URI: https://rolehint-api-worker-production.up.railway.app/oauth/google/callback
- Configure scopes based on the product's actual requirements: current code requests `openid`, `email`, `gmail.readonly`, and `drive.readonly`. These sensitive/restricted scopes may require Google verification and a security assessment before broad public use. Start in Testing with named test users only, and do not claim production approval.
- In Railway → RoleHint → rolehint-api-worker → Variables, set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`. **Never add credentials to the repository.**
- Callback URL is already configured as `GOOGLE_OAUTH_CALLBACK_URL`.

## Acceptance criteria
1. App `/me/bootstrap` reports `oauth_google_ready` and/or `oauth_github_ready` true only after all three provider configuration variables exist.
2. Clicking Connect starts a provider authorization request, not a local alert.
3. On approved consent, callback persists an encrypted token bound to the signed Telegram user ID, and redirects to the Mini App.
4. Reopen the app and verify the connector remains linked to that user. Verify another Telegram account cannot read it.
5. Verify denied consent, expired authorization code, invalid state, provider outage, token expiration/refresh and disconnect flows.
6. Document storage deletion, OAuth data scope and revocation before public beta.

Do not disable `CFA_PUBLIC_BETA_LOCK` as a workaround. Existing signed `/me/` routes and OAuth callbacks must be explicitly audited and allowed as needed.
