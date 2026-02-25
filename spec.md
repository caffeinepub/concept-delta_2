# Specification

## Summary
**Goal:** Fix the Admin Panel link not appearing in the navbar immediately after login without requiring a page refresh.

**Planned changes:**
- In `useActor.ts`, add a `useEffect` that watches the identity and calls `queryClient.invalidateQueries` (targeting `isCallerAdmin` and `actor` query keys) whenever the identity changes from null to a non-null value.
- Rewrite `useIsCallerAdmin` in `useQueries.ts` to obtain the identity directly from `useInternetIdentity`, derive a stable principal string, create an authenticated actor via `createActor`, include the principal in the query key, and set `staleTime` and `gcTime` to 0.
- Update `Navbar.tsx` to destructure `data`, `isLoading`, and `isFetching` from `useIsCallerAdmin`, and show the Admin Panel link only when the user is logged in, loading is complete, and the result is strictly `true` — applied to both desktop and mobile nav.

**User-visible outcome:** After logging in as an admin via Internet Identity, the Admin Panel link appears immediately in the navbar (desktop and mobile) without needing a page refresh. Non-admin users do not see the link.
