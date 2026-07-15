import { cpSync, existsSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const standaloneDir = join(root, ".next", "standalone");

if (!existsSync(join(standaloneDir, "server.js"))) {
	console.error(
		"copy-standalone-assets: .next/standalone/server.js not found. Run `npm run build` first.",
	);
	process.exit(1);
}

// Required for standalone: https://nextjs.org/docs/app/api-reference/config/next-config-js/output
cpSync(join(root, "public"), join(standaloneDir, "public"), {
	recursive: true,
});
cpSync(join(root, ".next", "static"), join(standaloneDir, ".next", "static"), {
	recursive: true,
});

console.log(
	"copy-standalone-assets: copied public/ and .next/static/ into standalone",
);
