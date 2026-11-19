/**
 * @name FiLTranslator
 * @author FiL
 * @version 1.1.0
 * @description Free translator with manual and automatic translation of Discord messages. (RU: Бесплатный переводчик с ручным и автоматическим переводом сообщений в Discord.)
 * @source https://github.com/FiL-Design-Ai/FiL-DiscordTranslator
 * @updateUrl https://raw.githubusercontent.com/FiL-Design-Ai/FiL-DiscordTranslator/main/FiLTranslator.plugin.js
 *
 * ---------------------------------------------------------------------------
 * ATTRIBUTION / АТРИБУЦИЯ
 *
 * This file is a modified version of the plugin "Translator" (v2.8.3)
 * by DevilBro (Mirco Wittrien):
 *   https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/Translator/
 *
 * Original work Copyright (C) Mirco Wittrien (DevilBro).
 * Modifications Copyright (C) 2026 FiL.
 *
 * Modified by FiL in July 2026. Summary of changes (see CHANGES.md for details):
 *   - added automatic translation of incoming messages (target language,
 *     DM toggle, language skip-list with invert mode, same-script skipping);
 *   - added per-channel translation states and related settings UI;
 *   - added Russian labels for the new settings.
 * The plugin was renamed to "FiLTranslator" so it can be installed alongside
 * the original plugin; it is NOT an official DevilBro release.
 *
 * This program is free software; you can redistribute it and/or modify it
 * under the terms of the GNU General Public License as published by the Free
 * Software Foundation; either version 2 of the License, or (at your option)
 * any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 * FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for
 * more details. A copy of the license is included in the LICENSE file of the
 * repository linked above.
 * ---------------------------------------------------------------------------
 */

