# ServiceSource Connect — Project TODO

## Phase 1: Database Schema & Migrations
- [x] Define profiles table (military status, location, household, VA eligibility, disability rating)
- [x] Define resource_categories table
- [x] Define resources table (name, description, url, phone, address, state, coverage, tags, verified_level)
- [x] Define lenders table (name, type, states_served, VA specialist, contact info)
- [x] Define lender_branches table
- [x] Define saved_items table
- [x] Define search_logs table
- [x] Define audit_logs table
- [x] Define partner_submissions table
- [x] Push migrations with pnpm db:push

## Phase 2: Backend API Routers
- [x] Profile router (get/update intake profile)
- [x] Resources router (list with filters, get by id, full-text search)
- [x] Lenders router (list with filters, get by id)
- [x] Saved items router (add, list, remove)
- [x] Admin router (CRUD resources/lenders, set verified level, audit logs)
- [x] Partner submissions router (submit, list, approve/reject)
- [x] Seed data: 74+ resources across all 50 states and 12 categories
- [x] Seed data: 30 lenders across all 50 states
- [x] Rate limiting on search endpoints
- [x] Audit logging for admin actions

## Phase 3: Frontend — Layout & Landing
- [x] Global color theme and typography (military navy/gold palette)
- [x] Top navigation with auth state and mobile menu
- [x] Landing page with hero, features, CTA
- [x] About/FAQ page
- [x] Privacy and Terms page
- [x] Footer with crisis banner and navigation
- [x] Sign in / Create account flow

## Phase 4: Frontend — Intake & Dashboard
- [x] Intake form: military status, zip/state, household size, dependents, VA eligibility, disability rating
- [x] Needs selection step (category multi-select)
- [x] Dashboard with category tiles and top options per category
- [x] Edit profile action from dashboard

## Phase 5: Frontend — Resource & Lender Pages
- [x] Category results page with filter chips (state, tags, verified level, coverage)
- [x] Resource detail page (contact info, save button, disclaimer)
- [x] Lender results page with filters (state, type, VA specialist)
- [x] Lender detail page (branches, contact, save button)

## Phase 6: Frontend — Saved Items, Crisis Flow, Admin
- [x] Saved items page (grouped sections, remove, export CSV)
- [x] Crisis safety flow (immediate hotlines, safety steps, emergency routing)
- [x] Admin dashboard
- [x] Admin resources manager (create, edit, verify)
- [x] Admin lenders manager (create, edit, verify)
- [x] Admin audit log viewer
- [x] Admin partner submissions review (approve/reject)
- [x] Partner submission form (public)

## Phase 7: Polish & Tests
- [x] Disclaimer banners on all results pages
- [x] Veterans Crisis Line in NavBar, Footer, and Crisis page
- [x] Responsive design (mobile-first)
- [x] 22 vitest unit tests for all key routers
- [x] TypeScript: zero errors
- [x] All 50 states covered in resources and lenders

## Enhancement Round 2
- [x] Expand seed data: 5–10 resources per state across all 50 states and all 12 categories
- [x] AI resource matching assistant: backend LLM router with profile context
- [x] AI resource matching assistant: frontend chat UI page and NavBar link
- [x] Owner notifications: fire notifyOwner when new partner submission is received
- [x] Update vitest tests for new features (28 total, all passing)

## Enhancement Round 3
- [x] Resource ratings & reviews: schema (resource_reviews table), migration
- [x] Resource ratings & reviews: backend router (submit, list, average)
- [x] Resource ratings & reviews: frontend star rating UI on ResourceDetail page
- [x] Resource ratings & reviews: show average rating + count on CategoryResults cards
- [x] Interactive Resource Map: MapView page with Google Maps integration
- [x] Interactive Resource Map: NavBar link and route
- [x] Interactive Resource Map: markers with resource info popups, filter by category/state
- [x] Weekly email digest: schema (digest_preferences table), migration
- [x] Weekly email digest: opt-in toggle on user settings/profile page
- [x] Weekly email digest: backend endpoint to generate and send digest
- [x] Tests for all new features (40 total, all passing)

## Enhancement Round 4
- [x] Share Resource button: ShareResource component with copy link, SMS, email
- [x] Share Resource button: integrated into ResourceDetail page

## Enhancement Round 5
- [x] Nearby Resources: backend getNearbyResources query (zip/state match + category filter)
- [x] Nearby Resources: NearbyResources widget component
- [x] Nearby Resources: integrated into Dashboard page

