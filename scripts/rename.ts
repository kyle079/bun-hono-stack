// Runs once as the `bun-create` postinstall hook: replaces the template name
// with the project name, reinstalls so the lockfile matches, then deletes
// itself. Safe to run again; does nothing while the name is still the template's.
import {
	readdirSync,
	readFileSync,
	rmdirSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import { basename, join, relative, resolve } from "node:path";

const TEMPLATE = "bun-hono-stack";
const root = resolve(import.meta.dir, "..");
const self = relative(root, import.meta.path).replaceAll("\\", "/");

const SKIP_DIRS = new Set(["node_modules", ".git", "dist", ".turbo"]);
const SKIP_FILES = new Set([self]);
const MAX_BYTES = 2_000_000;

function normalise(raw: string) {
	return raw
		.trim()
		.toLowerCase()
		.replace(/^@[^/]*\//, "")
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "")
		.slice(0, 50)
		.replace(/-+$/, "");
}

function* textFiles(dir: string): Generator<string> {
	for (const entry of readdirSync(dir, { withFileTypes: true })) {
		const path = join(dir, entry.name);
		if (entry.isDirectory()) {
			if (!SKIP_DIRS.has(entry.name)) yield* textFiles(path);
		} else if (
			entry.isFile() &&
			!SKIP_FILES.has(relative(root, path).replaceAll("\\", "/"))
		) {
			yield path;
		}
	}
}

const pkgPath = join(root, "package.json");
const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));

const name = normalise(
	pkg.name && pkg.name !== TEMPLATE ? pkg.name : basename(root),
);

if (name === TEMPLATE) {
	console.log(`Name is still "${TEMPLATE}"; nothing to rename.`);
	process.exit(0);
}
if (!name) {
	console.error("Could not derive a valid project name from the folder name.");
	process.exit(1);
}
if (name.includes(TEMPLATE)) {
	console.error(`Project name must not contain "${TEMPLATE}". Pick another.`);
	process.exit(1);
}

let changed = 0;
for (const path of textFiles(root)) {
	const buf = readFileSync(path);
	if (buf.length > MAX_BYTES || buf.subarray(0, 8192).includes(0)) continue;
	const before = buf.toString("utf8");
	const after = before
		.replace(/<!-- template:start -->[\s\S]*?<!-- template:end -->\r?\n?/g, "")
		.replaceAll(TEMPLATE, name);
	if (after === before) continue;
	writeFileSync(path, after);
	changed++;
}

// Remove this script's own entry points from package.json.
const next = JSON.parse(readFileSync(pkgPath, "utf8"));
next.name = name;
delete next["bun-create"];
writeFileSync(
	pkgPath,
	`${JSON.stringify(next, null, "\t")}\n`.replace(/\n/g, detectEol(pkgPath)),
);

console.log(`Renamed ${TEMPLATE} -> ${name} in ${changed} files.`);

// Package names changed, so the lockfile needs to be rewritten.
const install = Bun.spawnSync([process.execPath, "install"], {
	cwd: root,
	stdio: ["inherit", "inherit", "inherit"],
});
if (install.exitCode !== 0) {
	console.error("bun install failed; fix the error and run it again.");
	process.exit(install.exitCode ?? 1);
}

// Import order depends on package names, so let Biome re-sort.
Bun.spawnSync([process.execPath, "run", "check"], {
	cwd: root,
	stdio: ["inherit", "inherit", "inherit"],
});

rmSync(import.meta.path);
try {
	rmdirSync(join(root, "scripts"));
} catch {
	// scripts/ still holds other files; leave it.
}

// `bun create` commits before this hook runs. Fold the rename into that
// commit so the new project starts with a clean tree. Only ever touches a
// repository whose history is that single initial commit.
const git = (...args: string[]) =>
	Bun.spawnSync(["git", ...args], {
		cwd: root,
		stdout: "pipe",
		stderr: "pipe",
	});
if (git("rev-list", "--count", "HEAD").stdout.toString().trim() === "1") {
	git("add", "-A");
	git("commit", "--quiet", "--amend", "--no-edit");
}

function detectEol(path: string) {
	return readFileSync(path, "utf8").includes("\r\n") ? "\r\n" : "\n";
}
