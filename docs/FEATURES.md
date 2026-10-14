# Rentora — implemented features & roadmap

## Implemented (Phase 1–7 foundation)

- Monorepo with pnpm workspaces
- PostgreSQL schema + versioned Prisma migration SQL
- NestJS API with Swagger, validation, rate limiting, structured responses
- Auth: register, login, logout, refresh cookie, email verification (dev log), forgot/reset password
- RBAC guards for tenant, owner, admin
- Property CRUD, publish/unpublish/mark rented, soft delete
- Server-side property search, filters, sorting, pagination
- Signed S3 upload URLs + image confirm/reorder/delete
- Favourites, enquiries, visit requests, in-app notifications
- Admin dashboard stats, user status, listing moderation, audit logs
- Next.js marketing home, browse, property details (SEO metadata + JSON-LD)
- Tenant/owner dashboard entry points, favourites UI
- Docker Compose template, CI workflow
- Backend unit tests (auth + ownership)

## Known limitations

- Email/SMS notifications are in-app only (provider hooks ready via `Notification` records)
- Map view not yet integrated (approximate coordinates stored)
- Multi-step owner listing wizard UI is routed but not fully built
- Property comparison page is linked but not fully implemented
- Docker image pulls may be blocked in some environments — use local PostgreSQL instead
- Redis is wired but not yet used for caching/rate-limit storage
- E2E test suite not yet added

## Recommended next enhancements

- Complete owner 7-step listing wizard with React Hook Form + step persistence
- Map search (Mapbox/Leaflet) synced with filters
- TanStack Query mutations for owner tables and admin moderation
- Playwright E2E for core journeys in the spec
- Email provider integration for verification and password reset
- View deduplication via Redis or session fingerprint
- Report listing/user flows on frontend
