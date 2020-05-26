import * as vscode from "vscode";
import { getVSCodeConfig } from "./config";
import { activateTabNine, sendRequestToTabNine } from "./tabnine";
import { allTabNineCompletionTriggers } from "./Trigger";

const CHAR_LIMIT = 100_000;
const DEFAULT_DETAIL_MESSAGE = "TabNine";

export async function activate(context: vscode.ExtensionContext) {
	try {
		await activateTabNine();
	} catch (err) {
		vscode.window.showErrorMessage(err);
	}

	context.subscriptions.push(
		vscode.commands.registerCommand("TabNine::config", async () => {
			try {
				await sendRequestToTabNine({ Configuration: {} });
			} catch (err) {
				vscode.window.showErrorMessage(err);
			}
		})
	);

	vscode.languages.registerCompletionItemProvider(
		{ pattern: "**" },
		{ provideCompletionItems },
		...allTabNineCompletionTriggers
	);
}

async function provideCompletionItems(
	document: vscode.TextDocument,
	position: vscode.Position
) {
	try {
		const vscodeConfig = getVSCodeConfig();

		if (vscodeConfig.disabledLanguagesIds.includes(document.languageId)) {
			return undefined;
		}

		const offset = document.offsetAt(position);
		const beforeStartOffset = Math.max(0, offset - CHAR_LIMIT);
		const afterEndOffset = offset + CHAR_LIMIT;
		const beforeStartPosition = document.positionAt(beforeStartOffset);
		const afterEndPosition = document.positionAt(afterEndOffset);
		const beforeStartPositionText = document.getText(
			new vscode.Range(beforeStartPosition, position)
		);
		const afterEndPositionText = document.getText(
			new vscode.Range(position, afterEndPosition)
		);

		const responseFromTabNine = await sendRequestToTabNine({
			Autocomplete: {
				filename: document.fileName,
				before: beforeStartPositionText,
				after: afterEndPositionText,
				region_includes_beginning: beforeStartOffset === 0,
				region_includes_end:
					document.offsetAt(afterEndPosition) !== afterEndOffset,
				max_num_results: vscodeConfig.maxNumberOfResults,
			},
		});

		if (vscodeConfig.debug) {
			console.log(responseFromTabNine);
		}

		const oldPrefixStartPosition = position.translate(
			0,
			-responseFromTabNine.old_prefix.length
		);
		const userMessage = responseFromTabNine.user_message.join(" ");

		const completionList: vscode.CompletionItem[] = [];
		for (let i = 0; i < responseFromTabNine.results.length; i++) {
			const resultEntry = responseFromTabNine.results[i];
			const completionItem = new vscode.CompletionItem(resultEntry.new_prefix);

			if (
				resultEntry.new_prefix.endsWith(".") ||
				resultEntry.new_prefix.endsWith("::")
			) {
				completionItem.command = {
					title: "triggerSuggest",
					command: "editor.action.triggerSuggest",
				};
			}

			if (resultEntry.detail) {
				completionItem.detail = resultEntry.detail;
			} else {
				completionItem.detail = DEFAULT_DETAIL_MESSAGE;
			}

			if (resultEntry.documentation) {
				if (typeof resultEntry.documentation === "object") {
					if (resultEntry.documentation.kind === "markdown") {
						completionItem.documentation = new vscode.MarkdownString(
							resultEntry.documentation.value
						);
					} else {
						completionItem.documentation = resultEntry.documentation.value;
					}
				} else {
					completionItem.documentation = resultEntry.documentation;
				}
			} else {
				completionItem.documentation = userMessage;
			}

			completionItem.insertText = new vscode.SnippetString(
				resultEntry.new_prefix
			);
			if (resultEntry.new_suffix) {
				completionItem.label += resultEntry.new_suffix;

				completionItem.insertText
					.appendTabstop(0)
					.appendText(resultEntry.new_suffix);
			}

			completionItem.kind = vscode.CompletionItemKind.Text;
			completionItem.range = new vscode.Range(
				oldPrefixStartPosition,
				position.translate(0, resultEntry.old_suffix.length)
			);
			completionItem.sortText = i.toString();

			completionList.push(completionItem);
		}

		return new vscode.CompletionList(completionList, true);
	} catch (err) {
		console.error(err);
	}
}

export function deactivate() {}
