import "dotenv/config";

import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const distDir = path.resolve(rootDir, "dist");

const DEFAULT_HOST = "127.0.0.1";
const DEFAULT_PORT = 4321;
const baseDir = normalizeBaseDir(process.env.BASE_DIR ?? "/");
const baseDirNoSlash = baseDir.slice(0, -1);

const host = process.env.START_DEV_HOST ?? process.env.HOST ?? DEFAULT_HOST;
const port = parsePort(process.env.START_DEV_PORT ?? process.env.PORT, DEFAULT_PORT);

const contentTypes = new Map([
	[".css", "text/css; charset=utf-8"],
	[".gif", "image/gif"],
	[".html", "text/html; charset=utf-8"],
	[".ico", "image/x-icon"],
	[".jpeg", "image/jpeg"],
	[".jpg", "image/jpeg"],
	[".js", "text/javascript; charset=utf-8"],
	[".json", "application/json; charset=utf-8"],
	[".map", "application/json; charset=utf-8"],
	[".png", "image/png"],
	[".svg", "image/svg+xml"],
	[".txt", "text/plain; charset=utf-8"],
	[".ttf", "font/ttf"],
	[".webmanifest", "application/manifest+json; charset=utf-8"],
	[".webp", "image/webp"],
	[".woff", "font/woff"],
	[".woff2", "font/woff2"],
	[".xml", "application/xml; charset=utf-8"],
]);

const server = createServer(async (req, res) => {
	try {
		if (!req.url) {
			sendError(res, 400, "Bad Request");
			return;
		}

		if (req.method !== "GET" && req.method !== "HEAD") {
			res.setHeader("Allow", "GET, HEAD");
			sendError(res, 405, "Method Not Allowed");
			return;
		}

		const requestUrl = new URL(req.url, `http://${host}:${port}`);
		const pathname = decodeURIComponent(requestUrl.pathname);

		if (pathname === "/") {
			redirect(res, `${baseDir}${requestUrl.search}`);
			return;
		}

		if (pathname === baseDirNoSlash) {
			redirect(res, `${baseDir}${requestUrl.search}`);
			return;
		}

		if (!pathname.startsWith(baseDir)) {
			sendError(res, 404, "Not Found");
			return;
		}

		if (!path.extname(pathname) && !pathname.endsWith("/")) {
			redirect(res, `${pathname}/${requestUrl.search}`);
			return;
		}

		const filePath = await resolveRequestPath(pathname);
		if (!filePath) {
			sendError(res, 404, "Not Found");
			return;
		}

		const extension = path.extname(filePath).toLowerCase();
		const contentType = contentTypes.get(extension) ?? "application/octet-stream";
		const fileBuffer = await readFile(filePath);

		res.statusCode = 200;
		res.setHeader("Content-Type", contentType);
		res.setHeader("Content-Length", fileBuffer.byteLength);
		if (req.method === "HEAD") {
			res.end();
			return;
		}

		res.end(fileBuffer);
	}
	catch (error) {
		console.error(error);
		sendError(res, 500, "Internal Server Error");
	}
});

server.listen(port, host, () => {
	const siteUrl = `http://${host}:${port}${baseDir}`;
	console.log(`start:dev server running at ${siteUrl}`);
	console.log(`dist root: ${distDir}`);
});

async function resolveRequestPath(pathname) {
	const relativePath = pathname.slice(baseDir.length - 1);
	const candidates = pathname.endsWith("/")
		? [path.posix.join(relativePath, "index.html")]
		: [relativePath];

	for (const candidate of candidates) {
		const resolvedPath = resolveDistPath(candidate);
		if (!resolvedPath) continue;

		try {
			const fileStat = await stat(resolvedPath);
			if (fileStat.isFile()) return resolvedPath;
		}
		catch {
			// Try the next candidate.
		}
	}

	return null;
}

function resolveDistPath(relativePath) {
	const normalizedRelativePath = relativePath.replace(/^\/+/, "");
	const resolvedPath = path.resolve(distDir, normalizedRelativePath);
	const relativeToDist = path.relative(distDir, resolvedPath);

	if (relativeToDist.startsWith("..") || path.isAbsolute(relativeToDist)) {
		return null;
	}

	return resolvedPath;
}

function normalizeBaseDir(value) {
	if (!value || value === "/") return "/";

	let normalized = value.trim();
	if (!normalized.startsWith("/")) normalized = `/${normalized}`;
	if (!normalized.endsWith("/")) normalized = `${normalized}/`;
	return normalized;
}

function parsePort(rawValue, fallback) {
	const parsed = Number.parseInt(rawValue ?? "", 10);
	if (Number.isNaN(parsed) || parsed <= 0) return fallback;
	return parsed;
}

function redirect(res, location) {
	res.statusCode = 302;
	res.setHeader("Location", location);
	res.end();
}

function sendError(res, statusCode, message) {
	res.statusCode = statusCode;
	res.setHeader("Content-Type", "text/plain; charset=utf-8");
	res.end(message);
}
