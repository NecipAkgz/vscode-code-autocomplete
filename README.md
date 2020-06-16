# Code Autocomplete &middot; [![Visual Studio Marketplace](https://img.shields.io/visual-studio-marketplace/v/svipas.code-autocomplete.svg)](https://marketplace.visualstudio.com/items?itemName=svipas.code-autocomplete)

[TabNine](https://www.tabnine.com) client (all-language autocomplete) for the VS Code.

[TabNine](https://www.tabnine.com) features:

- Uses deep learning to help you write code faster.
- Works for all programming languages.
- Doesn't require any configuration or external software in order to work.
- Indexes your whole project, reading your `.gitignore`, `.hgignore`, `.ignore` and `.tabnineignore` files to determine which files to index.
- Type long variable names in just a few keystrokes using the mnemonic completion engine.
- Highly responsive, typically produces a list of suggestions in less than 10 milliseconds.

&#x26a0; Difference between [official TabNine extension](https://github.com/codota/tabnine-vscode):

- Updated `README` to contain as much documentation as possible.
- Added more VS Code settings, TabNine commands and triggers.
- Removed restriction to show only 1 result if end of the word is `.` or `::`.
- Always shows correct suggestion detail for e.g. `41%` or `TabNine`.
- Won't preselect suggestions.
- De-prioritized suggestions to be at the end of the list whenever it's possible.
- Changed suggestions kind from `property` to `text` in order to avoid misunderstanding which suggestions are from TabNine.
- Triggers suggestion list if suggestion ends with `.` or `::`.
- Included postfix in suggestions for e.g. instead of `log(` it will show `log()`.
- Added status bar item which shows current status of TabNine.
- Disabled suggestions for VS Code JSON files like `settings.json`, etc.
- Starts TabNine process on VS Code startup.
- For a full list of changes you can take a look at the [CHANGELOG](https://github.com/svipas/vscode-code-autocomplete/blob/master/CHANGELOG.md).

## Installation

Install through VS Code extensions, search for `Code Autocomplete` by `Benas Svipas`. _If you can't find extension by name try to search by publisher name._

## Usage

Open any file in text editor and just start typing.

## Bundled binary

[TabNine (2.8.5)](https://github.com/codota/TabNine) is bundled with this extension. After installing this extension you can immediately start to use TabNine, you don't need to do anything additionally. But if you want to improve experience with TabNine, continue to read below.

## Semantic completion

Semantic completion permits suggestions which make use of language-specific information via [Language Server Protocol](https://microsoft.github.io/language-server-protocol/). In other words it improves suggestions.

If you want to enable semantic completion for specific language open file in text editor and [use command palette](#commands) or [type command in active file](#commands).

[Read more about semantic completion.](https://www.tabnine.com/semantic)

## Plans

<details>
<summary><strong>Free</strong></summary>

- Project size limit: <kbd>400 KB</kbd>
- Code completions for all languages: <kbd>✓</kbd>
- Code completions based on your code: <kbd>✓</kbd>
- [Deep TabNine](https://www.tabnine.com/subscribe#local) completions based on millions of open source projects: <kbd>✓</kbd>
- Works offline: <kbd>✓</kbd>
- [Deep TabNine Cloud](https://www.tabnine.com/subscribe#cloud) - use GPU-accelerated cloud servers (optional): <kbd>x</kbd>
- Priority support: <kbd>x</kbd>
- Self-hosted option: <kbd>x</kbd>
- Train a model specialized for your code: <kbd>x</kbd>

</details>

<details>
<summary><strong>Professional</strong></summary>

[Try TabNine Professional for a 14-day free trial.](https://www.tabnine.com/trial)

- Project size limit: <kbd>Unlimited</kbd>
- Code completions for all languages: <kbd>✓</kbd>
- Code completions based on your code: <kbd>✓</kbd>
- [Deep TabNine](https://www.tabnine.com/subscribe#local) completions based on millions of open source projects: <kbd>✓</kbd>
- Works offline: <kbd>✓</kbd>
- [Deep TabNine Cloud](https://www.tabnine.com/subscribe#cloud) - use GPU-accelerated cloud servers (optional): <kbd>✓</kbd>
- Priority support: <kbd>✓</kbd>
- Self-hosted option: <kbd>x</kbd>
- Train a model specialized for your code: <kbd>x</kbd>

</details>

<details>
<summary><strong>Enterprise</strong></summary>

Contact TabNine at enterprise@tabnine.com for pricing and information.

- Project size limit: <kbd>Unlimited</kbd>
- Code completions for all languages: <kbd>✓</kbd>
- Code completions based on your code: <kbd>✓</kbd>
- [Deep TabNine](https://www.tabnine.com/subscribe#local) completions based on millions of open source projects: <kbd>✓</kbd>
- Works offline: <kbd>✓</kbd>
- [Deep TabNine Cloud](https://www.tabnine.com/subscribe#cloud) - use GPU-accelerated cloud servers (optional): <kbd>✓</kbd>
- Priority support: <kbd>✓</kbd>
- Self-hosted option: <kbd>✓</kbd>
- Train a model specialized for your code: <kbd>✓</kbd>

</details>

## Local vs Cloud

<details>
<summary><strong>Local</strong></summary>

TabNine Local uses your machine's CPU to run a deep learning model for providing completions. Your code stays on your machine.

</details>

<details>
<summary><strong>Cloud</strong></summary>

Enabling TabNine Cloud sends small parts of your code to our servers to provide GPU-accelerated completions. Other than for the purpose of fulfilling your query, your data isn't used, saved or logged in any way.

</details>

## Commands & Settings

<details>
<summary><strong>Command palette</strong></summary>

Commands below are available in VS Code command palette.

- `TabNine: open config`: opens configuration panel
- `TabNine: restart`: restarts TabNine
- `TabNine: enable semantic completion for current language`: enables semantic completion for current language
- `TabNine: disable semantic completion for current language`: disables semantic completion for current language

</details>

<details>
<summary><strong>Text</strong></summary>

Commands below are available in VS Code active file, to use them simply type the command.

- `TabNine::config`: opens configuration panel
- `TabNine::version`: returns current TabNine version
- `TabNine::config_dir`: returns directory where TabNine stores its configuration
- `TabNine::active`: checks whether TabNine has been activated
- `TabNine::restart`: restarts TabNine
- `TabNine::become_beta_tester`: enables beta releases of TabNine
- `TabNine::disable_auto_update`: disables automatic updates
- `TabNine::enable_auto_update`: enables automatic updates
- `TabNine::ignore_semantic`: ignores semantic completion error messages
- `TabNine::unignore_semantic`: enables semantic completion error messages
- `TabNine::sem`: enables semantic completion for current language
- `TabNine::no_sem`: disables semantic completion for current language

</details>

<details>
<summary><strong>Settings</strong></summary>

Settings below are available in VS Code.

- `tabnine.enable`: enables TabNine completions
- `tabnine.debug`: enables debug mode
- `tabnine.maxNumberOfResults`: maximum number of results returned by TabNine
- `tabnine.disabledLanguagesIds`: list of languages IDs to disable
- `tabnine.requestTimeout`: timeout in milliseconds after which TabNine request is terminated

</details>

## Contributing

Feel free to open issues or PRs!

## Credits

All credits belongs to [Codota](https://github.com/codota), [TabNine](https://github.com/codota/tabnine) and [Jacob Jackson](https://github.com/zxqfl).

## License

This repository includes source code of VS Code extension as well as bundled TabNine binaries. The MIT license only applies to the source code of VS Code extension, not the binaries! The binaries are covered by the [TabNine End User License Agreement](https://tabnine.com/eula).
