# Concept Delta – MHT-CET Test Series

## Current State

The admin results page displays raw principal IDs (like `mv15-jvses-gd5...`) in the "User" column instead of user full names.

Backend has:
- `adminGetAllUsers()` returns `AnonymousProfile[]` without principal field
- `getAllResults()` returns `TestResult[]` with `userId` (Principal) but no name
- Frontend cannot map userId → fullName

## Requested Changes (Diff)

### Add
- New backend query: `getAllResultsWithUserNames()` → returns enriched results
- New type: `TestResultWithUserName` with `userName` and `testName` fields
- New frontend hook: `useGetAllResultsWithUserNames()`

### Modify
- `ResultsList.tsx` to use new hook and display `result.userName` instead of `result.userId`

### Remove
- None

## Implementation Plan

1. ✅ Backend: Add `getAllResultsWithUserNames()` Motoko function
   - Look up user profile by `userId` to get `fullName`
   - Look up test by `testId` to get `name`
   - Return enriched `TestResultWithUserName[]`
2. ✅ Frontend: Add `useGetAllResultsWithUserNames()` hook in `useQueries.ts`
3. ✅ Frontend: Update `ResultsList.tsx` to:
   - Import and call `useGetAllResultsWithUserNames()` instead of `useGetAllResults()`
   - Display `result.userName` in User column
   - Display `result.testName` in Test Name column
4. Deploy and verify

## UX Notes

- Users will now see actual student names in the results table
- If a user or test is deleted/missing, display "(Unknown User)" or "(Unknown Test)"
- This improves admin UX significantly for tracking student performance
