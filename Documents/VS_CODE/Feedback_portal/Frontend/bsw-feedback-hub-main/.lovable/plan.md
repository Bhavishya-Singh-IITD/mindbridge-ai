# BSW Feedback Portal — Build Plan (TanStack Start)

Framework: TanStack Start (React 19 + Vite) — file-based routing in `src/routes/`. Tailwind v4, lucide-react, framer-motion, shadcn primitives. All data is mock (React Context + in-memory arrays); no backend.

## Design system (src/styles.css + __root.tsx)

- Force dark mode: add `class="dark"` to `<html>` in `RootShell`.
- Load **Inter** via `<link>` in root `head()`; set `--font-sans` in `@theme`.
- Override tokens in `.dark`:
  - `--background: #121826`
  - `--card: #1e293b`, `--popover: #1e293b`
  - `--primary: #1a936f`, `--primary-foreground: #ffffff`
  - `--border: rgb(51 65 85 / .5)` (slate-700/50)
  - `--foreground: #ffffff`, `--muted-foreground: #d1d5db` (gray-300)
- Cards use `rounded-2xl`/`rounded-3xl`; hover lift via framer-motion (`y: -4`, subtle shadow).

## Global state

- `src/lib/auth-context.tsx` — Context with `isLoggedIn`, `user { name, email, role: 'user'|'admin', userType: 'iitd'|'non-iitd'|'admin', subRole? }`, `login()`, `logout()`, `pendingCategory` (to bounce back to `/submit-feedback` after login).
- `src/lib/feedback-store.tsx` — Context holding a seeded mock feedback array. Exposes `addFeedback`, `getMine`, `getByCategory`. Each entry: `{ id, userName, userEmail, userRole, category, subCategory?, title, description, otherComments, attachments: [{ name, type }], createdAt }`.
- Both providers wrap `<Outlet />` inside `RootComponent` in `__root.tsx`.

## Persistent Navbar

`src/components/Navbar.tsx` rendered in `__root.tsx` above `<Outlet />`:

- Left: teal circular "BSW" logo placeholder + "BSW Feedback Portal".
- Right: logged out → teal `Login` button (Link to `/login`); logged in → shadcn `DropdownMenu` with avatar (lucide `User`) → "My Feedbacks", "Logout".
- Mobile: collapses to hamburger.

## Route files (under `src/routes/`)

1. `**index.tsx**` — Home
  - Hero: "We've got your back — Feedback Portal" + supportive subheading.
  - `CategoryGrid` (7 cards, responsive `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`).
  - "BSW Services" card is expandable: click toggles an inline framer-motion accordion listing Academic Portal, Mental Health Portal, Career Portal, Language Portal. Clicking a sub-item behaves like a category click with sub-category attached.
  - Click handler: logged out → set `pendingCategory` then `navigate('/login')`; logged in → `navigate({ to: '/submit-feedback', search: { category, sub? } })`.
2. `**login.tsx**` — Login
  - Centered card, dark slate, teal "Sign In".
  - Top segmented toggle: "Login as User" | "Login as Admin".
  - User view sub-tabs (shadcn `Tabs`):
    - **IITD Email**: IITD Email ID + Kerberos Password.
    - **Non-IITD Email**: Name, Email, Password, Role select (Student/Parent/Professor/TA/Other).
  - Admin view: visually identical card — Admin Email + Password.
  - Submit: set auth state → admin goes to `/admin`; user with `pendingCategory` → `/submit-feedback?category=...`; else `/`.
3. `**submit-feedback.tsx**` — Submission form
  - Reads `?category=` (and optional `?sub=`) via `Route.useSearch()` with a `validateSearch` for typing; shows selected category as a teal badge at top.
  - Fields: Title, Description (large textarea), `FileDropzone` (drag-and-drop, multi-file, accepts pdf/doc/docx/xls/xlsx/ppt/pptx/images; renders chip list with remove buttons), Other comments (textarea).
  - Submit → `addFeedback(...)` with current user + `new Date()` → `navigate('/success')`.
  - Guard: redirect to `/login` if logged out (with `pendingCategory` set).
