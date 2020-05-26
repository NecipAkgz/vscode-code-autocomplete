# TabNine+ &middot; [![Visual Studio Marketplace](https://img.shields.io/visual-studio-marketplace/v/svipas.tabnine-plus.svg)](https://marketplace.visualstudio.com/items?itemName=svipas.tabnine-plus)

[TabNine](https://www.tabnine.com) client (all-language autocompleter) for the VS Code. To see the difference between [tabnine-vscode](https://github.com/codota/tabnine-vscode) you can take a look at the [CHANGELOG](https://github.com/svipas/vscode-tabnine-plus/blob/master/CHANGELOG.md).

[TabNine](https://www.tabnine.com) features:

- Uses deep learning to help you write code faster.
- Works for all programming languages.
- Doesn't require any configuration or external software in order to work.
- Indexes your whole project, reading your `.gitignore`, `.hgignore`, `.ignore` and `.tabnineignore` files to determine which files to index.
- Type long variable names in just a few keystrokes using the mnemonic completion engine.
- Highly responsive, typically produces a list of suggestions in less than 10 milliseconds.

## Installation

Install through VS Code extensions, search for `TabNine+` by `Benas Svipas`. _If you can't find extension by name try to search by publisher name._

## Bundled binary

[TabNine (2.8.2)](https://github.com/codota/TabNine) is bundled with this extension. After installing this extension you can immediately start to use TabNine, you don't need to do anything additionally. But if you want to improve experience with TabNine, continue to read below.

## Semantic completion

Semantic completion permits suggestions which make use of language-specific information via [Language Server Protocol](https://microsoft.github.io/language-server-protocol/). In other words it improves suggestions.

If you want to enable semantic completion for specific language open file in text editor and [use command palette]() or [type command in active file]().

[Read more about semantic completion.](https://www.tabnine.com/semantic)

## Local vs Cloud

<details>
<summary><strong>Local</strong></summary>

TabNine Local uses your machine's CPU to run a deep learning model for providing completions. Your code stays on your machine.

- Project size limit: <kbd>400 KB</kbd>
- Code completions for all languages: <kbd>✓</kbd>
- Code completions based on your code: <kbd>✓</kbd>
- [Deep TabNine](https://www.tabnine.com/subscribe#local) completions based on millions of open source projects: <kbd>✓</kbd>
- Works offline: <kbd>✓</kbd>
- [Deep TabNine Cloud](https://www.tabnine.com/subscribe#cloud) - use GPU-accelerated cloud servers (optional): <kbd>x</kbd>
- Priority support: <kbd>x</kbd>

</details>

<details>
<summary><strong>Cloud</strong></summary>

Enabling TabNine Cloud sends small parts of your code to our servers to provide GPU-accelerated completions. Other than for the purpose of fulfilling your query, your data isn't used, saved or logged in any way.

- Project size limit: <kbd>Unlimited</kbd>
- Code completions for all languages: <kbd>✓</kbd>
- Code completions based on your code: <kbd>✓</kbd>
- [Deep TabNine](https://www.tabnine.com/subscribe#local) completions based on millions of open source projects: <kbd>✓</kbd>
- Works offline: <kbd>✓</kbd>
- [Deep TabNine Cloud](https://www.tabnine.com/subscribe#cloud) - use GPU-accelerated cloud servers (optional): <kbd>✓</kbd>
- Priority support: <kbd>✓</kbd>

</details>

## Commands

<details>
<summary><strong>Command palette</strong></summary>

Commands below are available in command palette.

#### TabNine: open config

Opens configuration panel.

#### TabNine: restart

Restarts TabNine.

#### TabNine: enable semantic completion for current language

Enables semantic completion for current language.

#### TabNine: disable semantic completion for current language

Disables semantic completion for current language.

</details>

<details>
<summary><strong>Text</strong></summary>

Commands below are available in active file, to use them simply type the command.

#### TabNine::config

Opens configuration panel.

#### TabNine::version

Returns current TabNine version.

#### TabNine::config_dir

Returns directory where TabNine stores its configuration.

#### TabNine::active

Checks whether TabNine has been activated.

#### TabNine::restart

Restarts TabNine.

#### TabNine::become_beta_tester

Enables beta releases of TabNine.

#### TabNine::disable_auto_update

Disables automatic updates.

#### TabNine::enable_auto_update

Enables automatic updates.

#### TabNine::ignore_semantic

Ignores semantic completion error messages.

#### TabNine::unignore_semantic

Enables semantic completion error messages.

#### TabNine::sem

Enables semantic completion for current language.

#### TabNine::no_sem

Disables semantic completion for current language.

</details>

## Contributing

Feel free to open issues or PRs!

## Credits

All credits belongs to [Codota](https://github.com/codota), [TabNine](https://github.com/codota/tabnine) and [Jacob Jackson](https://github.com/zxqfl).

## License

This repository includes source code of VS Code extension as well as bundled TabNine binaries. The MIT license only applies to the source code of VS Code extension, not the binaries! The binaries are covered by the [TabNine End User License Agreement](https://tabnine.com/eula).
