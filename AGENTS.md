<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:data-exposure-rules -->
# Data exposure: the backend decides, the frontend never compensates

The backend returns each role only what that role may see (standard: `Bahrain-Taekwondo/docs/API_STANDARDS.md`).

- Every screen uses the endpoint made for its audience, with its own TypeScript type (for example `MyPlayer`, `CoachPlayer`,
  `AdminUser`). Do not reuse one audience's type or endpoint for another.
- If a screen needs a field its endpoint does not return, ask for the backend view of **that audience** to be extended.
  Do not switch the screen to a more privileged endpoint, and do not "hide" private data with CSS or conditional rendering.
- Do not request, store or log data a screen does not need. Sensitive values (national ID) arrive already masked; show them as received.
- Text typed by people is English only (the shared `Input`/`Textarea` filter it); keep using those components for new fields.
<!-- END:data-exposure-rules -->
