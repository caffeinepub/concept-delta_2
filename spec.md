# Specification

## Summary
**Goal:** Fix the Navbar so that Home, Dashboard, Admin Panel, and the Login/Logout button are always visible and never hidden due to overflow, flex-wrap, or stale query state.

**Planned changes:**
- Rewrite `Navbar.tsx` to use a flex layout with `flex-nowrap` and `overflow-visible` so no items are ever clipped or collapsed on desktop or mobile.
- Ensure Home is always visible, Dashboard is shown only when authenticated, and Admin Panel is shown only when authenticated and the user is an admin.
- Keep the Login/Logout button always visible on the right side of the navbar.
- Fix the mobile hamburger menu to reliably toggle open/closed with no z-index or overflow conflicts, showing the same conditional link set.
- Update `useIsCallerAdmin` in `useQueries.ts` to only enable when identity is non-null, use a fresh authenticated actor, include the principal string in the query key, and set `staleTime: 0` and `gcTime: 0`.
- Add/verify a `useEffect` in `useActor.ts` that invalidates all React Query queries whenever the identity changes to a non-null value, so the navbar updates immediately after login.

**User-visible outcome:** After login, the navbar immediately and reliably shows Home, Dashboard, and Admin Panel (for admins) along with the Logout button on all screen sizes, with no items ever hidden or requiring a page refresh.
