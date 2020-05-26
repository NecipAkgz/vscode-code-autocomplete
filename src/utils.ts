import { promises as fsp } from "fs";

export async function getTabNineVersionAndBinaryPath(
	root: string
): Promise<{ version: string; binaryPath: string }> {
	const architecture = getArchitecture();
	const postfix = getPostfixByPlatform();
	const versions = (await fsp.readdir(root)).reverse();
	const triedPaths: string[] = [];

	for (const version of versions) {
		const fullPath = `${root}/${version}/${architecture}-${postfix}`;
		triedPaths.push(fullPath);
		if (await isFileExists(fullPath)) {
			return { version, binaryPath: fullPath };
		}
	}

	throw new Error(
		`Couldn't find TabNine binary (tried following versions=${versions} and paths=${triedPaths})`
	);
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

function getPostfixByPlatform(): string {
	if (process.platform === "win32") {
		return "pc-windows-gnu/TabNine.exe";
	}
	if (process.platform === "darwin") {
		return "apple-darwin/TabNine";
	}
	if (process.platform === "linux") {
		return "unknown-linux-musl/TabNine";
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
