# EstateSphere Live Demo and Viva Guide

This sequence is designed for a beginner presenting the project from VS Code on Windows. It avoids data resets and does not require provisioning an administrator during the presentation.

## Before the professor arrives

1. Open the EstateSphere folder (not another project) in VS Code.
2. Confirm private environment files exist locally:
   - `server/.env` has a valid MongoDB connection and private JWT secret.
   - `client/.env` points to the API (normally `http://localhost:5000/api`).
   - Never display or share these file contents.
3. Confirm MongoDB is running and accessible.
4. Check ports before starting anything:

   ```powershell
   Get-NetTCPConnection -LocalPort 5000,5173 -State Listen -ErrorAction SilentlyContinue |
     Select-Object LocalPort, OwningProcess
   ```

   Inspect any listener before starting a process:

   ```powershell
   Get-CimInstance Win32_Process -Filter "ProcessId=<PID>" |
     Select-Object ProcessId, Name, CommandLine
   ```

   If a known EstateSphere server or Vite process is already listening, use it. Do not start a duplicate. If a port belongs to another application, do not stop it; resolve the port conflict first.

5. If services are not running, open two VS Code terminals at the project root:

   **Terminal 1 — backend**

   ```powershell
   npm run dev --prefix server
   ```

   Wait for MongoDB connection and API listening messages.

   **Terminal 2 — frontend**

   ```powershell
   npm run dev --prefix client
   ```

   Use the URL Vite prints, normally [http://localhost:5173](http://localhost:5173/).

6. In a third terminal, verify the API before opening the demo:

   ```powershell
   Invoke-RestMethod http://localhost:5000/api/health
   $p = Invoke-RestMethod http://localhost:5000/api/properties
   "Properties returned: $($p.count)"
   ```

   The documented environment returned 228 property records when last checked. Counts can differ if real test/user listings are added.

## Presentation sequence (about 6–8 minutes)

### 1. Problem and design (45 seconds)

Explain that accommodation, rental and sale discovery are fragmented. EstateSphere is a PoC that organizes nationwide categories and roles, not a production broker or payment platform.

Show the homepage. Point out the preserved compact search: State/Union Territory, monthly budget, and Search Properties. There is no default Pune selection.

### 2. Navigation (45 seconds)

Open each of the five menus: Accommodation, Rental Properties, Buy & Sell, Our Services, and My EstateSphere. Show second-level categories and a third-level destination. Explain that all 125 entries have routes, while informational pages are guidance and links—not 125 separate backend systems.

### 3. Search and database-backed results (1–2 minutes)

1. Select a State and monthly budget on the homepage.
2. Click Search Properties and point out preserved query parameters.
3. Change a detailed filter on the result page (State → City → Locality, property type or budget).
4. Open a property detail and explain that fictional demo data is visibly labelled and images are illustrative.
5. Optionally open a category page to show nationwide results and the empty state behavior.

### 4. Authentication and role workflow (1–2 minutes)

Use an authorized preconfigured non-admin account if one is available and appropriate for presentation:

- **Tenant:** show My Enquiries & Visits. Do not submit a request to a demo listing; demo requests are disabled.
- **Owner/PG operator:** show own listing status and management workspace. Do not modify a real project listing during a live presentation.
- **Administrator:** show review dashboard only if an administrator account has already been securely configured and access is authorized. Do not display credentials or provision one in front of the professor.

If no suitable account is configured, explain the workflow from the code/UI and use the protected-route behavior without inventing credentials.

### 5. Explain the approval workflow (45 seconds)

An owner/operator submission starts Pending. The administrator reviews and approves or rejects it. Only an approved, active, non-demo user listing enters public results. A material owner edit returns an approved listing to Pending. Demo records are separate and do not enter this review workflow.

### 6. Viva technical explanation (1–2 minutes)

Use these short definitions, then connect them to the live property search:

- **React:** a JavaScript UI library. EstateSphere composes pages from reusable components such as `PropertyCard` and updates the UI when API data changes.
- **Node.js:** the JavaScript runtime used to run the backend outside the browser.
- **Express:** the Node.js web framework that maps HTTP methods/paths to API handlers and middleware.
- **MongoDB:** the document database storing users, listings and property requests.
- **Mongoose:** the Node.js object-document mapper that defines schemas, validation and queries for MongoDB.
- **REST API:** HTTP endpoints organized around resources and methods. For example, `GET /api/properties` reads public listing data and `POST /api/owner/properties` creates a pending owner listing.
- **JWT:** a signed token that represents an authenticated session. EstateSphere sends it in an HttpOnly cookie; the browser JavaScript cannot read that cookie.
- **CRUD:** Create, Read, Update and Delete. EstateSphere supports owner-scoped property create/read/update and a soft deactivation endpoint rather than permanently deleting a property document.
- **Property approval workflow:** an owner/operator listing starts Pending; an administrator can approve or reject it with review metadata. Public API results include user listings only when approved and available; a material owner edit returns it to Pending.

**Connect the stack:** React fetches the Express endpoint; Express validates and authorizes the request, Mongoose queries MongoDB, the API returns JSON, and React renders the resulting property cards. No property results are hardcoded in the React app.

Password hashes are stored, and the session JWT is held in an HttpOnly cookie; never reveal the cookie, JWT secret, passwords, or `.env`.

## Safe shutdown

When finished, stop only terminals you personally started with **Ctrl+C**. Do not kill processes by broad process-name commands. Do not run the seed script, delete records, or reset MongoDB after the demo.

## If something fails during presentation

- **Port occupied:** inspect the process and reuse the existing EstateSphere service if healthy. Do not start a second server on 5000 or a second Vite server on 5173.
- **API unavailable:** check `GET /api/health`, then inspect the backend terminal for MongoDB connection errors.
- **Location/API error:** verify the frontend API URL and backend CORS origin match `localhost` or `127.0.0.1` exactly.
- **Database empty or incorrect:** stop; do not reseed or reset in front of the evaluator. Confirm the configured MongoDB database name before proceeding.
- **Admin unavailable:** state the limitation honestly; do not invent credentials or expose secrets.
