# EstateSphere

**EstateSphere – Integrated Property, Rental & Accommodation Portal** is a MERN-stack proof of concept for discovering accommodation, rental homes, and sale properties across India. It brings public property search, role-based listing management, administrator review, and tenant requests into one responsive React application.

> **Academic demonstration notice:** the database currently contains 228 fictional demonstration listings. They are marked in the UI and are not verified real properties, offers, or places available for visits.

## Problem statement

People looking for student accommodation, paying guest (PG) stays, shared flats, and rental or sale homes often have to compare fragmented information across separate sources. EstateSphere demonstrates how a single portal can organize these property categories, location filters, and role-based workflows. This is a college PoC, not a production brokerage or transaction platform.

## Objectives

- Provide a public, nationwide property and accommodation search experience.
- Support State → City → Locality filters and rent, PG/stay, and sale search modes.
- Let tenants, owners, PG operators, and administrators use role-appropriate workflows.
- Demonstrate a React → Express REST API → MongoDB data flow.
- Keep fictional sample listings clearly distinguished from user-submitted listings.

## Target users

- **Tenants:** browse public listings and submit enquiries or visit requests for eligible, approved user listings.
- **Owners:** create, update, and deactivate their own property listings; review feedback and requests.
- **PG operators:** manage their own PG/shared-accommodation listings and relevant requests.
- **Administrators:** review pending user listings and approve or reject them with a reason.
- **Evaluators and students:** inspect a working MERN PoC and its documented limitations.

## Scope and implementation status

Implemented: public search and property details; six rental/accommodation categories; sale search support; nationwide location catalog; authentication and four roles; owner/PG-operator listing management; administrator approval/rejection; tenant enquiries and visit requests; responsive navigation and informational destination pages.

Not implemented: payments, confirmed bookings, email/SMS notifications, live chat, saved-property lists, saved searches, property transactions, listing verification, or a full account-profile editing workflow. A visit request is not a booking or confirmation. No administrator account can be created through public registration.

