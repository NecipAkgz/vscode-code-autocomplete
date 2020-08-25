## [Unreleased]

## 1.2.0 (August 25)

- Update all dependencies.
- Remove all triggers except `.` and `:`.
- Register additional completion provider which fires on word characters.
- Add `tabnine.charLimit` config.
- Update `README`.

## 1.1.1 (July 9, 2020)

- Update `README`.
- Change project file names convention.
- Update all dependencies.

## 1.1.0 (June 24, 2020)

- Disable TabNine suggestions for VS Code JSON files like `settings.json`, `keybindings.json`, etc.
- Dispose registered completion provider after extension is deactivated.
- Register completion provider immediately instead of waiting for TabNine process to start.
- Use `language` instead of `pattern` while registering completion provider.
- Add `tabnine.enable` and `tabnine.requestTimeout` configs.
- Check if language is disabled before registering completion provider.
- Check if token has been cancelled before requesting for completions.
- Handle token cancellation request while providing completions.
- Remove uninstall hook.
- Update `README`.
- Automatically download latest TabNine binary on extension activation instead of bundling all binaries in extension.
- Bundle extension with webpack.
- Read config on startup instead of every time providing completions.
- Refactor status bar item to show proper TabNine status.

## 1.0.2 (May 30, 2020)

- Change icon of extension.
- Change status bar text from `TabNine+` to `TabNine`.
- Update `package.json` with new name of extension, etc.
- Update `README`.

## 1.0.1 (May 29, 2020)

- Update `README`.
- Change description of `tabnine.maxNumberOfResults` config.
- Add additional trigger **`**.

## 1.0.0 (May 26, 2020)

- Fork [tabnine-vscode](https://github.com/codota/tabnine-vscode) (2.8.2).
- Overall project cleanup.
- Replace npm with Yarn.
- Update `tsconfig.json` to target newer version.
- Update `README` and create `CHANGELOG`.
- Refactor whole `src` directory, basically rewritten extension from scratch.
- Update all dependencies and delete unnecessary dependencies.
- Remove vscode dependency and add `@types/vscode`, this is a new approach for extension usage [#70175](https://github.com/microsoft/vscode/issues/70175).
- Update `.gitignore` and add `.vscodeignore`.
- Remove `tabnine.disable_line_regex` and `tabnine.disable_file_regex` configs.
- Add `tabnine.debug`, `tabnine.maxNumberOfResults` and `tabnine.disabledLanguagesIds` configs.
- Remove restriction to show only 1 result if end of the word is `.` or `::`.
- Always show correct suggestion detail which is for e.g. `41%`, in case detail is empty just show `TabNine` so it would be easier to identify which suggestions are from TabNine.
- Don't preselect TabNine suggestions and de-prioritize them to be at the end of the list whenever it's possible.
- Change suggestions kind from `property` to `text` in order to avoid misunderstanding which suggestions are from TabNine.
- Trigger suggestion list if suggestion ends with `.` or `::`.
- Include postfix in suggestions for e.g. instead of `console.log(` it will show `console.log()`.
- Add `TabNine::restart`, `TabNine::sem` and `TabNine::no_sem` commands in command palette.
- Add status bar item at the right which on hover shows current status of TabNine.
- Update TabNine binaries to 2.8.2 version and create script for updating binaries.
- Update GitHub issue templates for easier bug report and feature request.
