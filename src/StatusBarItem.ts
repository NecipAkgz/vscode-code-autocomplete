import * as vscode from "vscode";

export class StatusBarItem {
	private readonly _statusBarItem = vscode.window.createStatusBarItem(
		vscode.StatusBarAlignment.Right
	);
	private _isVisible = false;

	constructor() {
		this._statusBarItem.text = "TabNine";
		this.tooltip = "Spawning TabNine process...";
		this.show();
	}

	set tooltip(value: string) {
		this._statusBarItem.tooltip = value;
	}

	show() {
		if (this._isVisible) {
			return;
		}

		this._statusBarItem.show();
		this._isVisible = true;
	}

	hide() {
		if (!this._isVisible) {
			return;
		}

		this._statusBarItem.hide();
		this._isVisible = false;
	}
}