Some navigation destinations are informational pages with guidance and links to existing functionality; they do not represent separate backend services. See [Navigation structure](#navigation-structure).

## Technology stack

| Layer | Technologies |
|---|---|
| Frontend | React 18, React Router, Vite 6, CSS |
| Backend | Node.js, Express 4 |
| Database | MongoDB, Mongoose |
| Authentication | bcrypt password hashing, JWT in an HttpOnly cookie |
| Uploads | Multer; property image files stored under `server/uploads/` |

## Architecture

```text
Browser
  React pages/components + React Router
       │ HTTP/JSON requests (credentials for protected requests)
       ▼
  Express API: server/src/app.js
       │ routes → validation / authorization → Mongoose
       ▼
  MongoDB: User, Property, PropertyRequest
       │ JSON response
       └──────────────────────────────► React updates page state
```

The frontend API clients are in `client/src/services/`. The API base URL is `VITE_API_BASE_URL`, defaulting to `http://localhost:5000/api`. The server loads `server/.env` from the backend working directory and connects through `server/src/config/db.js`.

## Implemented features

- Five hierarchical navigation menus, each with five categories and five destinations (5 × 5 × 5). Destination pages use `/explore/:destinationId`; category-specific informational guidance is provided by `client/src/data/navigationDestinations.js`. Relevant actions link to actual listing, registration, login, workspace, or contact routes. Informational pages do not claim unsupported services exist.
- Compact homepage search with exactly State/Union Territory, monthly budget, and Search Properties controls. It does not choose a default city.
- Search results with location, transaction, property category/type, and price filters. Rent/accommodation budgets use `monthlyRent`; sale budgets use `askingPrice`.
- Six nationwide accommodation/rental categories, listing details, demonstration notices, and image fallbacks.
- Registration and sign-in for tenant, owner, and PG-operator roles; role-protected workspaces; administrator role is provisioned separately.
- Owner/PG operator listing create, read, update, and deactivate operations. New or materially edited listings enter Pending review.
- Administrator review counts, submitted listing details, approval, rejection with a required reason, and review history.
- Tenant enquiry and visit-request submission for eligible listings; owner/PG operator responses and visit decisions; request history and ownership checks.
- Fictional demo property records served through the API. The seed script is idempotent and uses insert-only behavior for its demo records; **do not run it as part of routine startup**.

## Express REST API

The base URL is `http://localhost:5000/api`. Successful resource responses use JSON with `success: true` and a `data` value; list endpoints may also return `count` and filter metadata. Protected routes use the `estateSphereToken` HttpOnly cookie established by login/registration. The browser sends the cookie; do not copy JWTs into source code or documentation.

| Method and path | Access | Purpose |
|---|---|---|
| `GET /health` | Public | API health status |
| `GET /locations` | Public | India State/UT → City → curated Locality catalog |
| `GET /properties` | Public | Search approved/active user listings and available demo listings; supports category/categories, rent/sale, State/City/Locality, property type and price filters |
| `GET /properties/:id` | Public | Read one publicly visible property |
| `POST /auth/register` | Public; tenant, owner, or PG operator only | Create a public account and session |
| `POST /auth/login` | Public, rate-limited | Authenticate and set session cookie |
| `GET /auth/me` | Authenticated | Read current account |
| `POST /auth/logout` | Public | Clear the browser session cookie |
| `GET /auth/workspace/:role` | Authenticated matching role | Read role workspace identity |
| `GET /owner/properties` | Owner or PG operator | List only the caller's own non-demo properties |
| `GET /owner/properties/:id` | Owner or PG operator; own listing | Read one owned listing |
| `POST /owner/properties` | Owner or PG operator | Create a Pending listing and upload images (`multipart/form-data`) |
| `PATCH /owner/properties/:id` | Owner or PG operator; own listing | Edit listing; it returns to Pending review |
| `DELETE /owner/properties/:id` | Owner or PG operator; own listing | Soft-deactivate listing (no database document deletion) |
| `GET /admin/properties/summary` | Administrator | Count user listings by review status |
| `GET /admin/properties?status=...` | Administrator | List user submissions; status supports pending, approved, rejected, or all |
| `GET /admin/properties/:id` | Administrator | Read submitted listing and review history |
| `POST /admin/properties/:id/approve` | Administrator | Approve a pending user listing |
| `POST /admin/properties/:id/reject` | Administrator | Reject a pending listing with a required reason |
| `GET /requests/mine` | Tenant | Read the caller's enquiry/visit requests |
| `GET /requests/received` | Owner or PG operator | Read requests for the caller's listings |
| `POST /requests/:propertyId/enquiries` | Tenant; eligible approved listing | Create an enquiry; requires a valid `Idempotency-Key` UUID header |
| `POST /requests/:propertyId/visits` | Tenant; eligible approved listing | Create a visit request; requires a valid `Idempotency-Key` UUID header |
| `PATCH /requests/:requestId/respond` | Relevant listing owner/operator | Respond to a submitted enquiry |
| `PATCH /requests/:requestId/visit-decision` | Relevant listing owner/operator | Accept/decline a submitted visit request; decline requires a reason |

`GET /properties` accepts `transactionType=rent|sale`, `category` or comma-separated `categories`, `state`, `city`, `locality`, `propertyType`, `propertyTypeContains`, `propertyTypeExcludes`, `minBudget`, `maxBudget`, and `sort=recent`. Price ranges use `monthlyRent` for rent and `askingPrice` for sale. The backend validates hierarchical location choices against the catalog and will not substitute listings from another location.

### Middleware and authorization

- `server/src/app.js` configures CORS with credentials, JSON parsing, cookie parsing, static uploads, and route mounting.
- `server/src/middleware/authMiddleware.js` verifies the JWT cookie and resolves the user from MongoDB; `requireRole` applies role authorization.
- `server/src/middleware/errorHandler.js` maps validation, upload, duplicate, request and internal errors to JSON responses.
- Authentication routes rate-limit registration/login. Administrator and owner/request routers enforce authorization on the backend, not only in React.

### MongoDB schemas and supported CRUD

- **User** (`server/src/models/User.js`): full name, normalized unique email, hidden password hash, optional phone and role. Password hashes are excluded from normal selections.
- **Property** (`server/src/models/Property.js`): title/description, category/type, structured location, rent/deposit or sale asking price, amenities/images, availability, demo marker, owner, listing status and administrator review metadata/history.
- **PropertyRequest** (`server/src/models/PropertyRequest.js`): enquiry or visit, property/tenant/owner references, status, message/response, preferred date/time, idempotency keys and status history.

Property CRUD is intentionally scoped to the authenticated owner/operator: create (`POST`), read (`GET`), update (`PATCH`), and deactivate (`DELETE` implemented as a soft status change). Administrator review updates status through explicit approve/reject transitions. Tenant requests support create/read, and owners can respond/decide; request deletion is not implemented. Account routes provide registration/login/current-user/logout, not general account CRUD.

## Project structure

```text
EstateSphere/
├── README.md
├── docs/
│   ├── LIVE_DEMO.md
│   ├── RUBRIC_COMPLIANCE.md
│   └── TESTING.md
├── client/
│   ├── public/                 # Static frontend assets
│   └── src/
│       ├── components/         # Header, hero, filters, cards, route guards
│       ├── context/            # AuthContext
│       ├── data/               # Navigation, categories, search configuration
│       ├── pages/              # Search, details, auth, role workspaces
│       ├── services/           # HTTP API clients
│       └── utils/
└── server/
    ├── src/
    │   ├── config/             # MongoDB connection
    │   ├── data/               # India locations and demo source data
    │   ├── middleware/         # Authentication and error handling
    │   ├── models/             # Mongoose schemas
    │   ├── routes/             # Express REST endpoints
    │   └── scripts/            # Explicit seed/provision/migration tools
    └── uploads/                # Runtime property images (ignored by Git)
```

## Local setup (Windows / VS Code PowerShell)

### Prerequisites

- Node.js and npm installed.
- MongoDB running locally, or a MongoDB connection string you are authorized to use.
- Dependencies installed separately in `client` and `server`.

Open the EstateSphere folder in VS Code. Use three integrated terminals: one for MongoDB checks (if needed), one for the API, and one for Vite.

### 1. Install dependencies

From the project root:

```powershell
npm install --prefix server
npm install --prefix client
```

### 2. Configure the backend environment

From the project root:

```powershell
Copy-Item server\.env.example server\.env
```

Edit `server\.env` locally. Set `MONGODB_URI` to the intended database and replace the example `JWT_SECRET` with a private random value of at least 32 characters. Keep `.env` files private and never paste their values into source control, screenshots, or reports. `PORT` defaults to 5000 and `CLIENT_ORIGIN` should include the frontend origin, normally `http://localhost:5173,http://127.0.0.1:5173`.

For a local MongoDB installation, check whether its Windows service is running:

```powershell
Get-Service MongoDB
```

If MongoDB is installed as a service but stopped, start it from an elevated PowerShell only if you have permission:

```powershell
Start-Service MongoDB
```

Do not reset, drop, or reseed a database containing project data.

### 3. Configure the frontend API URL

From the project root:

```powershell
Copy-Item client\.env.example client\.env
```

The example value points to `http://localhost:5000/api`. Keep it aligned with the backend `PORT` and use the exact frontend origin allowed by `CLIENT_ORIGIN`.

### 4. Start the backend

In the first VS Code terminal, from the project root:

```powershell
npm run dev --prefix server
```

Expected startup messages include a successful MongoDB connection and `EstateSphere API listening on http://localhost:5000`.

### 5. Start the frontend

In a second VS Code terminal, from the project root:

```powershell
npm run dev --prefix client
```

Open the local URL printed by Vite (normally [http://localhost:5173](http://localhost:5173/)).

### 6. Check service and data access

In another PowerShell terminal:

```powershell
Invoke-RestMethod http://localhost:5000/api/health
$properties = Invoke-RestMethod http://localhost:5000/api/properties
$properties.count
```

The health endpoint should report `status: ok`. This project workspace was checked on 2026-10-27: `/api/properties` returned 228 records. Counts can change if legitimate user listings are added; do not expect an exact count on another database.

### Avoid duplicate processes

Before starting another API or Vite instance, inspect the ports:

```powershell
Get-NetTCPConnection -LocalPort 5000,5173 -State Listen -ErrorAction SilentlyContinue |
  Select-Object LocalPort, OwningProcess
```

If a port is already in use, inspect its process before taking action:

```powershell
Get-CimInstance Win32_Process -Filter "ProcessId=<PID>" |
  Select-Object ProcessId, Name, CommandLine
```

An existing EstateSphere backend may already be healthy. Do not start a second backend on port 5000. Stop only a verified, specifically identified process that you own and intend to stop.

## Build and backend checks

```powershell
npm run build --prefix client
Set-Location server
node --check src\index.js
node --check src\app.js
Get-ChildItem src\routes\*.js,src\models\*.js | ForEach-Object { node --check $_.FullName }
```

There is no configured automated unit-test script in the current client or server `package.json`; see [Testing](docs/TESTING.md) for executable manual checks and status.

## Data safety and administrator setup

- `server/.env` is ignored by Git. Never reveal its contents.
- Public registration supports tenant, owner, and PG operator only.
- Administrator provisioning uses the existing `server/src/scripts/provisionAdmin.js` mechanism and requires explicit `CONFIRM_ADMIN_PROVISIONING=YES` plus configured identity and password values in the private environment. It updates/upserts the configured account; do not run it casually.
- `npm run seed --prefix server` is not part of startup. It is not required for the currently populated database; do not run it during evaluation unless intentionally setting up a separate empty test database.

## Further evaluation documents

- [Rubric compliance and evidence](docs/RUBRIC_COMPLIANCE.md)
- [Reproducible test cases and test status](docs/TESTING.md)
- [Live professor demonstration sequence](docs/LIVE_DEMO.md)
