import * as child_process from "child_process";
import * as path from "path";
import * as vscode from "vscode";
import { StatusBarItem } from "./StatusBarItem";
import { getTabNineVersionAndBinaryPath } from "./utils";

export interface TabNineAutocompleteResponse {
	docs: string[];
	old_prefix: string;
	results: TabNineResultEntry[];
	user_message: string[];
}

export interface TabNineResultEntry {
	new_prefix: string;
	old_suffix: string;
	new_suffix: string;
	kind?: vscode.CompletionItemKind;
	detail?: string;
	documentation?: string | TabNineMarkdownStringSpec;
	deprecated?: boolean;
}

export interface TabNineMarkdownStringSpec {
	kind: string;
	value: string;
}

const MAX_NUMBER_OF_RESTARTS = 10;
const RESTART_AFTER_MS = 10_000;
const statusBarItem = new StatusBarItem();

let tabNineProcess: child_process.ChildProcess | undefined;
let tabNineVersion: string | undefined;
let numberOfRestarts = 0;
let isTabNineProcessAlive = false;

export async function sendRequestToTabNine(
	request: {
		[key: string]: any;
	},
	requestTimeoutMs: number
): Promise<TabNineAutocompleteResponse> {
	request = {
		version: tabNineVersion,
		request,
	};

	const unregisterFunctions: (() => void)[] = [];

	const responseFromTabNine = new Promise((resolve, reject) => {
		if (!isTabNineProcessAlive) {
			statusBarItem.tooltip = "TabNine process is currently dead";
			return reject("TabNine process is currently dead");
		}

		const onTabNineResponse = (response: Buffer) => {
			try {
				resolve(JSON.parse(response.toString()));
			} catch (err) {
				statusBarItem.tooltip = "Error while parsing response from TabNine";
				reject(`TabNine response parsing error: ${err}`);
			}
		};

		tabNineProcess?.stdout?.once("data", onTabNineResponse);

		unregisterFunctions.push(() => {
			tabNineProcess?.stdout?.off("data", onTabNineResponse);
		});

		const requestToTabNine = JSON.stringify(request) + "\n";
		tabNineProcess?.stdin?.write(requestToTabNine, "utf-8");
	});

	const timeoutTabNineRequest = new Promise((_, reject) => {
		if (!isTabNineProcessAlive) {
			statusBarItem.tooltip = "TabNine process is currently dead";
			return reject("TabNine process is currently dead");
		}

		const requestTimeout = setTimeout(() => {
			statusBarItem.tooltip = "Request to TabNine timed out";
			reject("Request to TabNine timed out");
		}, requestTimeoutMs);

		unregisterFunctions.push(() => clearTimeout(requestTimeout));
	});

	const tabNineProcessExit = new Promise((_, reject) => {
		if (!isTabNineProcessAlive) {
			statusBarItem.tooltip = "TabNine process is currently dead";
			return reject("TabNine process is currently dead");
		}

		const onTabNineProcessExit = () => {
			statusBarItem.tooltip = "TabNine process exited";
			reject("TabNine process exited");
		};

		tabNineProcess?.once("exit", onTabNineProcessExit);

		unregisterFunctions.push(() => {
			tabNineProcess?.off("exit", onTabNineProcessExit);
		});
	});

	return Promise.race([
		responseFromTabNine,
		timeoutTabNineRequest,
		tabNineProcessExit,
	]).finally(() => {
		unregisterFunctions.forEach((fn) => fn());
	}) as Promise<TabNineAutocompleteResponse>;
}

/**
 * Spawns a new TabNine process by running executable from "binaries" folder.
 */
async function spawnTabNineProcess(
	inheritStdio = false,
	...args: string[]
): Promise<{
	version: string;
	process: child_process.ChildProcess;
}> {
	const allBinariesPath = path.join(__dirname, "..", "binaries");
	const { version, binaryPath } = await getTabNineVersionAndBinaryPath(
		allBinariesPath
	);

	return {
		version,
		process: child_process.spawn(binaryPath, ["--client=vscode", ...args], {
			stdio: inheritStdio ? "inherit" : "pipe",
		}),
	};
}

function onTabNineProcessDeath(err?: string): void {
	if (tabNineProcess?.killed) {
		return;
	}
	if (err) {
		console.error(err);
	}

	isTabNineProcessAlive = false;
	statusBarItem.tooltip = "TabNine process died";
	setTimeout(() => restartTabNineProcess(), RESTART_AFTER_MS);
}

async function restartTabNineProcess(): Promise<void> {
	if (isTabNineProcessAlive) {
		return;
	}
	if (numberOfRestarts >= MAX_NUMBER_OF_RESTARTS) {
		console.error("TabNine process exceeded maximum number of restarts");
		return;
	}

	numberOfRestarts += 1;
	tabNineProcess?.kill();
	tabNineProcess = undefined;
	await startAndHookIntoTabNineProcess();
}

/**
 * Starts and hooks into a new TabNine process.
 */
export async function startAndHookIntoTabNineProcess(): Promise<void> {
	const { version, process } = await spawnTabNineProcess();
	tabNineVersion = version;
	tabNineProcess = process;
	isTabNineProcessAlive = true;
	statusBarItem.tooltip = `TabNine ${tabNineVersion} process is running`;

	tabNineProcess.on("exit", () => {
		onTabNineProcessDeath();
	});
	tabNineProcess.stdin?.on("error", (err) => {
		onTabNineProcessDeath(`TabNine stdin error: ${err}`);
	});
	tabNineProcess.stdout?.on("error", (err) => {
		onTabNineProcessDeath(`TabNine stdout error: ${err}`);
	});

	tabNineProcess.unref();
}
