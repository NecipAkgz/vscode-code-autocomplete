import * as fs from "fs";
import * as https from "https";
import * as path from "path";
import * as vscode from "vscode";
import { setTabNineStatus, TabNineStatus } from "./status-bar";

const fsp = fs.promises;
const tabNineBinariesPath = path.join(__dirname, "..", "binaries");

export async function getTabNineVersionAndBinaryPath(): Promise<{
	version: string;
	binaryPath: string;
}> {
	const versions = (await fsp.readdir(tabNineBinariesPath)).reverse();
	const triedPaths: string[] = [];

	for (const version of versions) {
		const fullPath = getFullPathToTabNineBinary(version);
		triedPaths.push(fullPath);
		if (await isFileExists(fullPath)) {
			return { version, binaryPath: fullPath };
		}
	}

	throw new Error(
		`Couldn't find TabNine binary (tried following versions=${versions} and paths=${triedPaths})`
	);
}

export async function downloadTabNineBinary(
	version: string | undefined
): Promise<boolean> {
	if (version && (await isFileExists(getFullPathToTabNineBinary(version)))) {
		return true;
	}

	const tabNineVersionFromWeb = await getTabNineVersionFromWeb();

	return vscode.window.withProgress(
		{
			location: vscode.ProgressLocation.Notification,
			cancellable: true,
			title: `Downloading TabNine ${tabNineVersionFromWeb} binary...`,
		},
		(progress, token) => {
			return new Promise(async (resolve, reject) => {
				try {
					const fullPath = getFullPathToTabNineBinary(tabNineVersionFromWeb);
					const binaryDirPath = fullPath.slice(0, fullPath.lastIndexOf("/"));
					await fsp.mkdir(binaryDirPath, { recursive: true });

					let totalBinaryLength: string | undefined;
					const requestUrl = `https://update.tabnine.com/${fullPath.slice(
						fullPath.indexOf(tabNineVersionFromWeb)
					)}`;
					const requestDownload = https.get(
						requestUrl,
						{ timeout: 10_000 },
						(res) => {
							const binaryFile = fs.createWriteStream(fullPath, {
								mode: 0o755,
							});
							binaryFile.on("error", (err) => reject(err));

							let receivedBinaryLength = 0;
							let binaryPercentage = 0;
							res
								.on("data", (chunk) => {
									if (!totalBinaryLength) {
										return;
									}

									receivedBinaryLength += chunk.length;
									const newBinaryPercentage = Number(
										(
											(receivedBinaryLength * 100) /
											Number.parseInt(totalBinaryLength)
										).toFixed()
									);

									if (binaryPercentage === 0) {
										progress.report({ increment: 0 });
									} else if (newBinaryPercentage > binaryPercentage) {
										progress.report({ increment: 1 });
									}

									binaryPercentage = newBinaryPercentage;
								})
								.on("error", (err) => reject(err))
								.on("end", () => {
									if (token.isCancellationRequested) {
										return;
									}

									progress.report({ increment: 100 });
									vscode.window.showInformationMessage(
										`TabNine ${tabNineVersionFromWeb} binary is successfully downloaded`
									);
									resolve(true);
								})
								.pipe(binaryFile)
								.on("error", (err) => reject(err));

							token.onCancellationRequested(() => {
								res.destroy();
								binaryFile.destroy();
							});
						}
					);

					requestDownload.on("response", (res) => {
						setTabNineStatus(
							TabNineStatus.DownloadingBinary,
							`Downloading TabNine ${tabNineVersionFromWeb} binary`
						);
						totalBinaryLength = res.headers["content-length"];
					});
					requestDownload.on("timeout", () =>
						reject(`Request to ${requestUrl} timed out`)
					);
					requestDownload.on("error", (err) => reject(err));

					token.onCancellationRequested(() => {
						fsp.unlink(fullPath).catch((err) => reject(err));
						requestDownload.destroy();
						reject("Download of TabNine binary has been cancelled");
					});
				} catch (err) {
					reject(err);
				}
			});
		}
	);
}

async function getTabNineVersionFromWeb(): Promise<string> {
	return new Promise((resolve, reject) => {
		const requestUrl = "https://update.tabnine.com/version";
		const requestVersion = https.get(requestUrl, { timeout: 10_000 }, (res) => {
			let output = "";
			res.on("data", (chunk) => (output += chunk));
			res.on("end", () => resolve(output.trim()));
			res.on("error", (err) => reject(err));
		});

		requestVersion.on("timeout", () =>
			reject(`Request to ${requestUrl} timed out`)
		);
		requestVersion.on("error", (err) => reject(err));
	});
}

function getFullPathToTabNineBinary(version: string): string {
	const architecture = getArchitecture();
	const { target, filename } = getTargetAndFileNameByPlatform();
	return `${tabNineBinariesPath}/${version}/${architecture}-${target}/${filename}`;
}

function getArchitecture(): string {
	if (process.arch === "x32" || process.arch === "ia32") {
		return "i686";
	}
	if (process.arch === "x64") {
		return "x86_64";
	}
	throw new Error(`Architecture "${process.arch}" is not supported by TabNine`);
}

function getTargetAndFileNameByPlatform(): {
	target: string;
	filename: string;
} {
	if (process.platform === "win32") {
		return { target: "pc-windows-gnu", filename: "TabNine.exe" };
	}
	if (process.platform === "darwin") {
		return { target: "apple-darwin", filename: "TabNine" };
	}
	if (process.platform === "linux") {
		return { target: "unknown-linux-musl", filename: "TabNine" };
	}
	throw new Error(`Platform "${process.platform}" is not supported by TabNine`);
}

async function isFileExists(root: string): Promise<boolean> {
	try {
		await fsp.stat(root);
		return true;
	} catch (err) {
		if (err.code === "ENOENT") {
			return false;
		}
		throw err;
	}
}

export function showErrorMessage(err: any) {
	vscode.window.showErrorMessage(err instanceof Error ? err.message : err);
}

export function logError(err: any) {
	console.error(err instanceof Error ? err.message : err);
}
