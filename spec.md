# Specification

## Summary
**Goal:** Remove the four option image upload fields from the Add Question modal in the Admin Panel, keeping only the single question image file picker.

**Planned changes:**
- Remove all four option image file picker inputs (Option 1–4) from the Add Question modal (`AddQuestionModal.tsx`).
- Retain the question image file picker with live preview thumbnail, the correct option selector (A/B/C/D radio buttons), and the Submit button.
- On form submission, pass the question image base64 data URI and empty strings for the four option image fields to maintain backend compatibility.

**User-visible outcome:** When adding a question in the Admin Panel, admins see only one image upload field (for the combined question+options image) instead of five separate image pickers, simplifying the question creation flow.
