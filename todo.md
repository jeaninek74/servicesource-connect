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