module.exports = (_ => {
	const changeLog = {
		
	};
	
	return !window.BDFDB_Global || (!window.BDFDB_Global.loaded && !window.BDFDB_Global.started) ? class {
		constructor (meta) {for (let key in meta) this[key] = meta[key];}
		getName () {return this.name;}
		getAuthor () {return this.author;}
		getVersion () {return this.version;}
		getDescription () {return `The Library Plugin needed for ${this.name} is missing. Open the Plugin Settings to download it. \n\n${this.description}`;}
		
		downloadLibrary () {
			BdApi.Net.fetch("https://mwittrien.github.io/BetterDiscordAddons/Library/0BDFDB.plugin.js").then(r => {
				if (!r || r.status != 200) throw new Error();
				else return r.text();
			}).then(b => {
				if (!b) throw new Error();
				else return require("fs").writeFile(require("path").join(BdApi.Plugins.folder, "0BDFDB.plugin.js"), b, _ => BdApi.UI.showToast("Finished downloading BDFDB Library", {type: "success"}));
			}).catch(error => {
				BdApi.UI.alert("Error", "Could not download BDFDB Library Plugin. Try again later or download it manually from GitHub: https://mwittrien.github.io/downloader/?library");
			});
		}
		
		load () {
			if (!window.BDFDB_Global || !Array.isArray(window.BDFDB_Global.pluginQueue)) window.BDFDB_Global = Object.assign({}, window.BDFDB_Global, {pluginQueue: []});
			if (!window.BDFDB_Global.downloadModal) {
				window.BDFDB_Global.downloadModal = true;
				BdApi.UI.showConfirmationModal("Library Missing", `The Library Plugin needed for ${this.name} is missing. Please click "Download Now" to install it.`, {
					confirmText: "Download Now",
					cancelText: "Cancel",
					onCancel: _ => {delete window.BDFDB_Global.downloadModal;},
					onConfirm: _ => {
						delete window.BDFDB_Global.downloadModal;
						this.downloadLibrary();
					}
				});
			}
			if (!window.BDFDB_Global.pluginQueue.includes(this.name)) window.BDFDB_Global.pluginQueue.push(this.name);
		}
		start () {this.load();}
		stop () {}
		getSettingsPanel () {
			let template = document.createElement("template");
			template.innerHTML = `<div style="color: var(--text-strong); font-size: 16px; font-weight: 300; white-space: pre; line-height: 22px;">The Library Plugin needed for ${this.name} is missing.\nPlease click <a style="font-weight: 500;">Download Now</a> to install it.</div>`;
			template.content.firstElementChild.querySelector("a").addEventListener("click", this.downloadLibrary);
			return template.content.firstElementChild;
		}
	} : (([Plugin, BDFDB]) => {
		var _this;

		const interfaceLabels = {
			ru: {
				settings_interfaceLanguage: "Язык интерфейса",
				settings_title: "Настройки переводчика",
				settings_manualTranslation: "Ручной перевод",
				settings_engines: "Переводчики",
				settings_autoTranslation: "Авто-перевод",
				settings_skipSameScript: "Не переводить текст, уже написанный алфавитом целевого языка",
				settings_languageCodes: "Языки (коды через запятую: ru, fr, de)",
				settings_exceptionPrefix: "Новый префикс-исключение (напр. !)",
				settings_languagePrefix: "Префикс (напр. $fr)",
				settings_addPrefix: "+ Добавить префикс",
				settings_discordLanguage: "Язык Discord",
				settings_systemLanguage: "Системный язык",
				popout_incoming: "Входящие (ручной перевод)",
				popout_outgoing: "Исходящие (перед отправкой)",
				popout_translateTo: "переводить на:",
				popout_autoTranslationHelp: "Авто-перевод работает отдельно от ручного перевода входящих сообщений.",
				popout_autoTranslationTarget: "Авто-перевод — переводить входящие на:",
				language_binary: "Бинарный",
				language_braille: "Шрифт Брайля",
				language_morse: "Азбука Морзе",
				language_hex: "Шестнадцатеричный",
				tooltip_from: "С языка",
				tooltip_to: "На язык",
				toast_wait: "Подожди немного",
				toast_copied: "Перевод скопирован",
				error_invalidBinary: "Неверный бинарный формат. Используй только 0 и 1.",
				backup_engine:						"Резервный-Переводчик",
				backup_engine_warning:					"Буду использовать Резервный-Переводчик",
				context_messagetranslateoption:				"Перевести сообщение",
				context_messageuntranslateoption:			"Показать оригинал",
				context_translator:					"Искать перевод",
				detect_language:					"Определить язык",
				error_dailylimit:					"Достигнут дневной лимит запросов.",
				error_hourlylimit:					"Достигнут лимит почасовых запросов.",
				error_keyoutdated:					"API-ключ устарел.",
				error_monthlylimit:					"Достигнут месячный лимит запросов.",
				error_serverdown:					"Сервер переводов может быть отключен.",
				exception_text:						"Слова, начинающиеся с {{var0}}, будут игнорироваться.",
				general_addQuickTranslateButton:			"Добавляет кнопку быстрого перевода в панель действий сообщений",
				general_addTranslateButton:				"Добавляет кнопку перевода в текстовую область канала",
				general_sendOriginalMessage:				"Также отправляет исходное сообщение при переводе отправленного сообщения.",
				general_showOriginalMessage:				"Также показывает исходное сообщение при переводе полученного сообщения.",
				general_usePerChatTranslation:				"Включает/отключает состояние кнопки переводчика для каждого канала, а не глобально",
				general_useSpoilerInOriginal:			"Использовать спойлер вместо цитаты для оригинального текста",
				general_autoTranslateIncoming:			"Автоматически переводить входящие сообщения",
				autoTranslate_targetLang:			"Целевой язык",
				autoTranslate_translateDMs:			"Переводить личные сообщения",
				autoTranslate_skipLangs:			"Пропускать языки",
				autoTranslate_invertSkip:			"Только эти языки (вместо пропуска)",
				language_choice_input_received:				"Язык ввода в полученных сообщениях",
				language_choice_input_sent:				"Язык ввода в ваших отправленных сообщениях",
				language_choice_output_received:			"Язык вывода в полученных сообщениях",
				language_choice_output_sent:				"Язык вывода в ваших отправленных сообщениях",
				language_selection_channel:				"Выбор языка будет изменен специально для этого канала.",
				language_selection_global:				"Выбор языка будет изменен для всех серверов.",
				language_selection_server:				"Выбор языка будет изменен специально для этого сервера",
				popout_translateoption:					"Перевести",
				popout_untranslateoption:				"Показать оригинал",
				prefixes_disable_text:					"Префиксы, которые отключают перевод сообщения",
				prefixes_enable_text:					"Префиксы, которые обеспечивают перевод с конкретным языком (например, $fr, $de, $jp)",
				toast_translating:					"Идет перевод",
				toast_translating_failed:				"Не удалось перевести",
				toast_translating_tryanother:				"Попробуйте другой переводчик",
				translate_your_message:					"Переводите свои сообщения перед отправкой",
				translated_watermark:					"переведено",
				translator_engine:					"Переводчик"
			},
			en: {
				settings_interfaceLanguage: "Interface language",
				settings_title: "Translator settings",
				settings_manualTranslation: "Manual translation",
				settings_engines: "Translation engines",
				settings_autoTranslation: "Automatic translation",
				settings_skipSameScript: "Skip text already written in the target language’s script",
				settings_languageCodes: "Languages (comma-separated codes: ru, fr, de)",
				settings_exceptionPrefix: "New exclusion prefix (e.g. !)",
				settings_languagePrefix: "Prefix (e.g. $fr)",
				settings_addPrefix: "+ Add prefix",
				settings_discordLanguage: "Discord language",
				settings_systemLanguage: "System language",
				popout_incoming: "Incoming (manual translation)",
				popout_outgoing: "Outgoing (before sending)",
				popout_translateTo: "translate to:",
				popout_autoTranslationHelp: "Automatic translation uses its own target language, separate from manual translation of incoming messages.",
				popout_autoTranslationTarget: "Automatically translate incoming messages to:",
				language_binary: "Binary",
				language_braille: "Braille",
				language_morse: "Morse code",
				language_hex: "Hexadecimal",
				tooltip_from: "From",
				tooltip_to: "To",
				toast_wait: "Please wait",
				toast_copied: "Translation copied",
				error_invalidBinary: "Invalid binary format. Use only 0 and 1.",
				general_useSpoilerInOriginal: "Use spoilers for the original text instead of quotes",
				autoTranslate_targetLang: "Target language",
				autoTranslate_translateDMs: "Translate direct messages",
				autoTranslate_skipLangs: "Skip languages",
				autoTranslate_invertSkip: "Only translate these languages",
				backup_engine:						"Backup-Translator",
				backup_engine_warning:					"Will use Backup-Translator",
				context_messagetranslateoption:				"Translate Message",
				context_messageuntranslateoption:			"Untranslate Message",
				context_translator:					"Search Translation",
				detect_language:					"Detect Language",
				error_dailylimit:					"Daily Request Limit reached.",
				error_hourlylimit:					"Hourly Request Limit reached.",
				error_keyoutdated:					"API-Key outdated.",
				error_monthlylimit:					"Monthly Request Limit reached.",
				error_serverdown:					"Translation Server might be offline.",
				exception_text:						"Words starting with {{var0}} will be ignored",
				general_addQuickTranslateButton:			"Adds a Quick Translate Button in the Message Actions Bar",
				general_addTranslateButton:				"Adds a Translate Button to the Channel Textarea",
				general_sendOriginalMessage:				"Also sends the original Message when translating your sent Message",
				general_showOriginalMessage:				"Also shows the original Message when translating a received Message",
				general_usePerChatTranslation:				"Enables/Disables the Translator Button State per Channel and not globally",
				general_autoTranslateIncoming:			"Automatically translate incoming messages",
				language_choice_input_received:				"Input Language in received Messages",
				language_choice_input_sent:				"Input Language in your sent Messages",
				language_choice_output_received:			"Output Language in received Messages",
				language_choice_output_sent:				"Output Language in your sent Messages",
				language_selection_channel:				"Language Selection will be changed specifically for this Channel",
				language_selection_global:				"Language Selection will be changed for all Servers",
				language_selection_server:				"Language Selection will be changed specifically for this Server",
				popout_translateoption:					"Translate",
				popout_untranslateoption:				"Untranslate",
				prefixes_disable_text:					"Prefixes that disable translation of message",
				prefixes_enable_text:					"Prefixes that enable translation with specific language (e.g. $fr, $de, $jp)",
				toast_translating:					"Translating",
				toast_translating_failed:				"Failed to translate",
				toast_translating_tryanother:				"Try another Translator",
				translate_your_message:					"Translate your Messages before sending",
				translated_watermark:					"translated",
				translator_engine:					"Translator"
			}
		};
		const interfaceLanguageOptions = [{value: "ru", label: "RU"}, {value: "en", label: "EN"}];
		const languageNames = {
			ru: new Intl.DisplayNames("ru", {type: "language", fallback: "none"}),
			en: new Intl.DisplayNames("en", {type: "language", fallback: "none"})
		};
		
		const translateIconGeneral = `<svg name="Translate" width="24" height="24" viewBox="0 0 24 24"><mask/><path fill="currentColor" mask="url(#translateIconMask)" d="m 9.6568988,1.9999999 c -1.141416,0 -0.951614,1.2688185 -0.951614,1.2688185 v 0.6505173 h -5.392479 c 0,0 -1.2688185,-0.1898024 -1.2688185,0.9516139 0,1.1414159 1.2688185,0.9516139 1.2688185,0.9516139 H 12.426863 C 12.695162,7.2780713 11.349082,9.1398691 9.7646988,10.765256 8.6555628,9.6878231 7.4332858,8.3134878 6.8664892,7.065981 6.6161862,6.515072 5.9881318,6.6956414 5.7283935,6.9736693 5.1836529,7.5567679 5.5785907,8.592173 6.0833902,9.3409331 c 0.246901,0.366224 1.3724726,1.5182279 2.4570966,2.5995909 -1.6322361,1.477469 -3.154699,2.550028 -3.154699,2.550028 0,0 -1.0769951,0.696378 -0.322161,1.552568 0.7548319,0.856187 1.5810669,-0.125147 1.5810669,-0.125147 0,0 1.5136611,-1.082765 3.2203701,-2.6696 0.5195872,0.508635 0.8970952,0.874172 0.8970952,0.874172 0,0 0.82821,0.985394 1.582925,0.09231 0.754714,-0.893081 -0.354377,-1.545753 -0.354377,-1.545753 0.0097,0.03486 -0.34186,-0.224086 -0.864878,-0.666625 1.804964,-1.884163 3.470802,-4.1622897 3.47686,-6.1799145 h 1.398302 c 0,0 1.268819,0.2176541 1.268819,-0.9516139 0,-1.1692683 -1.268819,-0.9516139 -1.268819,-0.9516139 H 10.608512 V 3.2688184 c 0,0 0.189804,-1.2688185 -0.9516132,-1.2688185 z M 15.056812,10.104826 10.536646,22 h 2.379035 l 0.964624,-2.537637 h 4.732049 L 19.576978,22 h 2.379035 L 17.435847,10.104826 Z m 1.189517,3.130537 1.643021,4.323772 h -3.286042 z"/><extra/></svg>`;
		const translateIconMask = `<mask id="translateIconMask" fill="black"><path fill="white" d="M 0 0 H 24 V 24 H 0 Z"/><path fill="black" d="M24 12 H 12 V 24 H 24 Z"/></mask>`;
		const translateIcon = translateIconGeneral.replace(`<extra/>`, ``).replace(`<mask/>`, ``).replace(` mask="url(#translateIconMask)"`, ``);
		const translateIconUntranslate = translateIconGeneral.replace(`<extra/>`, `<path fill="none" stroke="#f04747" stroke-width="2" d="m 14.702359,14.702442 8.596228,8.596148 m 0,-8.597139 -8.59722,8.596147 z"/>`).replace(`<mask/>`, translateIconMask);
		
		const TranslateButtonComponent = class TranslateButton extends BdApi.React.Component {
			render() {
				const enabled = _this.isTranslationEnabled(this.props.channelId);
				return BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ChannelTextAreaButton, {
					className: BDFDB.DOMUtils.formatClassName(BDFDB.disCN._translatortranslatebutton, _this.isTranslationEnabled(this.props.channelId) && BDFDB.disCN._translatortranslating, BDFDB.disCN.textareapickerbutton),
					isActive: this.props.isActive,
					iconSVG: translateIcon,
					nativeClass: true,
					tooltip: enabled && {
						text: (_ => `${_this.getLanguageName(languages[_this.getLanguageChoice(languageTypes.INPUT, messageTypes.SENT, this.props.channelId)])} ➝ ${_this.getLanguageName(languages[_this.getLanguageChoice(languageTypes.OUTPUT, messageTypes.SENT, this.props.channelId)])}`),
						tooltipConfig: {style: "max-width: 400px"}
					},
					onClick: _ => {
						this.props.isActive = true;
						BDFDB.ReactUtils.forceUpdate(this);
						
						let modalInstance;
						const modalConfig = {
							size: "LARGE",
							header: _this.labels.settings_title,
							subHeader: "",
							onOpen: instance => {modalInstance = instance;},
							onClose: _ => {
								this.props.isActive = false;
								BDFDB.ReactUtils.forceUpdate(this);
							},
							children: BDFDB.ReactUtils.createElement(TranslateSettingsComponent, {
								guildId: this.props.guildId,
								channelId: this.props.channelId,
								onInterfaceLanguageChange: () => {
									modalConfig.header = _this.labels.settings_title;
									if (modalInstance) BDFDB.ReactUtils.forceUpdate(modalInstance);
								}
							})
						};
						BDFDB.ModalUtils.open(_this, modalConfig);
					},
					onContextMenu: _ => {
						_this.toggleTranslation(this.props.channelId);
						BDFDB.ReactUtils.forceUpdate(this);
					}
				});
			}
		};
		
		const TranslateSettingsComponent = class TranslateSettings extends BdApi.React.Component {
			filterLanguages(direction, place) {
				let isOutput = direction == languageTypes.OUTPUT;
				return BDFDB.ObjectUtils.toArray(BDFDB.ObjectUtils.map(isOutput ? BDFDB.ObjectUtils.filter(languages, lang => !lang.auto) : languages, (lang, id) => ({
					value: id,
					label: _this.getLanguageName(lang),
					backup: this.isOnlyBackup(lang)
				}))).filter(isOutput && this.isOnlyBackup(languages[_this.getLanguageChoice(languageTypes.INPUT, place, this.props.channelId)]) ? (n => n.backup) : (n => n));
			}
			isOnlyBackup(lang) {
				return lang && (lang.auto && translationEngines[_this.settings.engines.translator] && !translationEngines[_this.settings.engines.translator].auto || !lang.auto && !lang.special && translationEngines[_this.settings.engines.translator] && !translationEngines[_this.settings.engines.translator].languages.includes(lang.id));
			}
			render() {
				return [
					_this.createInterfaceLanguageSetting(() => {
						this.props.onInterfaceLanguageChange();
						BDFDB.ReactUtils.forceUpdate(this);
					}),
					BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormDivider, {
						className: BDFDB.disCN.marginbottom8
					}),
					BDFDB.ArrayUtils.is(_this.settings.exceptions.wordStart) && _this.settings.exceptions.wordStart.length && [
						BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Flex, {
							className: BDFDB.disCN.marginbottom8,
							children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsLabel, {
								label: _this.labels.exception_text.replace("{{var0}}", _this.settings.exceptions.wordStart.map(n => '"' + n + '"').join(", "))
							})
						}),
						BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormDivider, {
							className: BDFDB.disCN.marginbottom8
						})
					],
					Object.keys(_this.defaults.choices).map(place => {
						let isChannelSpecific = channelLanguages[this.props.channelId] && channelLanguages[this.props.channelId][place];
						let isGuildSpecific = !isChannelSpecific && guildLanguages[this.props.guildId] && guildLanguages[this.props.guildId][place];
						let placeLabel = place == messageTypes.RECEIVED ? _this.labels.popout_incoming : _this.labels.popout_outgoing;
						let inputName = _this.getLanguageName(languages[_this.getLanguageChoice(languageTypes.INPUT, place, this.props.channelId)]);
						let direction = languageTypes.OUTPUT;
						return [
							BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormItem, {
								title: `${placeLabel}: ${inputName} ➝ ${_this.labels.popout_translateTo}`,
								titleChildren: [{
									text: _ => isChannelSpecific ? _this.labels.language_selection_channel : isGuildSpecific ? _this.labels.language_selection_server : _this.labels.language_selection_global,
									name: isChannelSpecific || isGuildSpecific ? BDFDB.LibraryComponents.SvgIcon.Names.LOCK_CLOSED : BDFDB.LibraryComponents.SvgIcon.Names.LOCK_OPEN,
									color: isChannelSpecific ? "var(--status-danger)" : isGuildSpecific ? "var(--status-warning)" : null,
									onClick: _ => {
										if (channelLanguages[this.props.channelId] && channelLanguages[this.props.channelId][place]) {
											isChannelSpecific = false;
											delete channelLanguages[this.props.channelId][place];
											if (BDFDB.ObjectUtils.isEmpty(channelLanguages[this.props.channelId])) delete channelLanguages[this.props.channelId];
										}
										else if (guildLanguages[this.props.guildId] && guildLanguages[this.props.guildId][place]) {
											isGuildSpecific = false;
											isChannelSpecific = true;
											delete guildLanguages[this.props.guildId][place];
											if (BDFDB.ObjectUtils.isEmpty(guildLanguages[this.props.guildId])) delete guildLanguages[this.props.guildId];
											if (!channelLanguages[this.props.channelId]) channelLanguages[this.props.channelId] = {};
											channelLanguages[this.props.channelId][place] = {};
											for (let l in languageTypes) channelLanguages[this.props.channelId][place][languageTypes[l]] = _this.getLanguageChoice(languageTypes[l], place, null);
										}
										else {
											isGuildSpecific = true;
											if (!guildLanguages[this.props.guildId]) guildLanguages[this.props.guildId] = {};
											guildLanguages[this.props.guildId][place] = {};
											for (let l in languageTypes) guildLanguages[this.props.guildId][place][languageTypes[l]] = _this.getLanguageChoice(languageTypes[l], place, null);
										}
										BDFDB.DataUtils.save(channelLanguages, _this, "channelLanguages");
										BDFDB.DataUtils.save(guildLanguages, _this, "guildLanguages");
										
										BDFDB.ReactUtils.forceUpdate(this);
									}
								}, {
									iconSVG: `<svg width="21" height="21" fill="currentColor"><path d="M 0, 10.515 c 0, 2.892, 1.183, 5.521, 3.155, 7.361 L 0, 21.031 h 7.887 V 13.144 l -2.892, 2.892 C 3.549, 14.722, 2.629, 12.75, 2.629, 10.515 c 0 -3.418, 2.235 -6.309, 5.258 -7.492 v -2.629 C 3.418, 1.577, 0, 5.652, 0, 10.515 z M 21.031, 0 H 13.144 v 7.887 l 2.892 -2.892 C 17.482, 6.309, 18.402, 8.281, 18.402, 10.515 c 0, 3.418 -2.235, 6.309 -5.258, 7.492 V 20.768 c 4.469 -1.183, 7.887 -5.258, 7.887 -10.121 c 0 -2.892 -1.183 -5.521 -3.155 -7.361 L 21.031, 0 z"/></svg>`,
									onClick: _ => {
										let input = _this.getLanguageChoice(languageTypes.INPUT, place, this.props.channelId);
										let output = _this.getLanguageChoice(languageTypes.OUTPUT, place, this.props.channelId);
										input = input == "auto" ? "en" : input;
										
										_this.saveLanguageChoice(output, languageTypes.INPUT, place, this.props.channelId);
										_this.saveLanguageChoice(input, languageTypes.OUTPUT, place, this.props.channelId);
										
										_this.setLanguages();
										
										BDFDB.ReactUtils.forceUpdate(this);
									}
								}].map(data => {
									const icon = BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Clickable, {
										className: BDFDB.disCN._translatorconfigbutton,
										onClick: data.onClick,
										children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SvgIcon, {
											width: 24,
											height: 24,
											color: data.color || "currentColor",
											name: data.name,
											iconSVG: data.iconSVG
										})
									});
									return data.text ? BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TooltipContainer, {tooltipConfig: {type: "bottom"}, text: data.text, children: icon}) : icon;
								}),
								className: BDFDB.disCN.marginbottom8,
								children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Select, {
									value: _this.getLanguageChoice(direction, place, this.props.channelId),
									options: this.filterLanguages(direction, place),
									optionRenderer: lang => languages[lang.value] ? BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Flex, {
										align: BDFDB.LibraryComponents.Flex.Align.CENTER,
										children: [
											BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Flex.Child, {
												grow: 1,
												children: lang.label
											}),
											lang.backup && BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TooltipContainer, {
												text: _this.labels.backup_engine_warning,
												tooltipConfig: {
													color: "red"
												},
												children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SvgIcon, {
													nativeClass: true,
													width: 20,
													height: 20,
													color: "var(--status-danger)",
													name: BDFDB.LibraryComponents.SvgIcon.Names.WARNING
												})
											}),
											BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FavButton, {
												isFavorite: languages[lang.value].fav == 0,
												onClick: value => {
													if (value) favorites.push(lang.value);
													else BDFDB.ArrayUtils.remove(favorites, lang.value, true);
													BDFDB.DataUtils.save(favorites.sort(), _this, "favorites");
													_this.setLanguages();
												}
											})
										]
									}) : null,
									onChange: value => {
										_this.saveLanguageChoice(value, direction, place, this.props.channelId);
										BDFDB.ReactUtils.forceUpdate(this);
									}
								})
							}),
							BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormDivider, {
								className: BDFDB.disCN.marginbottom8
							})
						];
					}),
					_this.settings.general.autoTranslateIncoming && BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsLabel, {
						className: BDFDB.disCN.marginbottom8,
						label: _this.labels.popout_autoTranslationHelp
					}),
					_this.settings.general.autoTranslateIncoming && BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormItem, {
						title: _this.labels.popout_autoTranslationTarget,
						className: BDFDB.disCN.marginbottom8,
						children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Select, {
							value: _this.settings.autoTranslate.targetLang,
							options: (() => {
								const opts = Object.keys(languages).filter(k => !languages[k].auto && !languages[k].special).map(k => ({value: k, label: _this.getLanguageName(languages[k])})).sort((a, b) => a.label.localeCompare(b.label, _this.getInterfaceLanguage()));
								const dc = BDFDB.LanguageUtils.getLanguage().id;
								const sys = navigator.language.split("-")[0];
								opts.unshift({value: "_discord", label: `${_this.labels.settings_discordLanguage} (${_this.getLanguageName(BDFDB.LanguageUtils.languages[dc]) || dc})`});
								if (sys !== dc) opts.unshift({value: "_system", label: `${_this.labels.settings_systemLanguage} (${_this.getLanguageName(BDFDB.LanguageUtils.languages[sys]) || sys})`});
								return opts;
							})(),
							onChange: value => {
								_this.settings.autoTranslate.targetLang = value;
								BDFDB.DataUtils.save(_this.settings.autoTranslate, _this, "autoTranslate");
								BDFDB.ReactUtils.forceUpdate(this);
							}
						})
					}),
					Object.keys(_this.defaults.general).filter(key => _this.defaults.general[key].popout).map(key => BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
						type: "Switch",
						plugin: _this,
						keys: ["general", key],
						label: _this.labels[`general_${key}`] || _this.defaults.general[key].description,
						tag: BDFDB.LibraryComponents.FormTitle.Tags.H5,
						value: _this.settings.general[key]
					})),
					BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsItem, {
						type: "Switch",
						label: _this.labels.translate_your_message,
						tag: BDFDB.LibraryComponents.FormTitle.Tags.H5,
						value: _this.isTranslationEnabled(this.props.channelId),
						onChange: value => {
							_this.toggleTranslation(this.props.channelId);
							BDFDB.ReactUtils.forceUpdate(this);
						}
					})
				].flat(10).filter(n => n);
			}
		};

		const brailleConverter = {
			"0":"⠴", "1":"⠂", "2":"⠆", "3":"⠒", "4":"⠲", "5":"⠢", "6":"⠖", "7":"⠶", "8":"⠦", "9":"⠔", "!":"⠮", "\"":"⠐", "#":"⠼", "$":"⠫", "%":"⠩", "&":"⠯", "'":"⠄", "(":"⠷", ")":"⠾", "*":"⠡", "+":"⠬", ",":"⠠", "-":"⠤", ".":"⠨", "/":"⠌", ":":"⠱", ";":"⠰", "<":"⠣", "=":"⠿", ">":"⠜", "?":"⠹", "@":"⠈", "a":"⠁", "b":"⠃", "c":"⠉", "d":"⠙", "e":"⠑", "f":"⠋", "g":"⠛", "h":"⠓", "i":"⠊", "j":"⠚", "k":"⠅", "l":"⠇", "m":"⠍", "n":"⠝", "o":"⠕", "p":"⠏", "q":"⠟", "r":"⠗", "s":"⠎", "t":"⠞", "u":"⠥", "v":"⠧", "w":"⠺", "x":"⠭", "y":"⠽", "z":"⠵", "[":"⠪", "\\":"⠳", "]":"⠻", "^":"⠘", "⠁":"a", "⠂":"1", "⠃":"b", "⠄":"'", "⠅":"k", "⠆":"2", "⠇":"l", "⠈":"@", "⠉":"c", "⠊":"i", "⠋":"f", "⠌":"/", "⠍":"m", "⠎":"s", "⠏":"p", "⠐":"\"", "⠑":"e", "⠒":"3", "⠓":"h", "⠔":"9", "⠕":"o", "⠖":"6", "⠗":"r", "⠘":"^", "⠙":"d", "⠚":"j", "⠛":"g", "⠜":">", "⠝":"n", "⠞":"t", "⠟":"q", "⠠":", ", "⠡":"*", "⠢":"5", "⠣":"<", "⠤":"-", "⠥":"u", "⠦":"8", "⠧":"v", "⠨":".", "⠩":"%", "⠪":"[", "⠫":"$", "⠬":"+", "⠭":"x", "⠮":"!", "⠯":"&", "⠰":";", "⠱":":", "⠲":"4", "⠳":"\\", "⠴":"0", "⠵":"z", "⠶":"7", "⠷":"(", "⠸":"_", "⠹":"?", "⠺":"w", "⠻":"]", "⠼":"#", "⠽":"y", "⠾":")", "⠿":"=", "_":"⠸"
		};

		const morseConverter = {
			"0":"−−−−−", "1":"·−−−−", "2":"··−−−", "3":"···−−", "4":"····−", "5":"·····", "6":"−····", "7":"−−···", "8":"−−−··", "9":"−−−−·", "!":"−·−·−−", "\"":"·−··−·", "$":"···−··−", "&":"·−···", "'":"·−−−−·", "(":"−·−−·", ")":"−·−−·−", "+":"·−·−·", ",":"−−··−−", "-":"−····−", ".":"·−·−·−", "/":"−··−·", ":":"−−−···", ";":"−·−·−·", "=":"−···−", "?":"··−−··", "@":"·−−·−·", "a":"·−", "b":"−···", "c":"−·−·", "d":"−··", "e":"·", "f":"··−·", "g":"−−·", "h":"····", "i":"··", "j":"·−−−", "k":"−·−", "l":"·−··", "m":"−−", "n":"−·", "o":"−−−", "p":"·−−·", "q":"−−·−", "r":"·−·", "s":"···", "t":"−", "u":"··−", "v":"···−", "w":"·−−", "x":"−··−", "y":"−·−−", "z":"−−··", "·":"e", "··":"i", "···":"s", "····":"h", "·····":"5", "····−":"4", "···−":"v", "···−··−":"$", "···−−":"3", "··−":"u", "··−·":"f", "··−−··":"?", "··−−·−":"_", "··−−−":"2", "·−":"a", "·−·":"r", "·−··":"l", "·−···":"&", "·−··−·":"\"", "·−·−·":"+", "·−·−·−":".", "·−−":"w", "·−−·":"p", "·−−·−·":"@", "·−−−":"j", "·−−−−":"1", "·−−−−·":"'", "−":"t", "−·":"n", "−··":"d", "−···":"b", "−····":"6", "−····−":"-", "−···−":"=", "−··−":"x", "−··−·":"/", "−·−":"k", "−·−·":"c", "−·−·−·":";", "−·−·−−":"!", "−·−−":"y", "−·−−·":"(", "−·−−·−":")", "−−":"m", "−−·":"g", "−−··":"z", "−−···":"7", "−−··−−":",", "−−·−":"q", "−−−":"o", "−−−··":"8", "−−−···":":", "−−−−·":"9", "−−−−−":"0", "_":"··−−·−"
		};
		
		const googleLanguages = ["af","am","ar","az","be","bg","bn","bs","ca","ceb","co","cs","cy","da","de","el","en","eo","es","et","eu","fa","fi","fr","fy","ga","gd","gl","gu","ha","haw","hi","hmn","hr","ht","hu","hy","id","ig","is","it","iw","ja","jw","ka","kk","km","kn","ko","ku","ky","la","lb","lo","lt","lv","mg","mi","mk","ml","mn","mr","ms","mt","my","ne","nl","no","ny","or","pa","pl","ps","pt","ro","ru","rw","sd","si","sk","sl","sm","sn","so","sq","sr","st","su","sv","sw","ta","te","tg","th","tk","tl","tr","tt","ug","uk","ur","uz","vi","xh","yi","yo","zh-CN","zh-TW","zu"];

		// Smart filtering utilities
		const SKIP_RE = /^(wdym|wym|wyd|wyll|wyp|omw|otw|omfg|uwu|owo|idgaf|dgaf|idek|ime|istg|iykyk|hmu|ama|til|kys|sus|soz|urw|ynk|zoomer|gigachad|nepo|eta|vid|hru|ezpz|lmaoo|lmaooo|sussy|sumthn|ggez|lulw|imk|iono|icymi|og|smol|ngmi|copium|hopium|mald|wojak|omegalul|monkaw|kekw|rekt|fanum|wonk|bussin|sadge|baes|imba|defo|presh|yote|yike|finna|wat|probly|okies|okayy|ahaha|yaas|mwah|kbai|kbye|wildin|simpin|grindin|daammn|ymd|brainrot|lol|lmao|rofl|smh|ngl|tbh|btw|fyi|pog|bruh)[!?.,]*$/i;
		const CONS_RE = /^[bcdfghjklmnpqrstvwxz]{2,6}[!?.,]*$/i;
		const HASH_RE = /^[A-Fa-f0-9]{12,}$/;
		const RULE_RE = /^[\s\-=*_~`>|[\]()]+$/;
		const DICE_RE = /^\d+d\d+(\s*[,+\-=].*)?$/i;
		const CJK_RE = /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}\p{Script=Thai}]/u;
		const NOISE_RE = /[ \t]{2,}|https?:\/\/\S+|[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+|\b\d{1,3}(?:\.\d{1,3}){3}\b|\+\d[\d\s().-]{6,}\d|\b(?:[a-z0-9-]+\.)+[a-z]{2,}\/\S*|```[\s\S]*?```|`[^`]+`|\|\||<a?:[a-zA-Z0-9_]+:\d+>|<@!?&?\d+>|<#\d+>|<t:-?\d+(?::[tTdDfFR])?>|<\/[^\s>][^>]*:\d+>|<[^>\n]*>|</gi;
		const ASCII_RE = /^[\x20-\x7E]+$/;

		function junk(text) {
			if (SKIP_RE.test(text) || CONS_RE.test(text)) return true;
			const words = text.toLowerCase().split(/\s+/).filter(Boolean);
			if (words.length < 2) {
				if (/(.)\1{3,}/.test(text)) return true;
				if (ASCII_RE.test(text) && text.replace(/(.)\1+/g, "$1").length < 3) return true;
			}
			const letters = text.match(/\p{L}/gu);
			if (!letters || (letters.length < 2 && !CJK_RE.test(text))) return true;
			if (HASH_RE.test(text) || RULE_RE.test(text) || DICE_RE.test(text)) return true;
			if (text.length >= 8 && letters.length / text.length < 0.4) return true;
			return words.length >= 3 && words.every((w) => w === words[0]);
		}

		// письменности: если сообщение уже написано алфавитом целевого языка,
		// движку его отдавать незачем — это самый частый холостой запрос
		const SCRIPT_RES = {
			cyrl: /\p{Script=Cyrillic}/gu,
			grek: /\p{Script=Greek}/gu,
			hebr: /\p{Script=Hebrew}/gu,
			arab: /\p{Script=Arabic}/gu,
			deva: /\p{Script=Devanagari}/gu,
			hang: /\p{Script=Hangul}/gu,
			thai: /\p{Script=Thai}/gu,
			armn: /\p{Script=Armenian}/gu,
			geor: /\p{Script=Georgian}/gu,
			jpan: /[\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Han}]/gu,
			hani: /\p{Script=Han}/gu
		};
		const LANG_SCRIPTS = {
			ru: "cyrl", uk: "cyrl", be: "cyrl", bg: "cyrl", sr: "cyrl", mk: "cyrl",
			kk: "cyrl", ky: "cyrl", mn: "cyrl", tg: "cyrl",
			el: "grek", he: "hebr", iw: "hebr", ar: "arab", fa: "arab", ur: "arab", ps: "arab",
			hi: "deva", mr: "deva", ne: "deva", ko: "hang", th: "thai", hy: "armn", ka: "geor",
			ja: "jpan", zh: "hani"
		};
		// внутри кириллицы различаем соседей по характерным буквам, иначе украинский
		// или сербский молча сойдёт за русский и останется без перевода
		const CYRL_MARKERS = {
			ru: /[ыэё]/i, uk: /[їієґ]/i, be: /ў/i, sr: /[ђћњљ]/i, mk: /[ѓќ]/i,
			kk: /[әғқңұһ]/i, ky: /[өүң]/i, tg: /[ӯҳҷ]/i, mn: /[өү]/i,
			bg: /(^|\W)(ще|съм|няма|това|защото)(\W|$)/i
		};
		// у языков без собственных примет (ru, bg) признак — отсутствие чужих;
		// остальным требуем свою примету, иначе русский текст сойдёт за них
		const CYRL_NEEDS_OWN = {uk: true, be: true, sr: true, mk: true, kk: true, ky: true, tg: true, mn: true};
		const KANA_RE = /[\p{Script=Hiragana}\p{Script=Katakana}]/u;

		function sameScriptAsTarget(text, target) {
			if (!target) return false;
			const lang = LANG_SCRIPTS[target] ? target : target.split("-")[0].toLowerCase();
			const script = LANG_SCRIPTS[lang];
			// латиница общая для десятков языков — по ней судить нельзя, идём в движок
			if (!script) return false;
			const letters = text.match(/\p{L}/gu);
			if (!letters || letters.length < 3) return false;
			if ((text.match(SCRIPT_RES[script]) || []).length / letters.length < 0.85) return false;
			if (script == "cyrl") {
				for (const other in CYRL_MARKERS) if (other != lang && CYRL_MARKERS[other].test(text)) return false;
				if (CYRL_NEEDS_OWN[lang] && !CYRL_MARKERS[lang].test(text)) return false;
			}
			// каной отличаем японский от китайского: иероглифы сами по себе неоднозначны
			if (script == "jpan" && !KANA_RE.test(text)) return false;
			if (script == "hani" && KANA_RE.test(text)) return false;
			return true;
		}

		function shouldSkip(raw, translated) {
			const rawLower = raw.toLowerCase();
			const rawWords = rawLower.match(/\p{L}+/gu);
			if (!rawWords?.length) return false;
			const transLower = translated.toLowerCase();
			const transWords = new Set(transLower.match(/\p{L}+/gu) || []);
			const rawSet = new Set(rawWords);
			if (rawWords.every((w) => w.length >= 3 ? transLower.includes(w) : transWords.has(w))) return true;
			if ([...transWords].every((w) => w.length >= 3 ? rawLower.includes(w) : rawSet.has(w))) return true;
			const removed = [...rawSet].filter((w) => !transWords.has(w));
			return removed.length > 0 && removed.every((w) => SKIP_RE.test(w) || CONS_RE.test(w));
		}

		const translationEngines = {
			googleapi: {
				name: "Google",
				auto: true,
				funcName: "googleApiTranslate",
				languages: googleLanguages
			},
	
			libretranslate: {
				name: "LibreTranslate",
				auto: true,
				funcName: "libreTranslate",
				languages: googleLanguages,
				endpoint: "https://translate.argosopentech.com"
			},
			googlepa: {
				name: "Google PA",
				auto: true,
				funcName: "googlePaTranslate",
				batchFuncName: "googlePaTranslateBatch",
				languages: googleLanguages
			},
			googlegtx: {
				name: "Google GTX",
				auto: true,
				funcName: "googleGtxTranslate",
				batchFuncName: "googleGtxTranslateBatch",
				languages: googleLanguages
			},
			simplytranslate: {
				name: "SimplyTranslate",
				auto: true,
				funcName: "simplyTranslate",
				languages: googleLanguages
			}
		};
		
		var languages = {};
		var favorites = [];
		var authKeys = {};
		var channelLanguages = {}, guildLanguages = {};
		var translationEnabledStates = [], isTranslating, activeTranslations = 0;
		var translatedMessages = {}, oldMessages = {};
		var autoTranslatedIds = new Set();
		// очередь авто-перевода: без неё открытие канала выстреливает по запросу
		// на каждое сообщение сразу — движок отдаёт 429 и всё висит до таймаута
		var autoQueue = [], autoActive = 0, autoPumping = false, autoRerenderTimeout = null;
		var autoCache = new Map();
		var engineHealth = {};
		const AUTO_MAX_CONCURRENT = 3, AUTO_MAX_QUEUE = 60, AUTO_CACHE_MAX = 500, AUTO_RERENDER_DELAY = 300;
		const AUTO_BATCH_SIZE = 8, AUTO_BATCH_CHARS = 1800, AUTO_BATCH_TIMEOUT = 12000;
		const ENGINE_FAIL_LIMIT = 3, ENGINE_COOLDOWN = 60000;
		
		const defaultLanguages = {
			INPUT: "auto",
			OUTPUT: "$discord"
		};
		const languageTypes = {
			INPUT: "input",
			OUTPUT: "output"
		};
		const messageTypes = {
			RECEIVED: "received",
			SENT: "sent",
		};
	
		return class Translator extends Plugin {
			onLoad () {
				_this = this;
				
				this.defaults = {
					general: {
						interfaceLanguage:		{value: "ru"},
						addTranslateButton:		{value: true, 	popout: false},
						addQuickTranslateButton:	{value: true, 	popout: false},
						usePerChatTranslation:		{value: true, 	popout: false},
						sendOriginalMessage:		{value: false, 	popout: true},
						showOriginalMessage:		{value: false, 	popout: true},
						useSpoilerInOriginal:		{value: false, 	popout: false,	description: "Use Spoilers instead of Quotes for the original Message Text"},
						autoTranslateIncoming:		{value: false, 	popout: true,	description: "Automatically translate incoming messages"}
					},
					autoTranslate: {
						targetLang:			{value: "_discord"},
						translateDMs:		{value: false},
						skipLangs:			{value: []},
						invertSkip:			{value: false},
						skipSameScript:		{value: true}
					},
					choices: {},
					exceptions: {
						wordStart:			{value: ["!"],	max: 3}
					},
					prefixes: {
						translationPrefixData: 		{value: [
							{prefix: "$fr", language: "fr"},
							{prefix: "$de", language: "de"},
							{prefix: "$es", language: "es"},
							{prefix: "$jp", language: "ja"}
						]}
					},
					engines: {
						translator:			{value: "googlepa"},
						backup:				{value: "googlegtx"}
					}
				};
				for (let m in messageTypes) this.defaults.choices[messageTypes[m]] = {value: Object.keys(languageTypes).reduce((newObj, l) => (newObj[languageTypes[l]] = defaultLanguages[l], newObj), {})};
			
				this.modulePatches = {
					before: [
						"ChannelTextAreaContainer",
						"ChannelTextAreaEditor",
						"Embed",
						"MessageReply",
						"Messages"
					],
					after: [
						"ChannelTextAreaButtons",
						"Embed",
						"MessageButtons",
						"MessageContent"
					]
				};

				this.css = `
					${BDFDB.dotCN._translatortranslatebutton + BDFDB.dotCNS._translatortranslating + BDFDB.dotCN.textareaicon} {
						color: var(--status-danger) !important;
					}
					${BDFDB.dotCN._translatorconfigbutton} {
						margin: 2px 3px 0 6px;
					}
					.at-outer {
						display: grid;
						grid-template-columns: minmax(0, 1fr);
					}
					.at-trans, .at-orig {
						grid-area: 1 / 1;
						min-width: 0;
					}
					.at-orig { visibility: hidden; }
					[id^="chat-messages-"]:hover .at-orig { visibility: visible; }
					[id^="chat-messages-"]:hover .at-trans { visibility: hidden; }
					.at-tag {
						display: inline-flex;
						align-items: center;
						gap: 4px;
						padding: 4px 6px 4px 10px;
						background: var(--background-mod-strong);
						color: var(--text-default);
						border-radius: 3px;
						font-size: 0.875rem;
						line-height: 20px;
					}
				`;
			}
			
			onStart () {
				BDFDB.PatchUtils.patch(this, BDFDB.LibraryModules.MessageUtils, "startEditMessage", {before: e => {
					if (e.methodArguments[1] && oldMessages[e.methodArguments[1]] && oldMessages[e.methodArguments[1]].content) e.methodArguments[2] = oldMessages[e.methodArguments[1]].content;
				}});
				BDFDB.PatchUtils.patch(this, BDFDB.LibraryModules.MessageUtils, "editMessage", {before: e => {
					delete translatedMessages[e.methodArguments[1]];
					delete oldMessages[e.methodArguments[1]];
				}});
				BDFDB.PatchUtils.patch(this, BDFDB.LibraryModules.MessageToolbarUtils, "useMessageMenu", {after: e => {
					if (e.instance.props.message && e.instance.props.channel) {
						let ownIds = [BDFDB.ContextMenuUtils.createItemId(this.name, "translate-message"), BDFDB.ContextMenuUtils.createItemId(this.name, "untranslate-message")];
						if (BDFDB.ContextMenuUtils.findItem(e.returnValue, {id: ownIds})[1] > -1) return;
						let translated = !!translatedMessages[e.instance.props.message.id];
						let [children, index] = BDFDB.ContextMenuUtils.findItem(e.returnValue, {id: ["copy-text", "pin", "unpin"]});
						if (index == -1) [children, index] = BDFDB.ContextMenuUtils.findItem(e.returnValue, {id: ["edit", "add-reaction", "add-reaction-1", "quote"]});
						children.splice(index + 1, 0, BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuItem, {
							label: translated ? this.labels.context_messageuntranslateoption : this.labels.context_messagetranslateoption,
							disabled: isTranslating,
							id: BDFDB.ContextMenuUtils.createItemId(this.name, translated ? "untranslate-message" : "translate-message"),
							icon: _ => BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.MenuItems.MenuIcon, {
								icon: translated ? translateIconUntranslate : translateIcon
							}),
							action: _ => this.translateMessage(e.instance.props.message, e.instance.props.channel)
						}));
					}
				}});
				this.forceUpdateAll();
			}
			
			onStop () {
				this.forceUpdateAll();
			}

			getSettingsPanel (collapseStates = {}) {
				let settingsPanel;
				return settingsPanel = BDFDB.PluginUtils.createSettingsPanel(this, {
					collapseStates: collapseStates,
					children: _ => {
						let settingsItems = [];
						settingsItems.push(this.createInterfaceLanguageSetting(() => BDFDB.PluginUtils.refreshSettingsPanel(this, settingsPanel)));
						settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormDivider, {
							className: BDFDB.disCNS.dividerdefault + BDFDB.disCN.marginbottom8
						}));
						
						settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormTitle.Title, {
							className: BDFDB.disCN.marginbottom8,
							tag: BDFDB.LibraryComponents.FormTitle.Tags.H4,
							children: this.labels.settings_manualTranslation
						}));
						for (let key of Object.keys(this.defaults.general).filter(key => key !== "interfaceLanguage")) settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
							type: "Switch",
							plugin: this,
							keys: ["general", key],
							label: this.labels[`general_${key}`] || this.defaults.general[key].description,
							value: this.settings.general[key]
						}));
						
						settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormDivider, {
							className: BDFDB.disCNS.dividerdefault + BDFDB.disCN.marginbottom8
						}));

						settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormTitle.Title, {
							className: BDFDB.disCN.marginbottom8,
							tag: BDFDB.LibraryComponents.FormTitle.Tags.H4,
							children: this.labels.settings_engines
						}));
						for (let key in this.defaults.engines) settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormItem, {
							title: this.labels[`${key}_engine`],
							className: BDFDB.disCN.marginbottom8,
							children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Select, {
								value: this.settings.engines[key],
								options: (key == "backup" ? ["----"] : []).concat(Object.keys(translationEngines)).filter(key == "backup" ? (n => n != this.settings.engines.translator) : (n => n)).map(engineKey => ({value: engineKey, label: translationEngines[engineKey] ? translationEngines[engineKey].name : "----"})),
								maxVisibleItems: 3,
								onChange: value => {
									this.settings.engines[key] = value;
									BDFDB.DataUtils.save(this.settings.engines, this, "engines");
									this.setLanguages();
									this.SettingsUpdated = true;
								}
							})
						}));

						settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormDivider, {
							className: BDFDB.disCNS.dividerdefault + BDFDB.disCN.marginbottom8
						}));

						if (this.settings.general.autoTranslateIncoming) {
							const langOptions = Object.keys(languages).filter(k => !languages[k].auto && !languages[k].special).map(k => ({
								value: k,
								label: this.getLanguageName(languages[k])
							})).sort((a, b) => a.label.localeCompare(b.label, this.getInterfaceLanguage()));
							const discordLocale = BDFDB.LanguageUtils.getLanguage().id;
							const systemLocale = navigator.language.split("-")[0];
							langOptions.unshift({value: "_discord", label: `${this.labels.settings_discordLanguage} (${this.getLanguageName(BDFDB.LanguageUtils.languages[discordLocale]) || discordLocale})`});
							if (systemLocale !== discordLocale) langOptions.unshift({value: "_system", label: `${this.labels.settings_systemLanguage} (${this.getLanguageName(BDFDB.LanguageUtils.languages[systemLocale]) || systemLocale})`});
							
							settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormTitle.Title, {
								className: BDFDB.disCN.marginbottom8,
								tag: BDFDB.LibraryComponents.FormTitle.Tags.H4,
								children: this.labels.settings_autoTranslation
							}));
							settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormItem, {
								title: this.labels.autoTranslate_targetLang,
								className: BDFDB.disCN.marginbottom8,
								children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Select, {
									value: this.settings.autoTranslate.targetLang,
									options: langOptions,
									onChange: value => {
										this.settings.autoTranslate.targetLang = value;
										BDFDB.DataUtils.save(this.settings.autoTranslate, this, "autoTranslate");
										this.SettingsUpdated = true;
									}
								})
							}));
							settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
								type: "Switch",
								plugin: this,
								keys: ["autoTranslate", "translateDMs"],
								label: this.labels.autoTranslate_translateDMs,
								value: this.settings.autoTranslate.translateDMs
							}));
							settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
								type: "Switch",
								plugin: this,
								keys: ["autoTranslate", "skipSameScript"],
								label: this.labels.settings_skipSameScript,
								value: this.settings.autoTranslate.skipSameScript !== false
							}));
							settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
								type: "Switch",
								plugin: this,
								keys: ["autoTranslate", "invertSkip"],
								label: this.labels.autoTranslate_invertSkip,
								value: this.settings.autoTranslate.invertSkip
							}));
							settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormItem, {
								title: this.labels.settings_languageCodes,
								className: BDFDB.disCN.marginbottom8,
								children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TextInput, {
									placeholder: "ru, fr, de",
									value: (this.settings.autoTranslate.skipLangs || []).join(", "),
									onChange: value => {
										this.settings.autoTranslate.skipLangs = value.split(",").map(s => s.trim()).filter(Boolean);
										BDFDB.DataUtils.save(this.settings.autoTranslate, this, "autoTranslate");
										this.SettingsUpdated = true;
									}
								})
							}));
							settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormDivider, {
								className: BDFDB.disCNS.dividerdefault + BDFDB.disCN.marginbottom8
							}));
						}
						
						
						settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormItem, {
							title: this.labels.prefixes_disable_text,
							className: BDFDB.disCN.marginbottom8,
							children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ListInput, {
								placeholder: this.labels.settings_exceptionPrefix,
								maxLength: this.defaults.exceptions.wordStart.max,
								items: this.settings.exceptions.wordStart,
								onChange: value => {
									this.SettingsUpdated = true;
									BDFDB.DataUtils.save(value, this, "exceptions", "wordStart");
								}
							})
						}));
						
						settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormItem, {
							title: this.labels.prefixes_enable_text,
							className: BDFDB.disCN.marginbottom8,
							children: [								
								// Create a table-like layout for prefixes and language selection
								...(this.settings.prefixes.translationPrefixData || []).map((entry, index) => {
									return BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Flex, {
										className: BDFDB.disCN.marginbottom8,
										align: BDFDB.LibraryComponents.Flex.Align.CENTER,
										children: [
											// Prefix input
											BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Flex.Child, {
												grow: 0,
												shrink: 0,
												basis: "30%",
												children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TextInput, {
													placeholder: this.labels.settings_languagePrefix,
													value: entry.prefix,
													onChange: value => {
														this.settings.prefixes.translationPrefixData[index].prefix = value;
														BDFDB.DataUtils.save(this.settings.prefixes.translationPrefixData, this, "prefixes", "translationPrefixData");
														this.SettingsUpdated = true;
													}
												})
											}),
											
											// Language selection dropdown
											BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Flex.Child, {
												grow: 1,
												shrink: 0,
												basis: "60%",
												children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Select, {
													value: entry.language,
													options: Object.keys(languages)
														.filter(key => !languages[key].auto && !languages[key].special)
														.map(key => ({
															value: key,
															label: this.getLanguageName(languages[key])
														}))
														.sort((a, b) => a.label.localeCompare(b.label, this.getInterfaceLanguage())),
													onChange: value => {
														this.settings.prefixes.translationPrefixData[index].language = value;
														BDFDB.DataUtils.save(this.settings.prefixes.translationPrefixData, this, "prefixes", "translationPrefixData");
														this.SettingsUpdated = true;
													}
												})
											}),
											
											// Delete button
											BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Flex.Child, {
												grow: 0,
												shrink: 0,
												basis: "10%",
												children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Button, {
													color: BDFDB.LibraryComponents.Button.Colors.RED,
													size: BDFDB.LibraryComponents.Button.Sizes.TINY,
													onClick: _ => {
														this.settings.prefixes.translationPrefixData.splice(index, 1);
														BDFDB.DataUtils.save(this.settings.prefixes.translationPrefixData, this, "prefixes", "translationPrefixData");
														this.SettingsUpdated = true;
														BDFDB.ReactUtils.forceUpdate(this);
													},
													children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SvgIcon, {
														name: BDFDB.LibraryComponents.SvgIcon.Names.TRASH,
														width: 16,
														height: 16
													})
												})
											})
										]
									});
								}),

								BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsItem, {
									type: "Button",
									color: BDFDB.LibraryComponents.Button.Colors.GREEN,
									onClick: _ => {
										// Initialize if not exists
										if (!this.settings.prefixes.translationPrefixData) this.settings.prefixes.translationPrefixData = [];
										
										// Add new entry with default values
										this.settings.prefixes.translationPrefixData.push({
											prefix: "$en",
											language: "en"
										});
										
										BDFDB.DataUtils.save(this.settings.prefixes.translationPrefixData, this, "prefixes", "translationPrefixData");
										this.SettingsUpdated = true;
										BDFDB.ReactUtils.forceUpdate(this);
									},
									children: this.labels.settings_addPrefix
								})
							]
						}));
						
						return settingsItems.flat(10).filter(n => n);
					}
				});
			}
		
			onSettingsClosed () {
				if (this.SettingsUpdated) {
					delete this.SettingsUpdated;
					this.forceUpdateAll();
				}
			}
		
			forceUpdateAll () {
				favorites = BDFDB.DataUtils.load(this, "favorites");
				favorites = !BDFDB.ArrayUtils.is(favorites) ? [] : favorites;
				
				authKeys = BDFDB.DataUtils.load(this, "authKeys");
				channelLanguages = BDFDB.DataUtils.load(this, "channelLanguages");
				guildLanguages = BDFDB.DataUtils.load(this, "guildLanguages");
				
				translationEnabledStates = BDFDB.DataUtils.load(this, "translationEnabledStates");
				translationEnabledStates = BDFDB.ArrayUtils.is(translationEnabledStates) ? translationEnabledStates : [];
				
				autoTranslatedIds = new Set();
				autoQueue = [];
				autoCache.clear();
				engineHealth = {};
				BDFDB.TimeUtils.clear(autoRerenderTimeout);
				autoRerenderTimeout = null;

				this.setLanguages();
				BDFDB.PatchUtils.forceAllUpdates(this);
				BDFDB.MessageUtils.rerenderAll();
			}

			onMessageContextMenu (e) {
				if (e.instance.props.message && e.instance.props.channel) {
					let ownIds = [BDFDB.ContextMenuUtils.createItemId(this.name, "translate-message"), BDFDB.ContextMenuUtils.createItemId(this.name, "untranslate-message")];
					if (BDFDB.ContextMenuUtils.findItem(e.returnvalue, {id: ownIds})[1] == -1) {
					let translated = !!translatedMessages[e.instance.props.message.id];
					let hint = BDFDB.BDUtils.isPluginEnabled("MessageUtilities") ? BDFDB.BDUtils.getPlugin("MessageUtilities").getActiveShortcutString("__Translate_Message") : null;
					let [children, index] = BDFDB.ContextMenuUtils.findItem(e.returnvalue, {id: ["copy-text", "pin", "unpin"]});
					if (index == -1) [children, index] = BDFDB.ContextMenuUtils.findItem(e.returnvalue, {id: ["edit", "add-reaction", "add-reaction-1", "quote"]});
					children.splice(index > -1 ? index + 1 : 0, 0, BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuItem, {
						label: translated ? this.labels.context_messageuntranslateoption : this.labels.context_messagetranslateoption,
						id: BDFDB.ContextMenuUtils.createItemId(this.name, translated ? "untranslate-message" : "translate-message"),
						icon: hint && (_ => BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.MenuItems.MenuHint, {
							hint: hint
						})),
						icon: _ => BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.MenuItems.MenuIcon, {
							icon: translated ? translateIconUntranslate : translateIcon
						}),
						disabled: !translated && isTranslating,
						action: _ => this.translateMessage(e.instance.props.message, e.instance.props.channel)
					}));
					}
					this.injectSearchItem(e, false);
				}
			}
			
			onTextAreaContextMenu (e) {
				this.injectSearchItem(e, true);
			}
			
			injectSearchItem (e, ownMessage) {
				let text = document.getSelection().toString();
				if (text) {
					let translating, foundTranslation, foundInput, foundOutput, copied;
					let [children, index] = BDFDB.ContextMenuUtils.findItem(e.returnvalue, {id: ["devmode-copy-id", "search-google"], group: true});
					children.splice(index > -1 ? index + 1 : 0, 0, BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuGroup, {
						children: BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuItem, {
							id: BDFDB.ContextMenuUtils.createItemId(this.name, "search-translation"),
							icon: _ => BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.MenuItems.MenuIcon, {
								icon: translateIcon
							}),
							disabled: isTranslating,
							label: this.labels.context_translator,
							persisting: true,
							action: event => {
								let item = BDFDB.DOMUtils.getParent(BDFDB.dotCN.menuitem, event.target);
								if (item) {
									let createTooltip = _ => {
										BDFDB.TooltipUtils.create(item, !foundTranslation ? this.labels.toast_translating_failed : [
											`${this.labels.tooltip_from} ${this.getLanguageName(foundInput)}:`,
											text,
											`${this.labels.tooltip_to} ${this.getLanguageName(foundOutput)}:`,
											foundTranslation
										].map(n => BDFDB.ReactUtils.createElement("div", {children: n})), {
											type: "right",
											color: foundTranslation ? "primary" : "red",
											className: "googletranslate-tooltip"
										});
									};
									if (foundTranslation && foundInput && foundOutput) {
										if (document.querySelector(".googletranslate-tooltip")) {
											if (!copied) {
												copied = true;
												BDFDB.LibraryModules.WindowUtils.copy(foundTranslation);
												BDFDB.NotificationUtils.toast(this.labels.toast_copied, {type: "success"});
											}
											else {
												BDFDB.ContextMenuUtils.close(e.instance);
												BDFDB.DiscordUtils.openLink(this.getGoogleTranslatePageURL(foundInput.id, foundOutput.id, text));
											}
										}
										else createTooltip();
									}
									else if (!translating) {
										translating = true;
										this.translateText(text, ownMessage ? messageTypes.SENT : messageTypes.RECEIVED, (translation, input, output) => {
											if (translation) {
												foundTranslation = translation, foundInput = input, foundOutput = output;
												createTooltip();
											}
											else createTooltip();
										});
									}
								}
							}
						})
					}));
				}
			}
			
			processMessageButtons (e) {
				if (!this.settings.general.addQuickTranslateButton || !e.instance.props.message || !e.instance.props.channel) return;
				let [children, index] = BDFDB.ReactUtils.findParent(e.returnvalue, {props: [["className", BDFDB.disCN.messagebuttons]]});
				if (index == -1) return;
				let translated = !!translatedMessages[e.instance.props.message.id];
				children.unshift(BDFDB.ReactUtils.createElement(class extends BdApi.React.Component {
					render() {
						return BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TooltipContainer, {
							key: translated ? "untranslate-message" : "translate-message",
							text: _ => translated ? _this.labels.context_messageuntranslateoption : _this.labels.context_messagetranslateoption,
							tooltipConfig: {className: BDFDB.disCN.messagetoolbartooltip},
							children: BDFDB.ReactUtils.createElement("div", {
								className: BDFDB.disCNS.messagetoolbarhoverbutton + BDFDB.disCN.messagetoolbarbutton,
								onClick: _ => {
									if (!isTranslating) _this.translateMessage(e.instance.props.message, e.instance.props.channel).then(_ => {
										translated = !!translatedMessages[e.instance.props.message.id];
										BDFDB.ReactUtils.forceUpdate(this);
									});
								},
								children: BDFDB.ReactUtils.createElement("div", {
									className: BDFDB.disCNS.messagetoolbaricon + BDFDB.disCN.messagetoolbarbuttoncontent,
									children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SvgIcon, {
										className: BDFDB.disCN.messagetoolbaricon,
										nativeClass: true,
										iconSVG: translated ? translateIconUntranslate : translateIcon
									})
								})
							})
						});
					}
				}));
			}
			
			processChannelTextAreaContainer (e) {
				if (e.instance.props.type != BDFDB.DiscordConstants.ChannelTextAreaTypes.NORMAL && e.instance.props.type != BDFDB.DiscordConstants.ChannelTextAreaTypes.SIDEBAR) return;
				BDFDB.PatchUtils.patch(this, e.instance.props, "onSubmit", {instead: e2 => {
					if (e2.methodArguments[0].value) {
						const text = e2.methodArguments[0].value;
						
						// Check for translation prefixes
						const prefixMap = {};
						const prefixData = this.settings.prefixes && this.settings.prefixes.translationPrefixData || [];
						for (const entry of prefixData) {
							prefixMap[entry.prefix] = entry.language;
						}
						
						let foundPrefix = null;
						let targetLanguage = null;
						
						// Check for prefixes more efficiently
						for (const prefix in prefixMap) {
							if (text.trim().startsWith(prefix)) {
								foundPrefix = prefix;
								targetLanguage = prefixMap[prefix];
								break;
							}
						}
						
						if (foundPrefix) {
							e2.stopOriginalMethodCall();
							// Remove the prefix from the message
							const cleanText = text.trim().substring(foundPrefix.length).trim();
							
							// Translate with the specific target language
							this.translateText(cleanText, messageTypes.SENT, (translation, input, output) => {
								// Override the output language with the one from the prefix
								output = {id: targetLanguage, name: languages[targetLanguage] ? languages[targetLanguage].name : targetLanguage};
								
								translation = !translation ? cleanText : (this.settings.general.sendOriginalMessage ? (translation + (!this.settings.general.useSpoilerInOriginal ? ("\n\n> *" + cleanText.split("\n").join("*\n> *") + "*").replace(/> \*\*\n/g, "> \n") : `\n\n||${cleanText}||`)) : translation);
								e2.originalMethod(Object.assign({}, e2.methodArguments[0], {value: translation}));
							}, targetLanguage);
							
							return Promise.resolve({
								shouldClear: true,
								shouldRefocus: true
							});
						}
						else if (this.isTranslationEnabled(e.instance.props.channel.id)) {
							e2.stopOriginalMethodCall();
							this.translateText(e2.methodArguments[0].value, messageTypes.SENT, (translation, input, output) => {
								translation = !translation ? e2.methodArguments[0].value : (this.settings.general.sendOriginalMessage ? (translation + (!this.settings.general.useSpoilerInOriginal ? ("\n\n> *" + e2.methodArguments[0].value.split("\n").join("*\n> *") + "*").replace(/> \*\*\n/g, "> \n") : `\n\n||${e2.methodArguments[0].value}||`)) : translation);
								e2.originalMethod(Object.assign({}, e2.methodArguments[0], {value: translation}));
							});
							return Promise.resolve({
								shouldClear: true,
								shouldRefocus: true
							});
						}
					}
					return e2.callOriginalMethodAfterwards();
				}}, {noCache: true});
			}

			processChannelTextAreaEditor (e) {
				if (this.isTranslationEnabled(e.instance.props.channel.id) && isTranslating) e.instance.props.disabled = true;
			}
			
			processChannelTextAreaButtons (e) {
				if (!this.settings.general.addTranslateButton || e.instance.props.disabled || e.instance.props.type != BDFDB.DiscordConstants.ChannelTextAreaTypes.NORMAL && e.instance.props.type != BDFDB.DiscordConstants.ChannelTextAreaTypes.SIDEBAR) return;
				if (e.returnvalue) e.returnvalue.props.children.unshift(BDFDB.ReactUtils.createElement(TranslateButtonComponent, {
					guildId: e.instance.props.channel.guild_id ? e.instance.props.channel.guild_id : "@me",
					channelId: e.instance.props.channel.id
				}));
			}

			processMessages (e) {
				e.instance.props.channelStream = [].concat(e.instance.props.channelStream);
				const channel = e.instance.props.channel;
				const autoTranslate = this.settings.general.autoTranslateIncoming && channel;
				for (let i in e.instance.props.channelStream) {
					let message = e.instance.props.channelStream[i].content;
					if (message) {
						if (BDFDB.ArrayUtils.is(message)) {
							for (let j in message) {
								let childMessage = message[j].content;
								if (childMessage) {
									this.checkMessage(message[j], childMessage);
									if (autoTranslate) this.autoTranslateMessage(childMessage, channel);
								}
							}
						}
						else {
							this.checkMessage(e.instance.props.channelStream[i], message);
							if (autoTranslate) this.autoTranslateMessage(message, channel);
						}
					}
				}
			}

			autoTranslateMessage (message, channel) {
				if (!message || !message.id || !message.content || autoTranslatedIds.has(message.id) || translatedMessages[message.id]) return;
				const myId = BDFDB.LibraryStores.UserStore.getCurrentUser()?.id;
				if (message.author?.id === myId || message.author?.bot) return;
				const at = this.settings.autoTranslate;
				const channelObj = channel && BDFDB.LibraryStores.ChannelStore.getChannel(channel.id || channel);
				if (channelObj && channelObj.isPrivate && channelObj.isPrivate() && !at.translateDMs) return;
				const raw = message.content;
				const stripped = raw.replace(NOISE_RE, "").trim();
				if (!raw || raw.length < 2 || stripped.length < 2 || junk(stripped)) return;
				let targetLangCode;
				if (at.targetLang === "_system") targetLangCode = navigator.language.split("-")[0];
				else if (at.targetLang === "_discord" || !at.targetLang) targetLangCode = this.getDiscordLanguageId();
				else targetLangCode = at.targetLang;
				if (!targetLangCode || targetLangCode === "auto") return;
				autoTranslatedIds.add(message.id);
				if (at.skipSameScript !== false && sameScriptAsTarget(stripped, targetLangCode)) return;
				this.pruneCaches();
				autoQueue.push({message, raw, targetLangCode, at});
				// хвост очереди — самые свежие сообщения, они и видны на экране
				if (autoQueue.length > AUTO_MAX_QUEUE) autoQueue.splice(0, autoQueue.length - AUTO_MAX_QUEUE);
				this.pumpAutoQueue();
			}

			pumpAutoQueue () {
				if (autoPumping) return;
				autoPumping = true;
				while (autoActive < AUTO_MAX_CONCURRENT && autoQueue.length) {
					const job = autoQueue.pop();
					if (this.takeAutoCache(job)) continue;
					const batch = [job];
					// добираем соседей с тем же целевым языком — уйдут одним запросом
					if (this.canBatchAuto(job)) {
						let chars = job.raw.length;
						for (let i = autoQueue.length - 1; i >= 0 && batch.length < AUTO_BATCH_SIZE; i--) {
							const next = autoQueue[i];
							if (next.targetLangCode != job.targetLangCode || !this.canBatchAuto(next)) continue;
							if (chars + next.raw.length > AUTO_BATCH_CHARS) break;
							autoQueue.splice(i, 1);
							if (this.takeAutoCache(next)) continue;
							chars += next.raw.length;
							batch.push(next);
						}
					}
					autoActive++;
					if (batch.length > 1) this.runAutoBatch(batch);
					else this.runAutoTranslation(job);
				}
				autoPumping = false;
			}

			autoCacheKey (job) {
				return job.targetLangCode + "\u0000" + job.raw;
			}

			takeAutoCache (job) {
				const cached = autoCache.get(this.autoCacheKey(job));
				if (!cached) return false;
				this.applyAutoTranslation(job, cached.translation, cached.input, cached.output);
				return true;
			}

			putAutoCache (job, translation, input, output) {
				if (!translation) return;
				autoCache.set(this.autoCacheKey(job), {translation, input, output});
				if (autoCache.size > AUTO_CACHE_MAX) autoCache.delete(autoCache.keys().next().value);
			}

			// пакетом умеют только googlepa/googlegtx; спецкодировки (морзе, бинарь)
			// разбираются локально и в пакет не идут
			canBatchAuto (job) {
				if (job.noBatch) return false;
				const engine = translationEngines[this.pickAutoEngine()];
				if (!engine || !engine.batchFuncName || typeof this[engine.batchFuncName] != "function") return false;
				if (job.special === undefined) job.special = !!this.checkForSpecialCase(job.raw, {auto: true});
				return !job.special;
			}

			pickAutoEngine () {
				const primary = this.settings.engines.translator, backup = this.settings.engines.backup;
				if (this.engineDown(primary) && translationEngines[backup] && !this.engineDown(backup)) return backup;
				return primary;
			}

			runAutoBatch (jobs) {
				const engineKey = this.pickAutoEngine(), engine = translationEngines[engineKey];
				const target = jobs[0].targetLangCode;
				const output = Object.assign({}, languages[target] || {id: target, name: target});
				const prepared = jobs.map(job => {
					const [text, excepts, translate] = this.removeExceptions(job.raw.trim(), messageTypes.RECEIVED);
					return {job, text, excepts, translate: translate && !!text.trim()};
				});
				const usable = prepared.filter(p => p.translate);
				const batchFunc = engine && engine.batchFuncName && this[engine.batchFuncName];
				const release = _ => {
					autoActive = Math.max(0, autoActive - 1);
					this.pumpAutoQueue();
				};
				// пачка не удалась — возвращаем сообщения в очередь по одному,
				// чтобы отработала обычная схема с основным и резервным движком
				const fallback = _ => {
					for (const p of usable) {
						p.job.noBatch = true;
						autoQueue.push(p.job);
					}
					release();
				};
				if (!usable.length) return release();
				// движок мог смениться предохранителем между сборкой пачки и отправкой
				if (typeof batchFunc != "function") return fallback();
				let settled = false;
				const guard = BDFDB.TimeUtils.timeout(_ => {
					if (settled) return;
					settled = true;
					this.noteEngineResult(engineKey, false);
					fallback();
				}, AUTO_BATCH_TIMEOUT);
				batchFunc.call(this, usable.map(p => p.text), output, results => {
					if (settled) return;
					settled = true;
					BDFDB.TimeUtils.clear(guard);
					if (!results || results.length != usable.length) {
						this.noteEngineResult(engineKey, false);
						return fallback();
					}
					this.noteEngineResult(engineKey, true);
					usable.forEach((p, i) => {
						const result = results[i];
						if (!result || !result.text) return;
						const translation = this.addExceptions(result.text, p.excepts);
						const input = result.src && languages[result.src]
							? Object.assign({}, languages[result.src])
							: Object.assign({}, languages.auto || {id: "auto", name: "auto"});
						this.putAutoCache(p.job, translation, input, output);
						this.applyAutoTranslation(p.job, translation, input, output);
					});
					release();
				});
			}

			runAutoTranslation (job) {
				const done = (translation, input, output) => {
					autoActive = Math.max(0, autoActive - 1);
					this.applyAutoTranslation(job, translation, input, output);
					this.pumpAutoQueue();
				};
				this.translateText(job.raw, messageTypes.RECEIVED, (translation, input, output) => {
					if (!translation) console.warn("[FiLTranslator] авто-перевод не вернул результат", {text: job.raw.slice(0, 80), target: job.targetLangCode, engine: this.settings.engines.translator});
					else this.putAutoCache(job, translation, input, output);
					done(translation, input, output);
				}, job.targetLangCode, true);
			}

			// «предохранитель»: после серии отказов движка (обычно 429) фоновый перевод
			// минуту идёт сразу на резервный, а не платит таймаут дважды на каждом сообщении
			engineDown (key) {
				const health = engineHealth[key];
				return !!(health && health.until > Date.now());
			}

			noteEngineResult (key, ok) {
				if (!key) return;
				const health = engineHealth[key] || (engineHealth[key] = {fails: 0, until: 0});
				if (ok) {
					health.fails = 0;
					health.until = 0;
				}
				else if (++health.fails >= ENGINE_FAIL_LIMIT) {
					health.fails = 0;
					health.until = Date.now() + ENGINE_COOLDOWN;
				}
			}

			applyAutoTranslation (job, translation, input, output) {
				const {message, raw, at} = job;
				if (!translation || translation === raw) return;
				const src = input && input.id;
				if (src && at.skipLangs && at.skipLangs.length) {
					if (at.invertSkip ? !at.skipLangs.includes(src) : at.skipLangs.includes(src)) return;
				}
				if (shouldSkip(raw, translation)) return;
				const oldContent = this.settings.general.showOriginalMessage ? raw : "";
				const content = translation + (oldContent ? (!this.settings.general.useSpoilerInOriginal ? ("\n\n> *" + oldContent.split("\n").join("*\n> *") + "*").replace(/> \*\*\n/g, "> \n") : `\n\n||${oldContent}||`) : "");
				oldMessages[message.id] = new BDFDB.DiscordObjects.Message(message);
				translatedMessages[message.id] = {content, embeds: {}, input, output};
				this.scheduleAutoRerender();
			}

			// один общий перерисов на пачку переводов: раньше каждый ответ движка дёргал
			// forceUpdate всего слоя, а тот заново гонял processMessages по всему стриму
			scheduleAutoRerender () {
				if (autoRerenderTimeout) return;
				autoRerenderTimeout = BDFDB.TimeUtils.timeout(() => {
					autoRerenderTimeout = null;
					const scroller = document.querySelector(BDFDB.dotCN.messagesscroller);
					const wasAtBottom = scroller && (scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 50);
					const layer = BDFDB.ReactUtils.findOwner(document.querySelector(BDFDB.dotCN.chatcontent), {name: "LayerProvider", unlimited: true, up: true});
					if (layer) {
						BDFDB.ReactUtils.forceUpdate(layer);
						if (wasAtBottom) requestAnimationFrame(() => {
							const s = document.querySelector(BDFDB.dotCN.messagesscroller);
							if (s) s.scrollTop = s.scrollHeight;
						});
					}
					else BDFDB.MessageUtils.rerenderAll(true);
				}, AUTO_RERENDER_DELAY);
			}

			checkMessage (stream, message) {
				let translation = translatedMessages[message.id];
				if (translation) stream.content.content = translation.content;
				else if (oldMessages[message.id] && Object.keys(message).some(key => !BDFDB.equals(oldMessages[message.id][key], message[key]))) {
					stream.content.content = oldMessages[message.id].content;
					delete oldMessages[message.id];
				}
			}

			pruneCaches () {
				const cap = (obj, max) => {
					const keys = Object.keys(obj);
					for (let i = 0; i < keys.length - max; i++) delete obj[keys[i]];
				};
				cap(translatedMessages, 1000);
				cap(oldMessages, 1000);
				if (autoTranslatedIds.size > 2000) {
					const drop = [...autoTranslatedIds].slice(0, autoTranslatedIds.size - 2000);
					for (const id of drop) autoTranslatedIds.delete(id);
				}
			}

			processMessageReply (e) {
				if (!e.instance.props.referencedMessage || !e.instance.props.referencedMessage.message || !translatedMessages[e.instance.props.referencedMessage.message.id]) return;
				e.instance.props.referencedMessage = Object.assign({}, e.instance.props.referencedMessage);
				e.instance.props.referencedMessage.message = new BDFDB.DiscordObjects.Message(e.instance.props.referencedMessage.message);
				e.instance.props.referencedMessage.message.content = translatedMessages[e.instance.props.referencedMessage.message.id].content;
			}

			processMessageContent (e) {
				if (!e.instance.props.message) return;
				let translation = translatedMessages[e.instance.props.message.id];
				if (translation && translation.content) e.returnvalue.props.children.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TooltipContainer, {
					text: `${this.getLanguageName(translation.input)} ➝ ${this.getLanguageName(translation.output)}`,
					tooltipConfig: {style: "max-width: 400px"},
					children: BDFDB.ReactUtils.createElement("span", {
						className: BDFDB.DOMUtils.formatClassName(BDFDB.disCN.messagetimestamp, BDFDB.disCN.messagetimestampinline, BDFDB.disCN._translatortranslated),
						children: BDFDB.ReactUtils.createElement("span", {
							className: BDFDB.disCN.messageedited,
							children: `(${this.labels.translated_watermark})`
						})
					})
				}));
			}

			processEmbed (e) {
				if (!e.instance.props.embed || !e.instance.props.embed.message_id) return;
				let translation = translatedMessages[e.instance.props.embed.message_id];
				if (translation && Object.keys(translation.embeds).length) {
					if (!e.returnvalue) e.instance.props.embed = Object.assign({}, e.instance.props.embed, {
						rawDescription: translation.embeds[e.instance.props.embed.id].description,
						rawTitle: translation.embeds[e.instance.props.embed.id].title,
						footer: Object.assign({}, e.instance.props.embed.footer || {}, {
							text: translation.embeds[e.instance.props.embed.id].footerText || ""
						}),
						fields: translation.embeds[e.instance.props.embed.id].fields.map(n => ({ rawName: n.name, rawValue: n.value })),
						originalDescription: e.instance.props.embed.originalDescription || e.instance.props.embed.rawDescription,
						originalTitle: e.instance.props.embed.originalTitle || e.instance.props.embed.rawTitle,
						originalFields: e.instance.props.embed.originalFields || e.instance.props.embed.fields,
						originalFooter: e.instance.props.embed.originalFooter || Object.assign({}, e.instance.props.embed.footer)
					});
					else {
						let [children, index] = BDFDB.ReactUtils.findParent(e.returnvalue, { props: [["className", BDFDB.disCN.embeddescription]] });
						if (index > -1) {
							// Ensure children[index].props.children is an array before attempting to push
							// Fix for errors on multiple embeds in single messages
							if (!Array.isArray(children[index].props.children)) {
								children[index].props.children = [children[index].props.children];
							}

							children[index].props.children.push(
								BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TooltipContainer, {
									text: `${this.getLanguageName(translation.input)} ➝ ${this.getLanguageName(translation.output)}`,
									tooltipConfig: { style: "max-width: 400px" },
									children: BDFDB.ReactUtils.createElement("span", {
										className: BDFDB.DOMUtils.formatClassName(BDFDB.disCN.messagetimestamp, BDFDB.disCN.messagetimestampinline, BDFDB.disCN._translatortranslated),
										children: BDFDB.ReactUtils.createElement("span", {
											className: BDFDB.disCN.messageedited,
											children: `(${this.labels.translated_watermark})`
										})
									})
								})
							);
						}
					}
				}
				else if (!e.returnvalue && e.instance.props.embed.originalDescription) {
					e.instance.props.embed = Object.assign({}, e.instance.props.embed, {
						rawDescription: e.instance.props.embed.originalDescription,
						rawTitle: e.instance.props.embed.originalTitle,
						fields: e.instance.props.embed.originalFields,
						footer: e.instance.props.embed.originalFooter
					});
					delete e.instance.props.embed.originalDescription;
					delete e.instance.props.embed.originalTitle;
					delete e.instance.props.embed.originalFields;
					delete e.instance.props.embed.originalFooter;
				}
			}
			
			toggleTranslation (channelId) {
				if (!this.isTranslationEnabled(channelId)) translationEnabledStates.push(this.settings.general.usePerChatTranslation ? channelId : "global");
				else BDFDB.ArrayUtils.remove(translationEnabledStates, this.settings.general.usePerChatTranslation ? channelId : "global", true);
				BDFDB.DataUtils.save(translationEnabledStates, this, "translationEnabledStates");
			}
			
			isTranslationEnabled (channelId) {
				return translationEnabledStates.includes(this.settings.general.usePerChatTranslation ? channelId : "global");
			}

			setLanguages () {
				if (this.settings.engines.translator == this.settings.engines.backup) {
					this.settings.engines.backup = Object.keys(translationEngines).filter(n => n != this.settings.engines.translator)[0];
					BDFDB.DataUtils.save(this.settings.engines, this, "engines");
				}
				let engine = translationEngines[this.settings.engines.translator] || {};
				let backup = translationEngines[this.settings.engines.backup] || {};
				let languageIds = [].concat(engine.languages, backup.languages).flat(10).filter(n => n);
				languages = BDFDB.ObjectUtils.deepAssign(
					!engine.auto && !backup.auto ? {} : {
						auto: {
							auto: true,
							name: this.labels.detect_language,
							id: "auto"
						}
					},
					BDFDB.ObjectUtils.filter(BDFDB.LanguageUtils.languages, lang => languageIds.includes(lang.id)),
					{
						binary:	{
							special: true,
							name: this.labels.language_binary,
							id: "binary"
						},
						braille: {
							special: true,
							name: this.labels.language_braille,
							id: "braille"
						},
						morse: {
							special: true,
							name: this.labels.language_morse,
							id: "morse"
						},
                        hex: {
                            special: true,
                            name: this.labels.language_hex,
                            id: "hex"
                        },
					}
				);
				for (let id in languages) languages[id].fav = favorites.includes(id) ? 0 : 1;
				languages = BDFDB.ObjectUtils.sort(languages, "fav");
			}

			getDiscordLanguageId () {
				let id = BDFDB.LanguageUtils.getLanguage().id;
				if (languages[id] && !languages[id].auto && !languages[id].special) return id;
				// язык интерфейса не поддерживается движком — пробуем системный, затем английский
				let sys = (navigator.language || "").split("-")[0];
				if (languages[sys] && !languages[sys].auto && !languages[sys].special) return sys;
				return languages.en ? "en" : Object.keys(languages).find(k => !languages[k].auto && !languages[k].special);
			}

			getLanguageChoice (direction, place, channelId) {
				let choice;
				let channel = channelId && BDFDB.LibraryStores.ChannelStore.getChannel(channelId);
				let guildId = channel ? (channel.guild_id ? channel.guild_id : "@me") : null;
				if (channelLanguages[channelId] && channelLanguages[channelId][place]) choice = channelLanguages[channelId][place][direction];
				else if (guildId && guildLanguages[guildId] && guildLanguages[guildId][place]) choice = guildLanguages[guildId][place][direction];
				else choice = this.settings.choices[place] && this.settings.choices[place][direction];
				// "$discord" — язык интерфейса Discord; осмысленен только для вывода,
				// для ввода это автоопределение
				if (choice == "$discord") choice = direction == languageTypes.OUTPUT ? this.getDiscordLanguageId() : "auto";
				choice = languages[choice] ? choice : (direction == languageTypes.INPUT && languages.auto ? "auto" : Object.keys(languages)[0]);
				// для вывода "auto" бессмысленен — падаем на язык интерфейса, а не жёстко на английский
				if (direction == languageTypes.OUTPUT && choice == "auto") choice = this.getDiscordLanguageId();
				return choice;
			}

			saveLanguageChoice (choice, direction, place, channelId) {
				let channel = channelId && BDFDB.LibraryStores.ChannelStore.getChannel(channelId);
				let guildId = channel ? (channel.guild_id ? channel.guild_id : "@me") : null;
				if (channelLanguages[channelId] && channelLanguages[channelId][place]) {
					channelLanguages[channelId][place][direction] = choice;
					BDFDB.DataUtils.save(channelLanguages, this, "channelLanguages");
				}
				else if (guildLanguages[guildId] && guildLanguages[guildId][place]) {
					guildLanguages[guildId][place][direction] = choice;
					BDFDB.DataUtils.save(guildLanguages, this, "guildLanguages");
				}
				else {
					this.settings.choices[place][direction] = choice;
					BDFDB.DataUtils.save(this.settings.choices, this, "choices");
				}
			}

			translateMessage (message, channel) {
				return new Promise(callback => {
					if (!message) return callback(null);
					if (translatedMessages[message.id]) {
						delete translatedMessages[message.id];
						BDFDB.MessageUtils.rerenderAll(true);
						callback(false);
					}
					else {
						let originalContentData = {
							content: message.content || "",
							embeds: message.embeds.map(embed => ({
								description: embed.rawDescription || "",
								title: embed.rawTitle || "",
								footerText: embed.footer ? embed.footer.text : "",
								fields: embed.fields ? embed.fields.map(field => ({name: field.rawName, value: field.rawValue})) : []
							}))
						};
						let allTextsToTranslate = originalContentData.content;
						originalContentData.embeds.forEach(embed => {
							allTextsToTranslate += `\n__________________ __________________ __________________\n`;
							allTextsToTranslate += embed.title + "\n" + embed.description;
							embed.fields.forEach(field => {
								allTextsToTranslate += "\n\n" + field.name + "__________________" + field.value;
							});
							if (embed.footerText) allTextsToTranslate += "\n" + embed.footerText;
						});
						message.embeds.forEach(embed => embed.message_id = message.id);
						let embedIds = message.embeds.map(embed => embed.id);
						this.translateText(allTextsToTranslate, messageTypes.RECEIVED, (translation, input, output) => {
							if (translation) {
								let oldStrings = originalContentData.content.split(/\n{0,1}__________________ __________________ __________________\n{0,1}/);
								let strings = translation.split(/\n{0,1}__________________ __________________ __________________\n{0,1}/);
								let oldContent = this.settings.general.showOriginalMessage && (oldStrings.shift() || "").trim();
								let content = (strings.shift() || "").trim() + (oldContent ? (!this.settings.general.useSpoilerInOriginal ? ("\n\n> *" + oldContent.split("\n").join("*\n> *") + "*").replace(/> \*\*\n/g, "> \n") : `\n\n||${oldContent}||`) : "");
								let embeds = strings.reduce((dict, segment, index) => {
									let embedId = embedIds[index];
									let segmentLines = segment.split("\n");
									let title = segmentLines.shift();
									let description = segmentLines.shift();
									let footerText = segmentLines.pop();
									let fieldsSegment = segmentLines.join("\n").split("\n\n");
									let fields = fieldsSegment.map(line => {
										let [name, value] = line.split("__________________");
										return {name, value};
									});

									dict[embedId] = {title, description, fields, footerText};
									return dict;
								}, {});
								oldMessages[message.id] = new BDFDB.DiscordObjects.Message(message);
								oldMessages[message.id].originalContentData = originalContentData;
								translatedMessages[message.id] = {
									content: content,
									embeds: embeds,
									input,
									output
								};
								this.pruneCaches();
								BDFDB.MessageUtils.rerenderAll(true);
							}
							callback(true);
						});
					}
				});
			}

			translateText (text, place, callback, forcedOutputLanguage = null, background = false) {
				let toast = null, toastInterval, finished = false, counted = false, finishTranslation = translation => {
					if (finished) return;
					finished = true;
					BDFDB.TimeUtils.clear(toastInterval);
					if (counted) {
						activeTranslations = Math.max(0, activeTranslations - 1);
						isTranslating = activeTranslations > 0;
					}
					if (toast) toast.close();
					if (translation) translation = this.addExceptions(translation, excepts);
					callback(translation == text ? "" : translation, input, output);
				};
				let [newText, excepts, translate] = this.removeExceptions(text.trim(), place);
				let channelId = BDFDB.LibraryStores.SelectedChannelStore.getChannelId();
				// авто-перевод входящих: источник всегда автоопределение, иначе жёстко заданный
				// язык-источник совпадёт с целевым и перевод молча не запустится
				let input = background && languages.auto
					? Object.assign({}, languages.auto)
					: Object.assign({}, languages[this.getLanguageChoice(languageTypes.INPUT, place, channelId)]);
				let output = forcedOutputLanguage ? 
					Object.assign({}, languages[forcedOutputLanguage] || {id: forcedOutputLanguage, name: forcedOutputLanguage}) : 
					Object.assign({}, languages[this.getLanguageChoice(languageTypes.OUTPUT, place, channelId)]);
				
				if (translate && input.id != output.id) {
					let specialCase = this.checkForSpecialCase(newText, input);
					if (specialCase) {
						input.name = specialCase.name;
						input.displayLanguageId = specialCase.id;
						switch (specialCase.id) {
							case "binary": newText = this.binary2string(newText); break;
							case "braille": newText = this.braille2string(newText); break;
							case "morse": newText = this.morse2string(newText); break;
                            case "hex": newText = this.hex2string(newText); break;
						}
					}
					if (output.special) {
						switch (output.id) {
							case "binary": newText = this.string2binary(newText); break;
							case "braille": newText = this.string2braille(newText); break;
							case "morse": newText = this.string2morse(newText); break;
                            case "hex": newText = this.string2hex(newText); break;
						}
						finishTranslation(newText);
					}
					else {
						const startTranslating = engine => {
							if (!background) {
								if (!counted) {
									counted = true;
									activeTranslations++;
								}
								isTranslating = true;
							}
							if (toast) toast.close();
							BDFDB.TimeUtils.clear(toastInterval);

							if (!background) toast = BDFDB.NotificationUtils.toast(`${this.labels.toast_translating} (${translationEngines[engine].name}) - ${this.labels.toast_wait}`, {
								timeout: 0,
								ellipsis: true,
								position: "center",
								onClose: _ => BDFDB.TimeUtils.clear(toastInterval)
							});
							toastInterval = BDFDB.TimeUtils.interval((_, count) => {
								// фоновый перевод не ждёт 20 с: зависший запрос держит слот очереди
								if (count < (background ? 16 : 40)) return;
								this.noteEngineResult(engine, false);
								// снимаем таймер сами: если движок ответит после таймаута и уйдёт
								// на резервный, finishTranslation уже no-op и интервал не гасит
								BDFDB.TimeUtils.clear(toastInterval);
								finishTranslation("");
								if (!background) BDFDB.NotificationUtils.toast(`${this.labels.toast_translating_failed} (${translationEngines[engine].name}) - ${this.labels.toast_translating_tryanother}`, {
									type: "danger",
									position: "center"
								});
							}, 500);
						};
						const primaryKey = this.settings.engines.translator, backupKey = this.settings.engines.backup;
						const canUse = key => this.validTranslator(key, input, output, specialCase);
						const runEngine = (key, next) => {
							startTranslating(key);
							this[translationEngines[key].funcName].apply(this, [{input, output, text: newText, specialCase, background, engine: translationEngines[key]}, translation => {
								this.noteEngineResult(key, !!translation);
								next(translation);
							}]);
						};
						// ручной перевод всегда идёт выбранным движком, предохранитель — только для фонового
						const skipPrimary = background && this.engineDown(primaryKey) && canUse(backupKey);
						if (canUse(primaryKey) && !skipPrimary) runEngine(primaryKey, translation => {
							if (!translation && canUse(backupKey)) runEngine(backupKey, finishTranslation);
							else finishTranslation(translation);
						});
						else if (canUse(backupKey)) runEngine(backupKey, finishTranslation);
						else finishTranslation();
					}
				}
				else finishTranslation();
			}
			
			validTranslator (key, input, output, specialCase) {
				return translationEngines[key] && typeof this[translationEngines[key].funcName] == "function" && (specialCase || input.auto && translationEngines[key].auto || translationEngines[key].languages.includes(input.id) && translationEngines[key].languages.includes(output.id));
			}
			
			googleApiTranslate (data, callback) {
				BDFDB.LibraryRequires.request("https://translate.googleapis.com/translate_a/single", {
					form: {
						"client": "gtx",
						"dt": "t",
						"dj": "1",
						"source": "input",
						"sl": data.input.id,
						"tl": data.output.id,
						"q": data.text
					}
				}, (error, response, body) => {
					if (!error && body && response.statusCode == 200) {
						try {
							body = JSON.parse(body);
							if (!data.specialCase && body.src && body.src && languages[body.src]) {
								data.input.name = languages[body.src].name;
								data.input.displayLanguageId = body.src;
								data.input.ownlang = languages[body.src].ownlang;
							}
							callback(body.sentences.map(n => n && n.trans).filter(n => n).join(""));
						}
						catch (err) {callback("");}
					}
					else {
						if (!data.background) {
							if (response && response.statusCode == 429) BDFDB.NotificationUtils.toast(`${this.labels.toast_translating_failed}. ${this.labels.toast_translating_tryanother}. ${this.labels.error_hourlylimit}`, {
								type: "danger",
								position: "center"
							});
							else BDFDB.NotificationUtils.toast(`${this.labels.toast_translating_failed}. ${this.labels.toast_translating_tryanother}. ${this.labels.error_serverdown}`, {
								type: "danger",
								position: "center"
							});
						}
						callback("");
					}
				});
			}
			
			
			markdownToHtml (text) {
				return text
					.replace(/\*\*([^*\n]+)\*\*/g, "<b>$1</b>")
					.replace(/__([^_\n]+)__/g, "<u>$1</u>")
					.replace(/~~([^~\n]+)~~/g, "<s>$1</s>")
					.replace(/\n/g, "<br>");
			}

			htmlToMarkdown (text) {
				return text
					.replace(/<br\s*\/?> ?/gi, "\n")
					.replace(/<b>([\s\S]*?)<\/b>/g, "**$1**")
					.replace(/<u>([\s\S]*?)<\/u>/g, "__$1__")
					.replace(/<s>([\s\S]*?)<\/s>/g, "~~$1~~")
					.replace(/&lt;/g, "<")
					.replace(/&gt;/g, ">")
					.replace(/&quot;/g, '"')
					.replace(/&#39;/g, "'")
					.replace(/&amp;/g, "&")
					.replace(/^>$/gm, "> ");
			}

			// один запрос на пачку сообщений вместо запроса на каждое
			googlePaTranslateBatch (texts, output, callback) {
				BDFDB.LibraryRequires.request("https://translate-pa.googleapis.com/v1/translateHtml", {
					method: "post",
					headers: {
						"Content-Type": "application/json+protobuf",
						"X-Goog-API-Key": "AIzaSyATBXajvzQLTDHEQbcpq0Ihe0vWDHmO520"
					},
					body: JSON.stringify([[texts.map(text => this.markdownToHtml(text)), "auto", output.id], "te_lib"])
				}, (error, response, body) => {
					if (error || !body || !response || response.statusCode != 200) return callback(null);
					try {
						const parsed = JSON.parse(body);
						const translations = parsed && parsed[0], sources = parsed && parsed[1];
						if (!Array.isArray(translations) || translations.length != texts.length) return callback(null);
						callback(translations.map((translation, i) => ({
							text: typeof translation == "string" ? this.htmlToMarkdown(translation) : "",
							src: Array.isArray(sources) ? sources[i] : ""
						})));
					}
					catch (err) {callback(null);}
				});
			}

			googleGtxTranslateBatch (texts, output, callback) {
				const query = new URLSearchParams({client: "gtx", dt: "t", sl: "auto", tl: output.id, ie: "UTF-8", oe: "UTF-8"});
				const form = new URLSearchParams();
				for (const text of texts) form.append("q", text);
				BDFDB.LibraryRequires.request(`https://translate.googleapis.com/translate_a/t?${query}`, {
					method: "post",
					headers: {"Content-Type": "application/x-www-form-urlencoded"},
					body: form.toString()
				}, (error, response, body) => {
					if (error || !body || !response || response.statusCode != 200) return callback(null);
					try {
						const parsed = JSON.parse(body);
						if (!Array.isArray(parsed) || parsed.length != texts.length) return callback(null);
						callback(parsed.map(item => Array.isArray(item)
							? {text: typeof item[0] == "string" ? item[0] : "", src: item[1] || ""}
							: {text: typeof item == "string" ? item : "", src: ""}));
					}
					catch (err) {callback(null);}
				});
			}

			googlePaTranslate (data, callback) {
				const html = this.markdownToHtml(data.text);
				BDFDB.LibraryRequires.request("https://translate-pa.googleapis.com/v1/translateHtml", {
					method: "post",
					headers: {
						"Content-Type": "application/json+protobuf",
						"X-Goog-API-Key": "AIzaSyATBXajvzQLTDHEQbcpq0Ihe0vWDHmO520"
					},
					body: JSON.stringify([[html, "auto", data.output.id], "te_lib"])
				}, (error, response, body) => {
					if (!error && body && response.statusCode == 200) {
						try {
							body = JSON.parse(body);
							const trans = body?.[0];
							if (Array.isArray(trans) && trans.length) {
								let text = this.htmlToMarkdown(trans[0]);
								if (!data.specialCase && body?.[1]?.[0] && languages[body[1][0]]) {
									data.input.name = languages[body[1][0]].name;
									data.input.displayLanguageId = body[1][0];
									data.input.ownlang = languages[body[1][0]].ownlang;
								}
								callback(text);
							}
							else callback("");
						}
						catch (err) {callback("");}
					}
					else {
						if (!data.background) BDFDB.NotificationUtils.toast(`${this.labels.toast_translating_failed}. ${this.labels.toast_translating_tryanother}. ${this.labels.error_serverdown}`, {
							type: "danger", position: "center"
						});
						callback("");
					}
				});
			}

			googleGtxTranslate (data, callback) {
				const query = new URLSearchParams({
					client: "gtx",
					dt: "t",
					sl: "auto",
					tl: data.output.id,
					ie: "UTF-8",
					oe: "UTF-8"
				});
				const form = new URLSearchParams();
				form.append("q", data.text);
				BDFDB.LibraryRequires.request(`https://translate.googleapis.com/translate_a/t?${query}`, {
					method: "post",
					headers: { "Content-Type": "application/x-www-form-urlencoded" },
					form: { q: data.text }
				}, (error, response, body) => {
					if (!error && body && response.statusCode == 200) {
						try {
							const data_ = JSON.parse(body);
							if (Array.isArray(data_) && data_.length) {
								const result = Array.isArray(data_[0]) ? { text: data_[0][0], src: data_[0][1] } : { text: data_[0], src: "auto" };
								if (!data.specialCase && result.src && languages[result.src]) {
									data.input.name = languages[result.src].name;
									data.input.displayLanguageId = result.src;
									data.input.ownlang = languages[result.src].ownlang;
								}
								callback(result.text);
							}
							else callback("");
						}
						catch (err) {callback("");}
					}
					else {
						if (!data.background) BDFDB.NotificationUtils.toast(`${this.labels.toast_translating_failed}. ${this.labels.toast_translating_tryanother}. ${this.labels.error_serverdown}`, {
							type: "danger", position: "center"
						});
						callback("");
					}
				});
			}

			libreTranslate (data, callback) {
				const endpoint = authKeys.libretranslate && authKeys.libretranslate.endpoint || "https://translate.argosopentech.com";
				BDFDB.LibraryRequires.request(endpoint + "/translate", {
					method: "post",
					headers: {
						"Content-Type": "application/json"
					},
					body: JSON.stringify({
						q: data.text,
						source: data.input.auto ? "auto" : data.input.id,
						target: data.output.id,
						format: "text"
					})
				}, (error, response, body) => {
					if (!error && body && response.statusCode == 200) {
						try {
							body = JSON.parse(body);
							callback(body.translatedText);
						}
						catch (err) {callback("");}
					}
					else {
						if (!data.background) BDFDB.NotificationUtils.toast(`${this.labels.toast_translating_failed}. ${this.labels.toast_translating_tryanother}. ${this.labels.error_serverdown}`, {
							type: "danger",
							position: "center"
						});
						callback("");
					}
				});
			}

			simplyTranslate (data, callback) {
				const text = data.text.replace(/"/g, '\\"');
				BDFDB.LibraryRequires.request("https://simplytranslate.org/api/translate?engine=google&from=auto&to=" + data.output.id + "&text=" + encodeURIComponent(text), {}, (error, response, body) => {
					if (!error && body && response.statusCode == 200) {
						try {
							body = JSON.parse(body);
							callback(body.translated_text || "");
						}
						catch (err) {callback("");}
					}
					else {
						if (!data.background) BDFDB.NotificationUtils.toast(`${this.labels.toast_translating_failed}. ${this.labels.toast_translating_tryanother}. ${this.labels.error_serverdown}`, {
							type: "danger",
							position: "center"
						});
						callback("");
					}
				});
			}

			MD5 (e) {
				function h(a, b) {
					var e = a & 2147483648, f = b & 2147483648, c = a & 1073741824, d = b & 1073741824, g = (a & 1073741823) + (b & 1073741823);
					return c & d ? g ^ 2147483648 ^ e ^ f : c | d ? g & 1073741824 ? g ^ 3221225472 ^ e ^ f : g ^ 1073741824 ^ e ^ f : g ^ e ^ f
				}
				function k(a, b, c, d, e, f, g) {
					a = h(a, h(h(b & c | ~b & d, e), g));
					return h(a << f | a >>> 32 - f, b);
				}
				function l(a, b, c, d, e, f, g) {
					a = h(a, h(h(b & d | c & ~d, e), g));
					return h(a << f | a >>> 32 - f, b);
				}
				function m(a, b, d, c, e, f, g) {
					a = h(a, h(h(b ^ d ^ c, e), g));
					return h(a << f | a >>> 32 - f, b)
				}
				function n(a, b, d, c, e, f, g) {
					a = h(a, h(h(d ^ (b | ~c), e), g));
					return h(a << f | a >>> 32 - f, b);
				}
				function p(a) {
					var b = "", d = "", c;
					for (c = 0; 3 >= c; c++) d = a >>> 8 * c & 255, d = "0" + d.toString(16), b += d.substr(d.length - 2, 2);
					return b;
				}
				
				var f = [], q, r, s, t, a, b, c, d;
				e = function(a) {
					a = a.replace(/\r\n/g, "\n");
					for (var b = "", d = 0; d < a.length; d++) {
						var c = a.charCodeAt(d);
						128 > c ? b += String.fromCharCode(c) : (127 < c && 2048 > c ? b += String.fromCharCode(c >> 6 | 192) : (b += String.fromCharCode(c >> 12 | 224), b += String.fromCharCode(c >> 6 & 63 | 128)), b += String.fromCharCode(c & 63 | 128))
					}
					return b;
				}(e);
				f = function(b) {
					var a, c = b.length;
					a = c + 8;
					for (var d = 16 * ((a - a % 64) / 64 + 1), e = Array(d - 1), f = 0, g = 0; g < c;) a = (g - g % 4) / 4, f = g % 4 * 8, e[a] |= b.charCodeAt(g) << f, g++;
					a = (g - g % 4) / 4;
					e[a] |= 128 << g % 4 * 8;
					e[d - 2] = c << 3;
					e[d - 1] = c >>> 29;
					return e
				}(e);
				a = 1732584193, b = 4023233417, c = 2562383102, d = 271733878;
				for (e = 0; e < f.length; e += 16) q = a, r = b, s = c, t = d, a = k(a, b, c, d, f[e + 0], 7, 3614090360), d = k(d, a, b, c, f[e + 1], 12, 3905402710), c = k(c, d, a, b, f[e + 2], 17, 606105819), b = k(b, c, d, a, f[e + 3], 22, 3250441966), a = k(a, b, c, d, f[e + 4], 7, 4118548399), d = k(d, a, b, c, f[e + 5], 12, 1200080426), c = k(c, d, a, b, f[e + 6], 17, 2821735955), b = k(b, c, d, a, f[e + 7], 22, 4249261313), a = k(a, b, c, d, f[e + 8], 7, 1770035416), d = k(d, a, b, c, f[e + 9], 12, 2336552879), c = k(c, d, a, b, f[e + 10], 17, 4294925233), b = k(b, c, d, a, f[e + 11], 22, 2304563134), a = k(a, b, c, d, f[e + 12], 7, 1804603682), d = k(d, a, b, c, f[e + 13], 12, 4254626195), c = k(c, d, a, b, f[e + 14], 17, 2792965006), b = k(b, c, d, a, f[e + 15], 22, 1236535329), a = l(a, b, c, d, f[e + 1], 5, 4129170786), d = l(d, a, b, c, f[e + 6], 9, 3225465664), c = l(c, d, a, b, f[e + 11], 14, 643717713), b = l(b, c, d, a, f[e + 0], 20, 3921069994), a = l(a, b, c, d, f[e + 5], 5, 3593408605), d = l(d, a, b, c, f[e + 10], 9, 38016083), c = l(c, d, a, b, f[e + 15], 14, 3634488961), b = l(b, c, d, a, f[e + 4], 20, 3889429448), a = l(a, b, c, d, f[e + 9], 5, 568446438), d = l(d, a, b, c, f[e + 14], 9, 3275163606), c = l(c, d, a, b, f[e + 3], 14, 4107603335), b = l(b, c, d, a, f[e + 8], 20, 1163531501), a = l(a, b, c, d, f[e + 13], 5, 2850285829), d = l(d, a, b, c, f[e + 2], 9, 4243563512), c = l(c, d, a, b, f[e + 7], 14, 1735328473), b = l(b, c, d, a, f[e + 12], 20, 2368359562), a = m(a, b, c, d, f[e + 5], 4, 4294588738), d = m(d, a, b, c, f[e + 8], 11, 2272392833), c = m(c, d, a, b, f[e + 11], 16, 1839030562), b = m(b, c, d, a, f[e + 14], 23, 4259657740), a = m(a, b, c, d, f[e + 1], 4, 2763975236), d = m(d, a, b, c, f[e + 4], 11, 1272893353), c = m(c, d, a, b, f[e + 7], 16, 4139469664), b = m(b, c, d, a, f[e + 10], 23, 3200236656), a = m(a, b, c, d, f[e + 13], 4, 681279174), d = m(d, a, b, c, f[e + 0], 11, 3936430074), c = m(c, d, a, b, f[e + 3], 16, 3572445317), b = m(b, c, d, a, f[e + 6], 23, 76029189), a = m(a, b, c, d, f[e + 9], 4, 3654602809), d = m(d, a, b, c, f[e + 12], 11, 3873151461), c = m(c, d, a, b, f[e + 15], 16, 530742520), b = m(b, c, d, a, f[e + 2], 23, 3299628645), a = n(a, b, c, d, f[e + 0], 6, 4096336452), d = n(d, a, b, c, f[e + 7], 10, 1126891415), c = n(c, d, a, b, f[e + 14], 15, 2878612391), b = n(b, c, d, a, f[e + 5], 21, 4237533241), a = n(a, b, c, d, f[e + 12], 6, 1700485571), d = n(d, a, b, c, f[e + 3], 10, 2399980690), c = n(c, d, a, b, f[e + 10], 15, 4293915773), b = n(b, c, d, a, f[e + 1], 21, 2240044497), a = n(a, b, c, d, f[e + 8], 6, 1873313359), d = n(d, a, b, c, f[e + 15], 10, 4264355552), c = n(c, d, a, b, f[e + 6], 15, 2734768916), b = n(b, c, d, a, f[e + 13], 21, 1309151649), a = n(a, b, c, d, f[e + 4], 6, 4149444226), d = n(d, a, b, c, f[e + 11], 10, 3174756917), c = n(c, d, a, b, f[e + 2], 15, 718787259), b = n(b, c, d, a, f[e + 9], 21, 3951481745), a = h(a, q), b = h(b, r), c = h(c, s), d = h(d, t);
				return (p(a) + p(b) + p(c) + p(d)).toLowerCase();
			}

			checkForSpecialCase (text, input) {
				if (input.special) return input;
				else if (input.auto) {
					const stripped = text.replace(/\s/g, "");
					if (!stripped) return null;
					// Бинарь: только байты, кратно 8 бит — иначе обычные числа вроде "10"/"101" ложно декодятся
					if (/^[01]+$/.test(stripped) && stripped.length >= 8 && stripped.length % 8 === 0) {
						return {id: "binary", name: this.labels.language_binary};
					}
					// Брайль: символы уникальны, достаточно непустой строки
					else if (/^[⠁⠂⠃⠄⠅⠆⠇⠈⠉⠊⠋⠌⠍⠎⠏⠐⠑⠒⠓⠔⠕⠖⠗⠘⠙⠚⠛⠜⠝⠞⠟⠠⠡⠢⠣⠤⠥⠦⠧⠨⠩⠪⠫⠬⠭⠮⠯⠰⠱⠲⠳⠴⠵⠶⠷⠸⠹⠺⠻⠼⠽⠾⠿]+$/.test(stripped)) {
						return {id: "braille", name: this.labels.language_braille};
					}
					// Морзе: требуем пробел-разделитель и минимум символов, чтобы "...", "-", "/" не считались морзянкой
					else if (/\s/.test(text.trim()) && /^[/|·−.\s_-]+$/.test(text) && stripped.length >= 3) {
						return {id: "morse", name: this.labels.language_morse};
					}
					// Hex: минимум 2 байта, чтобы "0xFF" и подобное не ловилось
					else if (/^(0x[0-9a-fA-F]{2})+$/.test(stripped) && stripped.length >= 8) {
						return {id: "hex", name: this.labels.language_hex};
					}
				}
				return null;
			}


			string2binary (string) {
				let binary = "";
				for (let character of string) binary += parseInt(character.charCodeAt(0).toString(2)).toPrecision(8).split(".").reverse().join("").toString() + " ";
				return binary;
			}

			string2braille (string) {
				let braille = "";
				for (let character of string) braille += brailleConverter[character.toLowerCase()] ? brailleConverter[character.toLowerCase()] : character;
				return braille;
			}

			string2morse (string) {
				string = string.replace(/ /g, "%%%%%%%%%%");
				let morse = "";
				for (let character of string) morse += (morseConverter[character.toLowerCase()] ? morseConverter[character.toLowerCase()] : character) + " ";
				morse = morse.split("\n");
				for (let i in morse) morse[i] = morse[i].trim();
				return morse.join("\n").replace(/% % % % % % % % % % /g, "/ ");
			}
			string2hex(string) {
				let hex = "";
				for (let character of string) {
					hex += "0x" + character.charCodeAt(0).toString(16).toUpperCase().padStart(2, "0") + " ";
				}
				return hex.trim();
			}			
			binary2string (binary) {
				let string = "";
				binary = binary.replace(/\n/g, "00001010").replace(/\r/g, "00001101").replace(/\t/g, "00001001").replace(/\s/g, "");
				if (/^[0-1]*$/.test(binary)) {
					let eightDigits = "";
					let counter = 0;
					for (let digit of binary) {
						eightDigits += digit;
						counter++;
						if (counter > 7) {
							string += String.fromCharCode(parseInt(eightDigits, 2).toString(10));
							eightDigits = "";
							counter = 0;
						}
					}
				}
				else BDFDB.NotificationUtils.toast(this.labels.error_invalidBinary, {
					type: "danger",
					position: "center"
				});
				return string;
			}

			braille2string (braille) {
				let string = "";
				for (let character of braille) string += brailleConverter[character.toLowerCase()] ? brailleConverter[character.toLowerCase()] : character;
				return string;
			}

			morse2string (morse) {
				let string = "";
				for (let word of morse.replace(/[_-]/g, "−").replace(/\./g, "·").replace(/\r|\t/g, "").split(/\/|\||\n/g)) {
					for (let characterstr of word.trim().split(" ")) string += morseConverter[characterstr] ? morseConverter[characterstr] : characterstr;
					string += " ";
				}
				return string.trim();
			}

			hex2string(hex) {
				let string = "";
				for (let part of hex.trim().split(/\s+/)) {
					if (part.startsWith("0x") || part.startsWith("0X")) {
						part = part.slice(2);
					}
					if (part.length === 2 && /^[0-9a-fA-F]{2}$/.test(part)) {
						string += String.fromCharCode(parseInt(part, 16));
					}
				}
				return string;
			}			

			addExceptions (string, excepts) {
				for (let count in excepts) {
					let exception = BDFDB.ArrayUtils.is(this.settings.exceptions.wordStart) && this.settings.exceptions.wordStart.some(n => excepts[count].indexOf(n) == 0) ? excepts[count].slice(1) : excepts[count];
					let newString = string.replace(new RegExp(`[｛\{]\\s*[｛\{]\\s*${count}\\s*[｝\}]\\s*[｝\}]`), exception);
					// плейсхолдер потерялся при переводе — дописываем в конец, но не дублируем, если исключение уже есть
					if (newString == string) string = string.includes(exception) ? string : string + " " + exception;
					else string = newString;
				}
				return string;
			}

			removeExceptions (string, place) {
				let emojiRegex = /[\uD83C-\uDBFF\uDC00-\uDFFF]+/;
				let excepts = {}, newString = [], count = 0;
				if (place == messageTypes.RECEIVED) {
					let text = [], i = 0;
					string.split("").forEach((chara, index, array) => { 
						if (chara == "<" && text[i] || emojiRegex.test(chara) && emojiRegex.test(array[index+1])) i++;
						text[i] = text[i] ? text[i] + chara : chara;
						if (chara == ">" || emojiRegex.test(chara) && emojiRegex.test(array[index-1])) i++;
					});
					for (let j in text) {
						if (text[j].indexOf("<") == 0 || emojiRegex.test(text[j])) {
							newString.push(`{{${count}}}`);
							excepts[count] = text[j];
							count++;
						}
						else newString.push(text[j]);
					}
				}
				else {
					let usedExceptions = BDFDB.ArrayUtils.is(this.settings.exceptions.wordStart) ? this.settings.exceptions.wordStart : [];
					string.split(" ").forEach(word => {
						if (emojiRegex.test(word) || word.indexOf("<@!") == 0 || word.indexOf("<#") == 0 || word.indexOf(":") == 0 || word.indexOf("<:") == 0 || word.indexOf("<a:") == 0 || word.indexOf("@") == 0 || word.indexOf("#") == 0 || usedExceptions.some(n => word.indexOf(n) == 0 && word.length > 1)) {
							newString.push(`{{${count}}}`);
							excepts[count] = word;
							count++;
						}
						else newString.push(word);
					});
				}
				return [newString.join(" "), excepts, newString.length-count != 0];
			}

			getGoogleTranslatePageURL (input, output, text) {
				return `https://translate.google.com/#${BDFDB.LanguageUtils.languages[input] ? input : "auto"}/${output}/${encodeURIComponent(text)}`;
			}

			createInterfaceLanguageSetting (onChange) {
				return BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormItem, {
					title: this.labels.settings_interfaceLanguage,
					className: BDFDB.disCN.marginbottom8,
					children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Select, {
						value: this.getInterfaceLanguage(),
						options: interfaceLanguageOptions.map(option => ({...option})),
						onChange: choice => {
							const value = choice?.value ?? choice;
							if ((value !== "ru" && value !== "en") || value === this.getInterfaceLanguage()) return;
							BDFDB.DataUtils.save(value, this, "general", "interfaceLanguage");
							this.settings.general.interfaceLanguage = value;
							this.labels = this.setLabelsByLanguage();
							onChange();
							BDFDB.PatchUtils.forceAllUpdates(this);
							BDFDB.MessageUtils.rerenderAll();
						}
					})
				});
			}

			getInterfaceLanguage () {
				return this.settings?.general?.interfaceLanguage === "en" ? "en" : "ru";
			}

			setLabelsByLanguage () {
				return interfaceLabels[this.getInterfaceLanguage()];
			}

			getLanguageName (language) {
				if (!language) return "";
				const id = language.displayLanguageId || language.id;
				if (id === "auto") return this.labels.detect_language;
				const customName = this.labels[`language_${id}`];
				if (customName) return customName;
				return (id && languageNames[this.getInterfaceLanguage()].of(id)) || BDFDB.LanguageUtils.getName(language);
			}
		};
	})(window.BDFDB_Global.PluginUtils.buildPlugin(changeLog));
})();
