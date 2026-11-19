# FiLTranslator

A BetterDiscord plugin for translating Discord messages — manually (per message / outgoing text)
and automatically (incoming messages).

> **This is a fork.** FiLTranslator is a modified version of
> [**Translator** v2.8.3 by DevilBro (Mirco Wittrien)](https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/Translator/).
> It is not an official DevilBro release and is not affiliated with or endorsed by the original author.
> Please support the original author: [Patreon](https://www.patreon.com/MircoWittrien) ·
> [PayPal](https://www.paypal.me/MircoWittrien)

## What was added on top of the original

- Automatic translation of **incoming** messages
  - target language (including "follow Discord language")
  - toggle for DMs
  - skip-list of languages, with an invert mode ("translate only these")
  - skip messages already written in the same script
- Per-channel translation states
- Russian and English interface in the plugin settings and the chat popup. Choose RU or EN under Interface language. The choice is saved separately from the message translation languages.

Full list: [CHANGES.md](CHANGES.md).

## Requirements

- [BetterDiscord](https://betterdiscord.app/)
- **BDFDB Library** by DevilBro — the plugin offers to download it automatically on first start,
  or get it from [here](https://mwittrien.github.io/downloader/?library).

## Installation

1. Download [`FiLTranslator.plugin.js`](FiLTranslator.plugin.js).
2. Put it into your BetterDiscord plugins folder
   (`%appdata%\BetterDiscord\plugins` on Windows).
3. Enable it in Discord → Settings → Plugins.
4. If prompted, let it install the BDFDB Library and restart Discord.

Not available in the BetterDiscord store — forks of existing plugins are not accepted there,
so install it manually from this repository.

## License

GPL-2.0-or-later. Original work © Mirco Wittrien (DevilBro); modifications © 2026 FiL.
See [LICENSE](LICENSE).
