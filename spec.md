# Specification

## Summary
**Goal:** Designate the first user to log in as the permanent admin, and restrict the Admin Panel to that user only.

**Planned changes:**
- In the Motoko backend, store the first principal to authenticate as the admin in stable storage; reject admin-only calls from any other principal; ensure the admin principal persists across canister upgrades.
- Update `useIsCallerAdmin` hook to call the backend `isCallerAdmin()` function, return a boolean, and re-fetch whenever the authenticated identity changes.
- Update the Navbar to conditionally render the "Admin Panel" link only when the user is authenticated and `useIsCallerAdmin` returns true, in both desktop and mobile views.
- Update the Admin Panel page (`/admin`) to redirect unauthenticated users to Home and show an "Access Denied" message to non-admin authenticated users; render the full five-tab panel only for the designated admin.

**User-visible outcome:** The very first user to log in automatically becomes the admin and sees the Admin Panel link in the navbar. All other users (and unauthenticated visitors) do not see or access the Admin Panel.
