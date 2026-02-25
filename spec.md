# Specification

## Summary
**Goal:** Revert the Concept Delta app to a fully image-based question/option model, updating both the backend data schema and all relevant frontend components to store, display, and review questions and options as images with responsive, non-cropping image containers.

**Planned changes:**
- Update the Motoko backend (`main.mo`) to use `questionImageUrl: Text` and `optionImageUrls: [Text]` fields in the Question data model, and update `addQuestion`, `getAllQuestions`, and `getTestQuestions` accordingly
- Add a migration module (`migration.mo`) to convert any existing text-based question records to the image-URL schema without data loss
- Update the Admin Panel `AddQuestionModal.tsx` to use image URL text inputs (one for the question, four for options) with live preview thumbnails, a correct-option radio selector, and submit to the backend
- Update the Admin Panel `QuestionGallery.tsx` to display question and option images using responsive `object-contain` containers, with a 2×2 grid for options and a green border highlight on the correct answer
- Update `QuestionDisplay.tsx` to render question and option images in responsive `object-contain` containers, with a 2-column grid for options on tablet/desktop and single column on mobile, and a navy border on the selected option
- Update `Test.tsx` answer review section to display question and option images in responsive `object-contain` containers, with a blue border for the user's selected answer and a green border for the correct answer

**User-visible outcome:** Admins can add questions and options by entering image URLs (with live previews), and test-takers see all questions and options rendered as properly scaled, fully visible images on any screen size, with correct visual highlights during review.
