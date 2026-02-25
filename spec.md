# Concept Delta – MHT-CET Test Series

## Current State

### Backend (`main.mo`)
- ✅ `getPublishedTests()` query returns only tests where `isPublished = true`
- ✅ `createTest()` creates tests with `isPublished = false` by default
- ✅ `setTestPublished()` toggles publish status
- ❌ **Missing**: No function to get ALL tests (published + unpublished) for admin panel

### Frontend
- **Dashboard.tsx**: Uses `useGetPublishedTests()` correctly to show published tests to students
- **Admin Panel (TestManagement)**: Uses `useGetAllTests()` which incorrectly calls `getPublishedTests()` instead of a function that returns all tests
- Result: Newly created unpublished tests are invisible in the admin panel

### User Report
"created test not show in dashboard"

**Root Cause**: Tests are created as unpublished by default, but the admin panel cannot see unpublished tests because there's no backend query to fetch all tests (regardless of publish status).

---

## Requested Changes (Diff)

### Add
- Backend: New query function `getAllTests()` (admin-only) that returns ALL tests regardless of publish status
- Backend: Return full `Test` objects (not just `TestSummary`) so admin can see publish status

### Modify
- Frontend `useQueries.ts`: Update `useGetAllTests()` to call the new `getAllTests()` backend function
- Frontend Admin Panel: Display publish status clearly for each test

### Remove
None.

---

## Implementation Plan

### Backend (`main.mo`)
1. Add new query function `getAllTests()` restricted to admin
2. Return full `Test[]` array sorted by `createdAt` (newest first)

### Frontend (`useQueries.ts`)
3. Update `useGetAllTests()` to call `actor.getAllTests()`
4. Change return type from `TestSummary[]` to include `isPublished` field

### Frontend (Admin Panel)
5. Display publish toggle correctly for each test
6. Show badge/indicator for published vs unpublished status

---

## UX Notes

**After this fix:**
- Admin creates a test → it appears immediately in Admin Panel as "Unpublished"
- Admin toggles publish → test appears on Dashboard for students
- Students only see published tests (no change to their experience)
- Admin can manage all tests (published + unpublished) from one view
