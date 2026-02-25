# Specification

## Summary
**Goal:** Fix the Navbar component to have a fully opaque navy background at all times and ensure all navigation links are always visible and correctly rendered on both desktop and mobile.

**Planned changes:**
- Rewrite `Navbar.tsx` to use a solid opaque navy (`#0D1B4B`) background — remove any `bg-transparent`, `bg-opacity-*`, or `backdrop-blur` classes
- Set explicit `z-50` on the navbar so it always renders above page content
- Fix desktop nav layout to use `flex-nowrap` with proper spacing so all links render in a single row without clipping
- Ensure nav links are: "Home" (always), "Dashboard" (authenticated only), "Admin Panel" (authenticated + isAdmin only), and Login/Logout button on the far right
- Fix mobile hamburger dropdown to use a solid opaque navy background so links are readable against dark backgrounds
- Call `useIsCallerAdmin` at the top level, derive `isAdmin = data === true`, and only show "Admin Panel" when authenticated, isAdmin is true, and the query is not loading
- Remove any leftover `console.log` debug statements from the component

**User-visible outcome:** The navbar always displays a solid navy background on all pages (including the dark hero section), all navigation links (Home, Dashboard, Admin Panel) and the Login/Logout button are clearly visible and readable on both desktop and mobile, and the Admin Panel link correctly appears only for authenticated admin users.
