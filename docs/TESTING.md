# EstateSphere Testing Guide

These are reproducible checks for the current implementation. Read-only checks are safe against the existing database. Write/workflow tests can create accounts, listings, uploads, or requests; use only authorized test accounts and temporary records, and clean up only records created for that test.

## Test status and evidence

### Executed during documentation preparation (2026-10-27)

| Check | Result |
|---|---|
| `GET http://localhost:5000/api/health` | Passed: `status: ok`, service `EstateSphere API` |
| `GET http://localhost:5000/api/properties` | Passed: `success: true`, count and returned data length both 228 |
| Frontend/backend listener inspection | Passed: port 5173 served by Vite; port 5000 served by one Node backend process |
| MongoDB data safety | Read-only API result confirmed 228 returned records; no mutation performed |

### Recorded from earlier Phase 9 testing (not rerun for these docs)

Earlier Phase 9 results recorded successful six-category page checks, nationwide state search, homepage state/budget search, details/image fallback, role-protected API behavior, temporary owner/admin/tenant workflows, and responsive checks at 1440, 768, 390, and 320 px. Temporary test records were reported cleaned up. The actual existing administrator login was not tested; a temporary administrator record was used for earlier review-flow testing.

Treat these as prior test evidence, not as fresh tests of the presentation machine. Re-run the cases below when preparing for evaluation.

## Build and syntax checks

From the project root in PowerShell:

```powershell
npm run build --prefix client
Set-Location server
node --check src\index.js
node --check src\app.js
Get-ChildItem src\routes\*.js,src\models\*.js | ForEach-Object { node --check $_.FullName }
```

Expected: Vite build succeeds and `node --check` commands exit without syntax errors. Neither package currently defines an automated `test` script.

## Read-only API checks

```powershell
$health = Invoke-RestMethod http://localhost:5000/api/health
$health

$all = Invoke-RestMethod http://localhost:5000/api/properties
"API count: $($all.count); returned: $($all.data.Count)"

$girls = Invoke-RestMethod 'http://localhost:5000/api/properties?category=girls-pg'
"Girls PG count: $($girls.count)"

$locations = Invoke-RestMethod http://localhost:5000/api/locations
"State/UT count: $($locations.coverage.statesAndUnionTerritories)"
```

Expected on the documented workspace at the time checked: health `ok`, all-property count 228, Girls PG count 38, and location catalog coverage 36 States/UTs. Database content may change as legitimate user listings are created; never reset data just to match these counts.

### Filtering, detail and visibility

1. Open `/listings/girls-pg`; expect nationwide results and no preselected State.
2. Choose a State, then a City, then a Locality. Confirm each later selector depends on its parent and results update.
3. Choose a maximum monthly budget and property type. Check the URL/query and rendered properties update.
4. Open a returned card and verify the details route displays matching title/location and image fallback behavior.
5. Open `/search?mode=buy&sort=recent`; it must show sale listings only, newest first, or a no-results state. Sale budget applies to `askingPrice`, not `monthlyRent`.
6. To verify an empty location, select a location/category combination with no matches; expect the empty state, not results from another place.

## Authentication and authorization cases

Use the existing UI at `/register` and `/login`; never put real passwords in terminal commands, shell history, screenshots, or assignment documents.

| Case | Action | Expected |
|---|---|---|
| Public tenant registration | Register an authorized temporary tenant using the UI | Account created; session cookie is HttpOnly; tenant workspace opens |
| Owner registration | Register with Owner role | Owner role workspace opens |
| PG operator registration | Register with PG Operator role | PG operator workspace opens |
| Administrator registration restriction | Inspect registration role choices / attempt public admin role using a controlled API test | Rejected; administrator can only be provisioned by existing private mechanism |
| Login/logout | Sign in, use role landing page, log out | Role session established; logout clears browser cookie and returns to sign-in |
| Protected UI | In a signed-out browser, open `/owner`, `/pg-operator`, `/admin`, or `/tenant/requests` | Redirect to sign-in |
| Protected API | Request protected routes without cookie | HTTP 401 |
| Wrong role | Use an authenticated account against another role's route/API | HTTP 403 or UI redirect, depending on route |

The backend uses stateless JWT cookies. Logout clears the browser cookie; this application does not implement a server-side token revocation list. Do not describe logout as revoking already copied token material.

## Owner and PG-operator CRUD / approval cases

Run only if an authorized test owner/PG operator and administrator account are available. Do not invent credentials or modify existing listings.

1. Sign in as owner/operator and create one uniquely named temporary listing with required details and at least one permitted image.
2. Confirm it appears in the account's own listing list with Pending review status.
3. As a signed-out visitor, verify it is absent from public search and public detail.
4. As administrator, open `/admin/properties`, filter pending submissions, inspect the item, approve it.
5. Confirm the listing becomes publicly visible and the owner sees Approved.
6. Edit a material field as owner. Confirm the status becomes Pending and public visibility ends until it is approved again.
7. Reject the pending listing with a reason of at least 10 characters; confirm the owner sees the reason.
8. Attempt owner access to a different user's property ID and admin action using a non-admin account; expect denial.
9. Deactivate the temporary listing. Confirm it becomes unavailable to public search.
10. Clean up only the exact temporary test listing/images and test account through the intended UI/admin test procedure. Never delete or deactivate existing user listings.

The owner route's `DELETE` method performs a soft deactivation (`availability: unavailable`, `listingStatus: inactive`), not a MongoDB document deletion.

## Tenant enquiry and visit-request cases

Requires a tenant and an eligible approved, available, non-demo listing owned by a test owner. Demo properties deliberately disable these interactions.

1. As tenant, open the approved listing and submit an enquiry with subject and message.
2. Check `/tenant/requests` for the submitted request.
3. Repeat with the same idempotency key in a controlled API test; expect an idempotent response rather than a duplicate.
4. As the listing owner/operator, open received requests and respond.
5. As tenant, verify the response and history are visible.
6. Submit a future visit date/time within the next 365 days. The owner/operator accepts or declines it; decline requires a reason.
7. Verify request history/status from the tenant and owner views.
8. Try a demo property, an unrelated owner's listing, and a wrong role; requests should be rejected.
9. Clean up only test-created requests and associated test listing/account.

## Navigation and viewport cases

1. Open each of the five top-level menus and select each of their five categories.
2. Open all five destinations under each category. Confirm each has a destination-matching heading and actionable link. There are 125 destination routes; informational guidance is not equivalent to a backend service.
3. On desktop, open/close via click and hover; use Escape and click outside to close.
4. On mobile, open navigation, choose a menu/category, use the back control to return to categories, then open a destination.
5. Test at widths such as 1440, 768, 390, and 320 px; inspect horizontal overflow and search/menu usability.

## Image checks

1. Open a public property card and detail page. Confirm the image displays.
2. If safe in a local browser, use dev tools to temporarily alter the image URL or block it and confirm the fallback asset is used.
3. Check demo labels: images are illustrative and must not be presented as photographs of fictional properties.

## Results record

For an assignment test log, record: date, machine, Node/MongoDB versions, commands or UI steps, expected result, actual result, pass/fail, and any issue reference. Do not include passwords, tokens, database URIs, `.env` contents, or personal account data.
