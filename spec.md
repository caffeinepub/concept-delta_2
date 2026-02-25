# Specification

## Summary
**Goal:** Fix the Admin Panel link not appearing in the Navbar after an admin user logs in.

**Planned changes:**
- Fix `useIsCallerAdmin` hook to use the authenticated actor, include the user's principal in the query key, disable when unauthenticated, and use a short staleTime so it re-fetches on mount after login.
- Update `Navbar.tsx` to call `useIsCallerAdmin` and conditionally render the Admin Panel link (in both desktop nav and mobile hamburger menu) only when the user is logged in AND is an admin, hiding it during the loading state to prevent flicker.
- Ensure `useActor.ts` properly invalidates/refetches the `isCallerAdmin` query when the identity changes after login.

**User-visible outcome:** After an admin logs in, the Admin Panel link appears in the navbar (desktop and mobile) without requiring a page reload. Non-admin and unauthenticated users do not see the link.
