import * as vscode from "vscode";
import { getVSCodeConfig } from "./config";
import { setTabNineStatus, statusBarItem, TabNineStatus } from "./statusBar";
import {
	sendRequestToTabNine,
	startAndHookIntoTabNineProcess,
} from "./tabnine";
import { Trigger } from "./Trigger";
import { downloadTabNineBinary, logError, showErrorMessage } from "./utils";

const DEFAULT_DETAIL_MESSAGE = "TabNine";
const TABNINE_VERSION_KEY = "TABNINE_VERSION";
const vscodeConfig = getVSCodeConfig();

export async function activate(context: vscode.ExtensionContext) {
	try {
		setTabNineStatus(TabNineStatus.None);
		statusBarItem.show();
		context.subscriptions.push(statusBarItem);

		if (!vscodeConfig.enable) {
			setTabNineStatus(
				TabNineStatus.Disabled,
				"TabNine is disabled via config"
			);
			return;
		}

		const isTabNineBinaryDownloaded = await downloadTabNineBinary(
			context.globalState.get(TABNINE_VERSION_KEY)
		);
		if (!isTabNineBinaryDownloaded) {
			setTabNineStatus(
				TabNineStatus.BinaryDoesNotExist,
				"TabNine binary does not exist"
			);
			return;
		}

		startAndHookIntoTabNineProcess()
			.then((version) => {
				context.globalState.update(TABNINE_VERSION_KEY, version);
			})
			.catch((err) => {
				setTabNineStatus(
					TabNineStatus.ProcessFailedToStart,
					"TabNine process failed to start"
				);
				showErrorMessage(err);
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
			vscode.languages.registerCompletionItemProvider(documentFilters, {
				provideCompletionItems,
			}),
			vscode.languages.registerCompletionItemProvider(
				documentFilters,
				{ provideCompletionItems },
				Trigger.DOT,
				Trigger.COLON
			),
			registerTabNineCommand("TabNine::config"),
			registerTabNineCommand("TabNine::restart"),
			registerTabNineCommand("TabNine::sem"),
			registerTabNineCommand("TabNine::no_sem")
		);
	} catch (err) {
		setTabNineStatus(
			TabNineStatus.ActivationError,
			err instanceof Error ? err.message : err
		);
		showErrorMessage(err);
	}
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

		const offset = document.offsetAt(position);
		const beforeStartOffset = Math.max(0, offset - vscodeConfig.charLimit);
		const afterEndOffset = offset + vscodeConfig.charLimit;
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
			vscodeConfig.requestTimeout,
			token.onCancellationRequested
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

		const completionItems: vscode.CompletionItem[] = [];
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

			completionItems.push(completionItem);
		}

		return new vscode.CompletionList(completionItems, true);
	} catch (err) {
		if (vscodeConfig.debug) {
			logError(err);
		}
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
				1000
			);
			vscode.window.showInformationMessage(
				responseFromTabNine.results[0].new_prefix
			);
		} catch (err) {
			showErrorMessage(err);
		}
	});
}
