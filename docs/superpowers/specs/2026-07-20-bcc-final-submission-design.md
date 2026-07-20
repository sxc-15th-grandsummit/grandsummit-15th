# BCC Final Submission Design

## Goal

Add a finalist-only `Final Submission` round to the existing BCC team dashboard and expose finalist controls and final-round monitoring in the admin page.

## Finalist Source of Truth

- Add `teams.is_finalist boolean NOT NULL DEFAULT false`.
- Mark these exact BCC team names as finalists: `JAWARA`, `GGMU`, `KMMTI`, `KanarazuKatsu`, and `H Capital`.
- Keep the migration in `supabase/migrations/`; migrations are gitignored and must be applied manually.
- Return `is_finalist` from the participant and admin team APIs.

## Participant Experience

- Show a `Final Submission` dashboard tab only when the BCC team's `is_finalist` value is true.
- Reuse the existing `SubmissionRound` component with round key `final`.
- Show two resource buttons at the top of the final-round panel:
  - `Final Stage Guideline`: <https://bit.ly/FinalStageGuidebook>
  - `Final Case`: <https://bit.ly/FinalCaseDocument>
- Require three PDF files, each limited to 30 MB:
  - Pitch Deck: `PitchDeckBCC_15GrandSummit_[Team Name].pdf`
  - Originality Statement: `[Team Name]_Originality_Final_BCC.pdf`
  - AI Usage Declaration: `[Team Name]_AIDeclaration_Final_BCC.pdf`
- Display deadline: 23 July 2026 at 23:59 WIB.
- Upload close: 24 July 2026 at 01:00 WIB.
- Finalization locks the round, matching the existing preliminary and semifinal behavior.

## Authorization and Submission Rules

- Register `BCC/final` in the shared submission config so validation, upload, completion, and finalization reuse the existing endpoints.
- Participant-facing visibility is not the security boundary: every final-round upload and finalization endpoint must reject a BCC team whose `is_finalist` is false.
- Mark a finalized submission as late when its `submitted_at` is at or after 23 July 2026 23:59 WIB and before the upload close.
- Reject uploads and finalization at or after 24 July 2026 01:00 WIB.

## Admin Experience

- Add a per-team finalist toggle backed by `teams.is_finalist`.
- Add a `BCC finalists only` filter whose count is derived from API data, never hardcoded.
- Add final-round monitoring fields and UI alongside preliminary and semifinal status:
  - finalized/not finalized;
  - submitted timestamp;
  - uploaded requirement count and per-file status;
  - on-time/late state.
- Do not change Google Sheets exports in this scope.

## Testing and Verification

- Add failing tests first for final-round config, required keys, deadline/close boundaries, late classification, and finalist-only access logic.
- Add focused source/behavior coverage for the participant tab and admin finalist/final-submission UI.
- Run the focused Bun tests, ESLint on touched files, and `bun run build`.

## Non-goals

- No new upload component, API family, dependency, or submission table.
- No finalist-specific Google Sheets export.
- No changes to preliminary, semifinal, or MCC submission behavior.