## Enhancement Round 6
- [x] Recently Viewed: recently_viewed table in schema, migration
- [x] Recently Viewed: backend router (track view, list last 5)
- [x] Recently Viewed: RecentlyViewed widget component
- [x] Recently Viewed: track on ResourceDetail page load
- [x] Recently Viewed: widget integrated into Dashboard

## Enhancement Round 7 — Subscription Tiers
- [x] Stripe products.ts with 3 tiers defined
- [x] Subscription schema: stripe_customer_id, stripe_subscription_id on users table
- [x] Backend: createCheckoutSession, getSubscriptionStatus, webhook handler
- [x] Pricing page with Free Trial / Monthly / Yearly cards
- [x] Checkout redirect flow (Stripe Checkout + billing portal)
- [x] Subscription management page (view plan, cancel, upgrade)
- [x] Tests for subscription router (57 total, all passing)

## Enhancement Round 8 — Security & Auth
- [x] Stripe package installed, subscription router wired
- [x] Stripe webhook handler at /api/stripe/webhook
- [x] Pricing section on landing page (3 tier cards)
- [x] Pricing link in NavBar, Subscription link in user dropdown
- [ ] VPN/proxy detection middleware on protected routes
- [ ] IP-based trial tracking to prevent VPN bypass of free trial
- [ ] Google OAuth login support

## Enhancement Round 9 — Content Accuracy
- [x] Fix yearly tier feature list to only show actually-built features

## Enhancement Round 10 — Automated Error Recovery System
- [x] Server: safe query wrapper that guarantees null (never undefined) from all db helpers
- [x] Server: tRPC errorFormatter with structured logging for all procedure errors
- [x] Client: QueryClient configured with smart retry, stale-while-revalidate, and null fallback
- [x] Client: global tRPC error interceptor that silently retries transient failures
- [x] Client: self-healing ErrorBoundary with auto-retry and graceful degradation per component
- [x] Client: per-query null-safe data accessor hook (useSafeQuery) to prevent undefined crashes

## Enhancement Round 13 — Landing Page Banner & Branch Filter
- [x] Add veteran/active military support banner at the top of the landing page
- [x] Add militaryBranch field to resources schema (Army, Navy, Air Force, Marines, Coast Guard, Space Force, All Branches)
- [x] Update seed data to tag resources with applicable military branches
- [x] Update resources router to accept branch filter parameter
- [x] Add branch filter chips/dropdown to CategoryResults page
- [x] Add branch filter to ResourceMap page

## Bug Fixes Round 14
- [x] Fix Resource Map link (broken navigation - empty string Select.Item value)
- [x] Remove "no credit card required" text from Free Trial pricing card
- [x] Expand VA lenders to all 50 states (now 42 lenders)
- [x] Attach bank website links to VA lender cards (Visit Website button)

## Enhancement Round 15 — Comprehensive VA Lenders
- [x] Add all VA-approved lenders nationwide — 808 lenders imported from official VA FY2026 lender loan volume report

## Enhancement Round 16 — Auto-Deploy CI/CD
- [ ] Configure GitHub Actions to auto-push and trigger Railway deploy on every commit to main
- [ ] Ensure Railway is connected to GitHub repo for automatic deployments

## Enhancement Round 17 — Automatic Content Updates
- [ ] Scheduled GitHub Actions job to pull fresh VA lender data monthly from VA.gov
- [ ] Scheduled GitHub Actions job to sync VA resources/benefits data weekly
- [ ] Server-side content refresh endpoint for on-demand admin updates
- [ ] Real-time UI updates using React Query auto-refetch (no page reload needed)

## Critical — Remove All Manus Internal References
- [ ] Remove Manus OAuth (VITE_OAUTH_PORTAL_URL, OAUTH_SERVER_URL, VITE_APP_ID) — replace with JWT-based auth
- [ ] Remove BUILT_IN_FORGE_API_KEY, BUILT_IN_FORGE_API_URL, VITE_FRONTEND_FORGE_API references
- [ ] Remove OWNER_OPEN_ID, OWNER_NAME Manus-specific env vars
- [ ] Remove Manus notification helper (notifyOwner)
- [ ] Remove manus.im references from const.ts and any login URL builders
- [ ] Remove VITE_ANALYTICS_ENDPOINT, VITE_ANALYTICS_WEBSITE_ID (Manus analytics)
- [ ] Clean server/_core/oauth.ts to remove Manus OAuth dependency
- [ ] Update GitHub Actions deploy workflow to use Railway token only

## Enhancement Round 18 — Independent Services Setup
- [ ] Create Cloudflare R2 bucket for file storage
- [ ] Create Google Maps API key via Google Cloud
- [ ] Create SendGrid account and API key
- [ ] Wire all credentials into Railway environment variables
