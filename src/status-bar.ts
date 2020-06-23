import * as vscode from "vscode";

export enum TabNineStatus {
	None,
	Disabled,
	ActivationError,
	BinaryDoesNotExist,
	ParsingError,
	ParsingSuccess,
	TimedOut,
	ProcessExited,
	ProcessDead,
	ProcessRunning,
	ProcessFailedToStart,
	DownloadingBinary,
}

export const statusBarItem = vscode.window.createStatusBarItem(
	vscode.StatusBarAlignment.Right
);

export function setTabNineStatus(status: TabNineStatus, message?: string) {
	statusBarItem.tooltip = message;

	switch (status) {
		case TabNineStatus.Disabled:
		case TabNineStatus.BinaryDoesNotExist: {
			statusBarItem.text = "TabNine: $(eye-closed)";
			break;
		}
		case TabNineStatus.ActivationError:
		case TabNineStatus.ParsingError:
		case TabNineStatus.ProcessExited:
		case TabNineStatus.ProcessDead:
		case TabNineStatus.ProcessFailedToStart: {
			statusBarItem.text = "TabNine: $(error)";
			break;
		}
		case TabNineStatus.ParsingSuccess:
		case TabNineStatus.ProcessRunning: {
			statusBarItem.text = "TabNine: $(check)";
			break;
		}
		case TabNineStatus.TimedOut: {
			statusBarItem.text = "TabNine: $(watch)";
			break;
		}
		case TabNineStatus.DownloadingBinary: {
			statusBarItem.text = "TabNine: $(sync~spin)";
			break;
		}
		default: {
			statusBarItem.text = "TabNine";
			break;
		}
	}
}