4. `**success.tsx**` — Success
  - Centered; framer-motion scale-in animated `CheckCircle2` (teal), large.
  - "Thank you for your valuable feedback, it has been submitted successfully."
  - Teal button "View your submitted feedbacks" → `/my-feedbacks`.
5. `**my-feedbacks.tsx**` — User dashboard
  - Guarded (redirect to `/login` if logged out).
  - Chronological feed of `getMine()` (latest first).
  - `FeedbackCard variant="user"`: category badge, title, "Submitted at DD/MM/YYYY at HH:MM", description.
  - Right side: `AttachmentsDropdown` (shadcn `DropdownMenu` + lucide `Paperclip`/`ChevronDown`) listing file names; clicking a name triggers a simulated download (create Blob with placeholder text, `URL.createObjectURL`, click hidden `<a download>`).
  - Empty state with CTA to Home.
6. `**admin.tsx**` — Admin choice
  - Guarded (redirect if not admin).
  - Two large split cards side-by-side (stack on mobile): "Submit my feedback" → `/` (acts as user), "Check all feedbacks" → `/admin/all-feedbacks`.
7. `**admin.all-feedbacks.tsx**` — Admin dashboard (URL `/admin/all-feedbacks`)
  - Guarded (admin only).
  - Reuses `CategoryGrid`. Selecting a category filters `getByCategory(...)` and renders all feedbacks by all users.
  - `FeedbackCard variant="admin"`: submitter Name / Email / Role banner at top, then category badge, title, timestamp, description, `AttachmentsDropdown`.
  - Back button to return to the category grid.

## Shared components (`src/components/`)

- `CategoryGrid.tsx` — takes `onSelect(category, sub?)`, reused by Home + Admin.
- `CategoryCard.tsx` — supports optional expandable children (BSW Services).
- `FeedbackCard.tsx` — variants `user | admin`.
- `AttachmentsDropdown.tsx` — dropdown menu + simulated download helper.
- `FileDropzone.tsx` — drag-and-drop + `<input type="file" multiple>`; renders selected file chips.
- `Navbar.tsx` — as above.
- `PageContainer.tsx` — consistent max-width + padding + framer-motion page fade-in.

## Mock seed data

- 3 mock users (IITD student, non-IITD parent, professor). "Current user" (after any user login) points to a seeded identity so `/my-feedbacks` isn't empty.
- ~8–10 seeded feedbacks spanning all 7 categories (some under BSW Services sub-categories), each with 1–3 attachments across varied file types. Timestamps within recent days.

## Route guards & navigation

- Guards live in route `beforeLoad` where possible, with a client-side `useEffect` fallback (contexts are client-only). Since auth is mocked in memory, SSR sees "logged out" — pages that require auth render a lightweight redirect via `<Navigate>` on the client to avoid SSR flicker.
- All navigation uses `<Link to="...">` / `useNavigate()` from `@tanstack/react-router`.

Head metadata

- `__root.tsx`: title "BSW Feedback Portal", description "Share feedback with BSW — we've got your back."
- Each route defines its own `head()` title (Home / Login / Submit Feedback / Success / My Feedbacks / Admin / All Feedbacks). No `og:image` at root.

## Motion & responsiveness

- framer-motion for: page fade-in, card hover lift, accordion height, success tick scale-in, dropdown chevron rotate.
- Fully responsive: mobile-first layouts, hamburger nav, single-column grids on small screens.

## Deliverables

1. Update `src/styles.css` (tokens + Inter font var).
2. Update `src/routes/__root.tsx` (dark html, Inter `<link>`, metadata, providers, Navbar).
3. Add contexts: `src/lib/auth-context.tsx`, `src/lib/feedback-store.tsx`, `src/lib/mock-data.ts`.
4. Add components listed above.
5. Add routes: `login.tsx`, `submit-feedback.tsx`, `success.tsx`, `my-feedbacks.tsx`, `admin.tsx`, `admin.all-feedbacks.tsx`; rewrite `index.tsx`.
6. Install `framer-motion` if not present; confirm shadcn `dropdown-menu`, `tabs`, `select`, `button`, `input`, `textarea`, `badge` are available (add via shadcn CLI if missing).