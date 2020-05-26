const https = require("https");
const fs = require("fs");
const path = require("path");

const targets = [
	"i686-pc-windows-gnu",
	"i686-unknown-linux-musl",
	"x86_64-apple-darwin",
	"x86_64-pc-windows-gnu",
	"x86_64-unknown-linux-musl",
];

(async function main() {
	const tabNineVersionFromWeb = await getTabNineVersionFromWeb();
	const [tabNineVersionFromBinariesDir] = await fs.promises.readdir(
		path.resolve("binaries")
	);

	if (tabNineVersionFromWeb <= tabNineVersionFromBinariesDir) {
		console.log("TabNine binaries are currently up-to-date");
		return;
	}

	if (tabNineVersionFromBinariesDir) {
		console.log(
			`Deleting TabNine ${tabNineVersionFromBinariesDir} binaries...\n`
		);
		await fs.promises.rmdir(
			path.resolve("binaries", tabNineVersionFromBinariesDir),
			{ recursive: true }
		);
	}

	const newBinariesPath = path.resolve("binaries", tabNineVersionFromWeb);
	console.log(`Downloading TabNine ${tabNineVersionFromWeb} binaries...\n`);
	for (const target of targets) {
		await fs.promises.mkdir(path.join(newBinariesPath, target), {
			recursive: true,
		});

		const filename = target.includes("windows") ? "TabNine.exe" : "TabNine";
		const file = fs.createWriteStream(
			path.join(newBinariesPath, target, filename),
			{ mode: 0o755 }
		);

		const request = https.request(
			`https://update.tabnine.com/${tabNineVersionFromWeb}/${target}/${filename}`,
			(res) => {
				res.pipe(file).on("close", () => {
					console.log(
						`Downloaded TabNine binary: ${file.path.replace(
							process.cwd(),
							"."
						)}`
					);
				});
				res.on("error", console.error);
			}
		);

		request.on("error", console.error);
		request.end();
	}
})();

async function getTabNineVersionFromWeb() {
	return new Promise((resolve, reject) => {
		const request = https.request(
			"https://update.tabnine.com/version",
			{ method: "GET" },
			(res) => {
				let output = "";
				res.setEncoding("utf-8");
				res.on("data", (chunk) => (output += chunk));
				res.on("end", () => resolve(output.trimRight()));
				res.on("error", reject);
			}
		);

		request.on("error", reject);
		request.end();
	});
}
