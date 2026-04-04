import type { AstroIntegration } from "astro";
import { spawnSync, type ChildProcess } from "node:child_process";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

let activeTypecheckProcess: ChildProcess | null = null;
let cleanupRegistered = false;
let projectRootDir: string | null = null;

function registerCleanup(): void {
	if (cleanupRegistered) return;
	cleanupRegistered = true;

	const stop = () => {
		activeTypecheckProcess?.kill();
		activeTypecheckProcess = null;
	};

	process.once("exit", stop);
	process.once("SIGINT", () => {
		stop();
		process.exit(130);
	});
	process.once("SIGTERM", () => {
		stop();
		process.exit(143);
	});
}

export default function typecheckIntegration(): AstroIntegration {
	return {
		name: "typecheck-integration",
		hooks: {
			"astro:config:setup": ({ config }) => {
				const rootDir = fileURLToPath(config.root);
				projectRootDir = rootDir;
			},
			"astro:build:start": ({ logger }) => {
				const rootDir = projectRootDir ?? process.cwd();
				const astroCliPath = join(rootDir, "node_modules", "astro", "astro.js");
				const result = spawnSync(process.execPath, [astroCliPath, "check", "--minimumSeverity", "error", "--minimumFailingSeverity", "error", "--noSync"], {
					cwd: rootDir,
					stdio: "inherit",
				});

				if (result.status !== 0) {
					throw new Error("Typecheck failed.");
				}

				logger.info("型チェック完了");
			},
		},
	};
}
