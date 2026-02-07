# Employee Wizard

Role-based employee management app with a multi-step creation flow. Built with React, TypeScript, and CSS Modules.

## Tech Stack

- **React 19** + TypeScript
- **React Router v7**
- **Forms:** Custom `useFormState` hook + Zod validation
- **Styling:** CSS Modules
- **Build:** Vite 7
- **Mock API:** json-server (two instances)
- **Tests:** Jest + React Testing Library

## Prerequisites

- Node.js 18+ (or Bun)

## Quick Start

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start mock APIs** (in a separate terminal, or run both with one command)
   ```bash
   npm run api:all
   ```
   Or run separately:
   - `npm run api:step1` → http://localhost:4001
   - `npm run api:step2` → http://localhost:4002

3. **Start the app**
   ```bash
   npm run dev
   ```
   Open http://localhost:5173

4. **Optional:** Copy `.env.example` to `.env` and set `VITE_API_STEP1_URL` / `VITE_API_STEP2_URL` if your APIs run on different hosts.

## Routes

| Path | Description |
|------|-------------|
| `/` | Redirects to `/employees` |
| `/employees` | Employee list (merged from both APIs), pagination, role toggle (Admin/Ops) |
| `/creation?role=admin` | Admin flow: Step 1 (Basic Info) → Step 2 (Details) |
| `/creation?role=ops` | Ops flow: Step 2 only (manual Employee ID) |
| `/creation?role=ops&employeeId=<id>` | Ops “Fill details” for an existing employee |

## Features

- **Admin:** Full 2-step flow (Basic Info → Details). Auto-generated Employee ID from department. Draft auto-save per step (2s debounce).
- **Ops:** Step 2 only. Can create new (manual Employee ID) or fill details for an existing employee via “Fill details” on the list.
- **Employee list:** Data merged from both APIs by `employeeId`. Pagination (10 per page). “+ Add Employee” (Admin only). “Fill details” for rows missing details.
- **Components:** Async Autocomplete (departments/locations), FileUpload (image + Base64), ProgressBar (submission), Popover (notes).

## Project Structure

```
src/
├── components/       # Button, Input, Select, Autocomplete, FileUpload, ProgressBar, Popover
├── config/           # env.ts (API base URLs)
├── features/
│   ├── creation/     # CreationLayout, StepBasicInfo, StepDetails
│   └── employees/    # EmployeeList, EmployeeTable
├── hooks/            # useDebounce, useDraftPersistence, useFormState
├── services/         # api.ts, basicInfoService, detailsService
├── types/            # Role, BasicInfo, Details, Employee, etc.
├── utils/            # fileToBase64, generateEmployeeId
└── styles/           # reset.css, variables.css
```

## Scripts

| Command | Description |
|--------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | TypeScript check + production build |
| `npm run preview` | Preview production build |
| `npm run api:step1` | json-server on port 4001 (db-step1.json) |
| `npm run api:step2` | json-server on port 4002 (db-step2.json) |
| `npm run api:all` | Both APIs via concurrently |
| `npm test` | Run Jest tests |
| `npm run test:watch` | Jest watch mode |

## API (json-server)

**Step 1 (4001):** `departments`, `basicInfo` — search: `?name_like=...`  
**Step 2 (4002):** `locations`, `details` — search: `?name_like=...`, filter by `employeeId` for “Fill details”.

## Testing

- **Autocomplete:** rendering, API calls, keyboard navigation
- **Submit flow:** sequential POSTs, progress states, error handling

