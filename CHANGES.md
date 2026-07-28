# Changes relative to the original plugin

Base: **Translator v2.8.3** by DevilBro (Mirco Wittrien),
<https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/Translator/>

Modified by **FiL**, July 2026.

## Added

- **Automatic translation of incoming messages** (`general.autoTranslateIncoming`).
  New method `autoTranslateMessage(message, channel)`, hooked into the message rendering
  patch; already-processed message ids are tracked in `autoTranslatedIds` with a 2000-entry cap.
- **Auto-translation settings** (`autoTranslate.*`):
  - `targetLang` — target language, supports `_discord` (follow the Discord client language);
  - `translateDMs` — whether to translate direct messages;
  - `skipLangs` — comma-separated list of languages to skip;
  - `invertSkip` — treat the list as a whitelist instead ("translate only these");
  - `skipSameScript` — skip messages written in the same script as the target language.
- Settings-panel UI for all of the above (settings tab + popout).
- Per-channel translation states (`translationEnabledStates`).
- Russian labels for the new settings; English labels kept as the default.

## Renamed

- Plugin id/name `Translator` → `FiLTranslator`, so it can be installed side by side with
  the original plugin and keeps its own settings file.

Everything else (translation engines, language lists, prefixes, exceptions, the BDFDB-based
architecture and the localisation tables) comes from the original plugin and is unchanged.
