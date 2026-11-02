# EstateSphere Rubric Compliance

This assessment maps the current source implementation to the stated 30-mark rubric. It distinguishes implemented evidence from limits; it is not a claim that every workflow was rerun during documentation preparation.

## 1. Problem Definition & PoC Planning — 3 marks

**Evidence:** The [README problem statement](../README.md#problem-statement) identifies fragmented accommodation and property discovery as the problem, names tenants, owners, PG operators and administrators as users, and defines PoC scope and exclusions.

**Implemented scope:** Nationwide accommodation/rental discovery, sale-search support, user listing management, moderation and tenant request workflows. Payments, completed bookings, notifications and transactions are explicitly out of scope.

**Evaluation checklist**

- [x] Problem and target users documented.
- [x] PoC objectives and scope documented.
- [ ] Student-specific planning artifacts, timeline, or original requirements sign-off are not represented in application source; provide separately if required by the instructor.

## 2. React Front-End Development — 5 marks

**Evidence**

- `client/src/main.jsx`: React root, `BrowserRouter`, and `AuthProvider`.
- `client/src/App.jsx`: public routes, role-protected route groups, page shell and scroll behavior.
- `client/src/components/`: reusable `Header`, `HeroSection`, `LocationSelectors`, `PropertyCard`, `Breadcrumbs`, `Footer`, and route guards.
- `client/src/pages/`: listing search, property details, auth, property management, administrator review, role workspaces, property requests, and navigation destination pages.
- `client/src/context/AuthContext.jsx`: shared authentication state.
- `client/src/styles.css`: responsive layout and component styling.

**Implemented evidence:** Responsive home/search pages, URL-backed detailed result filters, category and detail pages, role-specific workspaces, loading/error/empty states, image fallbacks, and hierarchical 5 × 5 × 5 navigation.

**Limits:** Some navigation destinations are informative category-guidance pages, not individually implemented business services. Saved properties and saved searches are explicitly not implemented.

## 3. Node.js & Express Back-End — 5 marks

**Evidence**

- `server/src/index.js`: dotenv loading, JWT configuration guard, MongoDB connection and HTTP listener.
- `server/src/app.js`: Express app, CORS, JSON parsing, cookie parsing, static uploads, API routers and centralized errors.
- `server/src/routes/`: `authRoutes.js`, `propertyRoutes.js`, `ownerPropertyRoutes.js`, `adminPropertyRoutes.js`, `propertyRequestRoutes.js`, `locationRoutes.js`, `healthRoutes.js`.
- `server/src/middleware/authMiddleware.js`: JWT cookie authentication and role checks.
- `server/src/middleware/errorHandler.js`: API error mapping.

**Implemented evidence:** REST endpoints, validation, authentication/role enforcement, property image uploads, listing moderation, and request workflows.

**Limits:** No automated server test runner is configured in `server/package.json`; backend validation currently includes syntax checks and reproducible API/manual checks.

## 4. MongoDB Database Integration — 4 marks

**Evidence**

- `server/src/config/db.js`: Mongoose connection using `MONGODB_URI`.
- `server/src/models/User.js`: users, roles, unique email and hidden password hash.
- `server/src/models/Property.js`: listing details, rent/sale prices, location, images, demo marker, approval state and review history.
- `server/src/models/PropertyRequest.js`: tenant request, property/owner references, status, idempotency key and history.
- `server/src/data/indiaLocations.js` and `server/src/data/nationwideDemoProperties.js`: location and fictional seed source data.

**Current check:** On 2026-10-27, the live API returned 228 properties. Every record counted in the current workspace was marked `isDemo: true`. This is a point-in-time database observation, not a fixed schema guarantee.

**Limits:** Location catalog is source-defined; locality options are curated examples and not exhaustive.

## 5. MERN Integration & Data Flow — 4 marks

**Example workflow: public property search**

1. `HeroSection.jsx` obtains States/UTs through `locationApi.js`; the user submits a state and optional monthly budget.
2. React navigates to `/search` with URL query parameters. `ListingPage.jsx` reads those parameters and calls `getProperties()` in `propertyApi.js`.
3. Express receives `GET /api/properties`, validates and normalizes category/location/price filters, then queries `Property` through Mongoose.
4. The route applies public visibility rules (available demo listings or available, approved non-demo listings) and returns JSON results plus filter options.
5. React stores the response in page state and renders `PropertyCard` components. Detailed filters update query parameters and trigger another API request.

This is real database-backed filtering; property results are not hardcoded into React.

**Example write workflow: property approval**

1. An authenticated owner/PG operator submits multipart form data through `ownerPropertyApi.js`.
2. `POST /api/owner/properties` derives the owner from the HttpOnly-cookie JWT session, stores images and creates a `Property` with `listingStatus: "pending"`.
3. An administrator-only review route updates only a pending non-demo listing and records reviewer/time/history.
4. Public property queries include a user listing only when it is approved and available; an owner material edit returns it to Pending.

## 6. Application Functionality — 4 marks

**Evidence**

- Public search: `client/src/pages/ListingPage.jsx`, `server/src/routes/propertyRoutes.js`.
- Property details and demo notices: `client/src/pages/PropertyDetailsPage.jsx`.
- Owner/PG listing management: `client/src/pages/PropertyManagementPage.jsx`, `server/src/routes/ownerPropertyRoutes.js`.
- Administrator review: `client/src/pages/AdminPropertyReviewPage.jsx`, `server/src/routes/adminPropertyRoutes.js`.
- Tenant and owner requests: `client/src/pages/PropertyRequestsPage.jsx`, `server/src/routes/propertyRequestRoutes.js`.
- Authentication and role workspaces: `client/src/pages/AuthPage.jsx`, `client/src/pages/RoleLandingPage.jsx`, `server/src/routes/authRoutes.js`.

**Supported backend operations**

- Property: create, read, update, and deactivate (the DELETE endpoint is a soft deactivation, not a database delete).
- Review: approve/reject pending user listings, with rejection reason and review history.
- Requests: create/read/respond/decide; no request deletion endpoint is implemented.
- Account: register, login, read current session, logout; public admin registration is prohibited.

**Limits:** Visit requests are not confirmed bookings. Demo properties cannot accept real enquiry/visit requests. No payments, messaging service, notifications, saved listings, or transaction processing.

## 7. Testing, Debugging & Validation — 2 marks

**Current-session executed checks (2026-10-27):**

- [x] Queried `GET /api/health`.
- [x] Queried `GET /api/properties`; returned 228 items.
- [x] Frontend build and route-specific/manual tests are recorded in [TESTING.md](TESTING.md); rerun the documented tests on the evaluation machine.

**Previously performed checks:** Phase 9 work recorded manual tests of the six categories, homepage search, listing/detail image fallback, role permissions, temporary owner/admin/tenant workflows, and responsive widths. Those checks were not all rerun during this documentation task. See the status table in [TESTING.md](TESTING.md).

**Attention:** The project has no configured automated test scripts in the client or server manifests. Plan time for manual live demonstration and preserve evidence/screenshots if the assignment requires it.

## 8. Code Quality & Documentation — 2 marks

**Evidence:** Modular React components/pages/services, separate Express routes/models/middleware, Mongoose validation and indexes, centralized API error handling, environment examples, and this documentation set.

**Attention:** No generated API specification or automated coverage report is currently included. Keep API behavior and these docs synchronized when code changes.

## 9. PoC Demonstration & Viva — 1 mark

**Evidence:** The reproducible sequence in [LIVE_DEMO.md](LIVE_DEMO.md) demonstrates public search, database-backed filtering, role workflows and admin moderation without requiring a destructive reset.

**Attention:** The evaluator must observe the live app on the presentation machine. Confirm MongoDB and both development servers work before the viva; do not assume cached browser pages prove the API is healthy.

## Summary checklist

| Rubric area | Current support | Needs attention before evaluation |
|---|---|---|
| Problem definition / scope | Documented in README | Add student-specific project plan if required |
| React UI | Implemented and buildable | Live responsive verification on evaluator device |
| Express API | Implemented | Manual API checks; no configured automated suite |
| MongoDB | Mongoose models and live API data | Confirm evaluator machine points at intended DB |
| MERN integration | Database-backed search and workflows | Demonstrate a complete write/review flow |
| Functionality | Search, listing management, review, requests | Clearly explain intentionally unsupported features |
| Testing | Manual checks recorded; read-only checks run now | Repeat relevant manual cases and capture evidence |
| Code/docs | Modular structure and docs | Keep docs current; no OpenAPI/coverage report |
| Viva | Demo guide and terms provided | Rehearse and verify live services |
