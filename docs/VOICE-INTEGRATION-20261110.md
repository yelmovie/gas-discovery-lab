# Character narration integration (2026-11-10)

33 screen-specific Korean dialogue lines are mapped in `src/voice-lines.js` and connected to their actual home, story, facility introduction, experiment retry/completion, map companion, finale and ending screens.

- A single shared narration player owns playback. Replay, stop, mute, visibility changes, navigation, modal opening and media playback cancel stale narration.
- Narration ducks the existing procedural background music to 15% of its configured gain; ending, errors and cancellation restore the configured music state. Story-screen quiet mode stays separate.
- Captions and existing learner controls remain available when audio is muted, unavailable or autoplay is blocked. Welcome playback remains deliberate, not automatic.
- Existing assets, including the older welcome recording, remain preserved. No font files or stylesheet files were changed.
- `VOICE-PROVENANCE-20261110.json` records the selected generated sources, synthesis settings, ASR findings, edits and SHA-256 hashes. ASR results and vocabulary-assisted checks are not human listening verification.

## Verification

- Existing unit tests and new narration lifecycle/hash tests.
- `scripts/qa-learning.mjs`: all 20 learner tasks, finale, certificate, repeat exploration, keyboard focus and navigation abort.
- `scripts/qa-playback.mjs`: all 20 experiment playback boundaries, pause/resume, speed changes, manual interruption, navigation abort and teacher navigation.
- `scripts/qa-responsive.mjs`: 196 rendered-screen cases across 1366×768, 1024×768, 740×360 and 390×844. The app intentionally asks for landscape orientation on narrow portrait screens.
- `scripts/qa-voices.mjs`: actual Chrome playback through each screen's replay control, every line reaching the HTMLMediaElement `ended` event. The test accelerates media playback to 4× to check decoding and completion, not voice quality; it also checks WebAudio duck/recovery, active-playback muting and route cancellation.

Human listening quality has not been verified. Browser decoding/ended events, file hashes and ASR checks must not be reported as a human listening review.
