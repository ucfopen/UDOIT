# Mock LTI Tool (Rewrite)

This is a standalone frontend for testing the Go rewrite while the full production frontend and launch flow are still in progress.

It is designed to run on the same origin as the Go API so browser cookies (`AUTH_TOKEN`) work without extra CORS/cookie config.

## What this tool is for

- Confirm that your LMS can launch into the rewrite using a real LTI flow.
- Keep a usable UI available even when launch is only partially implemented.
- Smoke test key authenticated APIs after launch.
- Inspect backend responses quickly while iterating on rewrite behavior.

## What this tool is not

- It is not a mock LMS.
- It does not replace proper LTI/OAuth service integrations.

## Route

The Go API serves this app at:

- `/mock-lti-tool`

Any unknown subpath under `/mock-lti-tool/*` falls back to `index.html`.

## LMS setup hints

Typical values while testing:

- **Login initiation URL**: `https://<your-host>/lti/authorize`
- **Target link URI**: `https://<your-host>/mock-lti-tool`

When launch completes, the backend redirects the browser to `target_link_uri`, so this page should still load and show launch/context details.

## Notes on current launch state

Current rewrite launch may not yet include full LMS authorization/service token setup at launch-time.

When you integrate LMS authz/authn deeply (for example obtaining OAuth/service tokens as part of launch), this mock tool should remain useful as a post-launch verification surface.

## Suggested next enhancements

- Add a dedicated endpoint in the rewrite to return the current authenticated principal (`userId`, `tenantId`) for cleaner session checks.
- Add widgets in this mock tool for LMS-linked actions once launch obtains OAuth/service credentials.
- Add an explicit launch-debug panel that surfaces claims/session metadata returned by backend debug endpoints.
