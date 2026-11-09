# Audio provenance and release review

## New sound effects
- `src/theme-effects.js` is original procedural Web Audio code authored for this task. No third-party recordings, samples, audio service, or microphone.
- Theme: pump-like upward sweeps. No external sample license dependency; this is not an absolute legal warranty.
- User interaction unlock, mute/effects settings, narration priority, hidden-tab and page-exit stop are respected. Existing settings persistence is preserved.

## Preserved existing assets
- Existing Kenney Interface Sounds retained, with CC0 text available in project source/cache license files. The license expressly permits personal, educational, and commercial use. https://kenney.nl/assets/interface-sounds / https://creativecommons.org/publicdomain/zero/1.0/
- Runtime effects now use procedural synthesis without download/decode latency. Existing procedural music retained.

## NPC narration
Existing Korean F1 narration preserved. No new generation or microphone input. Source metadata `561354e1-2529-40d7-9b08-a6349aa818e0.json` identifies momo-voice / Supertonic 3 / OpenRAIL-M, generated 2026-11-07T22:02:38.123Z. Original script exactly matches the runtime caption. Matching script and duration support conversion lineage; lossy AAC does not share WAV hash.

Official license: https://huggingface.co/Supertone/supertonic-3/blob/main/LICENSE . Section 6 claims no output rights subject to use restrictions. This is licensed educational narration, not public domain or an unconditional copyright-free claim. Snapshot: SUPERTONIC3-LICENSE.txt.

561354e1-2529-40d7-9b08-a6349aa818e0.wav: SHA-256 f836fb20e7e8eeabc156a730533920599d9ebf4918e32da933aa0aa7b0af7ef2, duration 11.911837 seconds.
npc-welcome.m4a: SHA-256 0dcdfcefd57600c9d89e1ce09950458d4e67f4fc96d2f7b1170e1dd3a0dc2f7c, duration 11.911837 seconds.
