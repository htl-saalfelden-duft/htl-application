# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

School-admission ("Schüleraufnahme") web app for HTL Saalfelden. Applicants register, confirm their email, and fill in personal details, contacts (parents/guardians), school-class preferences and grades. Administration staff review applicants, set statuses, and export CSVs for the school systems (Sokrates, BTS). UI text, domain terms and TODO.md are in German.

- `backend/` — NestJS 10 + Prisma 6 on **MongoDB** (replica set required by Prisma)
- `frontend/` — Create React App (React 18, TypeScript, react-bootstrap, react-hook-form, axios)
- `info/` — domain reference material (admission process, ER model, Sokrates/BTS import templates)

## Development commands

Development runs in Docker. Setup needs `backend/.env` (template: `backend/_env`), a root `.env` (template: `_env`), and `rsa_public.pem` / `rsa_private.pem` in the repo root (mounted as compose secrets for JWT RS256 signing).

```sh
docker compose up --build -V        # backend (:3000, watch mode), mongo (:27017), mongo-express (:8081)
                                    # rebuild with --build -V after adding an npm package
```

Backend helper scripts (run from `backend/`; they `docker compose exec` into the running backend container):

```sh
npm run db:prisma:g    # regenerate Prisma client after editing prisma/schema.prisma
npm run db:push        # push schema to MongoDB (no migrations — Mongo uses `prisma db push`)
npm run db:seed        # run prisma/seed.ts (lookup tables etc.)
npm run nest:g -- mo <name>   # nest generate inside the container
npm run lint           # eslint --fix
npm run test           # jest, *.spec.ts under src/ (none exist yet)
npx jest path/to/file.spec.ts # single test
npm run test:e2e       # test/jest-e2e.json
```

Frontend (from `frontend/`, runs outside Docker in dev on port 4200, API at `REACT_APP_API_URL` = `http://localhost:3000/api`):

```sh
npm start
npm run build
npm test
```

Production: `docker compose -f docker-compose-prod.yml up -V --build` (frontend served by nginx with SSL certs from `frontend/ssl/`; `BACKEND_API_URL` substituted into the nginx template at container start). See DEPLOY.md and README.md (incl. manual Mongo replica-set init).

## Architecture

### Backend
- All routes are prefixed with `/api` (`main.ts`). One Nest module per resource under `src/<resource>/` (controller + service), each service using `PrismaService` directly.
- **Auth is global**: `JwtAuthGuard` is registered as `APP_GUARD` in `auth.module.ts`, so every endpoint requires a Bearer token unless decorated with `@Public()`. Tokens are RS256, keys read from `RSA_PRIVATE_KEY_FILE` / `RSA_PUBLIC_KEY_FILE`.
- There are two separate principal types sharing the same JWT mechanism: `Applicant` and `User` (administration staff). The payload is `{ id, userType }` where `userType` is `'applicant' | 'administration'`. `User.userRoleKey` distinguishes admins from regular staff.
- `EmailConfirmationGuard` additionally blocks applicants whose email isn't confirmed. Confirmation mails and the application confirmation are sent via `@nestjs-modules/mailer` with Handlebars templates in `src/templates/`.
- Errors go through `ApiError` / `ApiErrorType` in `src/common/api-error.ts`, which maps error types (and Prisma errors) to HTTP status + message.
- CSV exports (`/api/applicant/sokratesCsv`, `/api/applicant/btsCsv`) are written to disk with `common/csv.helper.ts` / `storage.helper.ts` and then streamed back; the BTS column layout is in `backend/models/bts-csv.model.ts`.

### Data model (`backend/prisma/schema.prisma`)
- `Applicant` embeds `details` (`ApplicantDetails`), `contacts` and `schoolReport` as Mongo composite types; `Application` (applicant ↔ `SchoolClass` with a priority) is a separate collection.
- Lookup collections (`Country`, `Language`, `Religion`, `Sex`, `Title`, `ContactType`, `ApplicationStatus`, `ApplicantStatus`, `SchoolReportGroup`, `UserRole`) are seeded and referenced **by string value** (title or `key`), not by ObjectId relation — e.g. `Applicant.statusKey`, `details.nationality`.
- Every model has a `schema Int @default(1)` version field.

### Frontend
- Routing in `App.tsx`: applicant area (`/home`) vs. administration area (`/applicants`, `/applicant`, admin-only `/users`), guarded by `ProtectedRoute` using `userType`/`isAdmin` from `contexts/auth.context.tsx`.
- Generic REST access via `services/api.service.ts`: model classes in `src/models/` are tagged with `@Entity('name')` and `Entity.getRoute()` converts the name to the kebab-case API route. Axios interceptors (`services/configs/`) attach the token and convert date strings to `Date`.
- The applicant form is tab-based (`contexts/tabs.context.tsx`, `contexts/contact.context.tsx`); form field components live in `components/form/{details,contact,schoolReport}/`. The confirmation PDF is generated client-side with `@react-pdf/renderer` (`components/pdf/`).
- `frontend/build/` is committed.
