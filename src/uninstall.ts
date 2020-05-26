import { reportUninstallToTabNine } from "./tabnine";

(async function main() {
	try {
		const exitCode = await reportUninstallToTabNine();
		process.exit(exitCode);
	} catch (err) {
		console.error(err);
	}
})();
