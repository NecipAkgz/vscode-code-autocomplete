import * as child_process from "child_process";
import * as path from "path";
import * as vscode from "vscode";
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

let tabNineProcess: child_process.ChildProcess | undefined;
let tabNineVersion: string | undefined;
let numberOfRestarts = 0;
let isTabNineProcessAlive = false;

export async function sendRequestToTabNine(request: {
	[key: string]: any;
}): Promise<TabNineAutocompleteResponse> {
	request = {
		version: tabNineVersion,
		request,
	};

	const unregisterFunctions: (() => void)[] = [];
	const requestToTabNine = `${JSON.stringify(request)}\n`;

	const responseFromTabNine = new Promise((resolve, reject) => {
		if (!isTabNineProcessAlive) {
			return reject("TabNine process is currently dead");
		}

		const onTabNineResponse = (response: Buffer) => {
			try {
				resolve(JSON.parse(response.toString()));
			} catch (err) {
				reject(`TabNine parsing error: ${err}`);
			}
		};

		tabNineProcess?.stdout?.once("data", onTabNineResponse);

		unregisterFunctions.push(() => {
			tabNineProcess?.stdout?.off("data", onTabNineResponse);
		});

		tabNineProcess?.stdin?.write(requestToTabNine, "utf-8");
	});

	const timeoutTabNineRequest = new Promise((_, reject) => {
		if (!isTabNineProcessAlive) {
			return reject("TabNine process is currently dead");
		}

		const requestTimeout = setTimeout(() => {
			reject("Request to TabNine timed out");
		}, 1000);

		unregisterFunctions.push(() => clearTimeout(requestTimeout));
	});

	const tabNineProcessExit = new Promise((_, reject) => {
		if (!isTabNineProcessAlive) {
			return reject("TabNine process is currently dead");
		}

		const onTabNineProcessExit = () => reject("TabNine process exited");
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

export async function reportUninstallToTabNine(): Promise<number> {
	return new Promise(async (resolve, reject) => {
		const { process } = await spawnTabNineProcess(true, "--uninstalled");
		process
			.on("exit", (code, signal) => {
				if (signal) {
					return reject(`TabNine process aborted with ${signal} signal`);
				}
				if (code == null) {
					return reject("TabNine process exited with null code");
				}
				resolve(code);
			})
			.on("error", (err) => reject(err));
	});
}

export function activateTabNine(): Promise<void> {
	return startAndHookIntoTabNineProcess();
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
	if (err) {
		console.error(err);
	}
	isTabNineProcessAlive = false;
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
async function startAndHookIntoTabNineProcess(): Promise<void> {
	const { version, process } = await spawnTabNineProcess();
	tabNineVersion = version;
	tabNineProcess = process;
	isTabNineProcessAlive = true;

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
