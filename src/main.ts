import * as vscode from "vscode";
import { getVSCodeConfig } from "./config";
import {
	sendRequestToTabNine,
	startAndHookIntoTabNineProcess,
} from "./tabnine";
import { allTabNineCompletionTriggers } from "./Trigger";

const CHAR_LIMIT = 100_000;
const DEFAULT_DETAIL_MESSAGE = "TabNine";

export async function activate(context: vscode.ExtensionContext) {
	const vscodeConfig = getVSCodeConfig();

	if (!vscodeConfig.enable) {
		return;
	}

	startAndHookIntoTabNineProcess().catch((err) => {
		vscode.window.showErrorMessage(err);
	});

	const allVSCodeLanguages = await vscode.languages.getLanguages();
	const documentFilters: vscode.DocumentFilter[] = [];

	allVSCodeLanguages.forEach((lang) => {
		if (vscodeConfig.disabledLanguagesIds.includes(lang)) {
			return;
		}

		documentFilters.push(
			{ scheme: "file", language: lang },
			{ scheme: "untitled", language: lang }
		);
	});

	context.subscriptions.push(
		vscode.languages.registerCompletionItemProvider(
			documentFilters,
			{ provideCompletionItems },
			...allTabNineCompletionTriggers
		)
	);
	context.subscriptions.push(registerTabNineCommand("TabNine::config"));
	context.subscriptions.push(registerTabNineCommand("TabNine::restart"));
	context.subscriptions.push(registerTabNineCommand("TabNine::sem"));
	context.subscriptions.push(registerTabNineCommand("TabNine::no_sem"));
}

async function provideCompletionItems(
	document: vscode.TextDocument,
	position: vscode.Position,
	token: vscode.CancellationToken
) {
	try {
		if (token.isCancellationRequested) {
			return;
		}

		const vscodeConfig = getVSCodeConfig();
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

		const responseFromTabNine = await sendRequestToTabNine(
			{
				Autocomplete: {
					filename: document.fileName,
					before: beforeStartPositionText,
					after: afterEndPositionText,
					region_includes_beginning: beforeStartOffset === 0,
					region_includes_end:
						document.offsetAt(afterEndPosition) !== afterEndOffset,
					max_num_results: vscodeConfig.maxNumberOfResults,
				},
			},
			vscodeConfig.requestTimeout
		);

		if (vscodeConfig.debug) {
			console.log(responseFromTabNine);
		}

		if (responseFromTabNine.results.length === 0) {
			return;
		}

		const oldPrefixStartPosition = position.translate(
			0,
			-responseFromTabNine.old_prefix.length
		);
		const userMessage = responseFromTabNine.user_message.join(" ");

		const completionList: vscode.CompletionItem[] = [];
		let resultsLength = responseFromTabNine.results.length;
		if (resultsLength > vscodeConfig.maxNumberOfResults) {
			resultsLength = vscodeConfig.maxNumberOfResults;
		}

		for (let i = 0; i < resultsLength; i++) {
			const resultEntry = responseFromTabNine.results[i];
			const completionItem = new vscode.CompletionItem(resultEntry.new_prefix);

			if (
				resultEntry.new_prefix.endsWith(".") ||
				resultEntry.new_prefix.endsWith("::")
			) {
				completionItem.command = {
					title: "",
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
			completionItem.sortText = "\uffff9999" + i;

			completionList.push(completionItem);
		}

		return new vscode.CompletionList(completionList, true);
	} catch (err) {
		console.error(err);
	}
}

function registerTabNineCommand(command: string): vscode.Disposable {
	return vscode.commands.registerCommand(command, async () => {
		try {
			const responseFromTabNine = await sendRequestToTabNine(
				{
					Autocomplete: {
						filename: vscode.window.activeTextEditor?.document.fileName ?? "",
						before: command,
						after: command,
						region_includes_beginning: true,
						region_includes_end: true,
						max_num_results: 1,
					},
				},
				500
			);
			vscode.window.showInformationMessage(
				responseFromTabNine.results[0].new_prefix
			);
		} catch (err) {
			vscode.window.showErrorMessage(err);
		}
	});
}
