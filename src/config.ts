import * as vscode from "vscode";

interface Config {
	enable: boolean;
	debug: boolean;
	maxNumberOfResults: number;
	disabledLanguagesIds: string[];
}

export function getVSCodeConfig(): Config {
	return vscode.workspace.getConfiguration("tabnine") as any;
}
