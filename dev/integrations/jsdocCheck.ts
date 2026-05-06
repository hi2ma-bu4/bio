import type { AstroIntegration } from "astro";
import picomatch from "picomatch";
import ts from "typescript";

interface JSDocCheckOptions {
	exclude?: string[];
}

interface Warning {
	file: string;
	line: number;
	message: string;
}

export default function jsdocCheckIntegration(options: JSDocCheckOptions = {}): AstroIntegration {
	const warnings: Warning[] = [];
	const excludePatterns = options.exclude || [];
	const isExcluded = (id: string) => {
		return excludePatterns.some((pattern) => picomatch.isMatch(id, pattern));
	};

	return {
		name: "jsdoc-check-integration",
		hooks: {
			"astro:config:setup": ({ updateConfig }) => {
				updateConfig({
					vite: {
						plugins: [
							{
								name: "vite-plugin-jsdoc-check",
								transform(code, id) {
									// .ts ファイルのみをチェックし、node_modules とユーザー定義の除外を除外します。
									if (!id.endsWith(".ts") || id.includes("node_modules") || isExcluded(id)) {
										return null;
									}

									const sourceFile = ts.createSourceFile(id, code, ts.ScriptTarget.Latest, true);
									const fileWarnings = checkJSDoc(sourceFile, id);
									warnings.push(...fileWarnings);

									return null;
								},
							},
						],
					},
				});
			},
			"astro:build:done": ({ logger }) => {
				if (warnings.length > 0) {
					// 重複排除の警告 (Vite は、transform を複数回呼び出す可能性があります)
					const uniqueWarnings = Array.from(new Set(warnings.map((w) => JSON.stringify(w)))).map((s) => JSON.parse(s) as Warning);

					// 警告をファイルおよび行ごとに並べ替える
					uniqueWarnings.sort((a, b) => {
						if (a.file !== b.file) return a.file.localeCompare(b.file);
						return a.line - b.line;
					});

					uniqueWarnings.forEach((w) => {
						const relativePath = w.file.split("src/").slice(-1)[0] || w.file;
						logger.warn(`${relativePath}:${w.line} - ${w.message}`);
					});
					logger.warn(`JSDoc check found ${uniqueWarnings.length} warnings.`);
				} else {
					logger.info("JSDoc check passed.");
				}
			},
		},
	};
}

function checkJSDoc(sourceFile: ts.SourceFile, fileName: string): Warning[] {
	const warnings: Warning[] = [];

	function addWarning(node: ts.Node, message: string) {
		const { line } = sourceFile.getLineAndCharacterOfPosition(node.getStart());
		warnings.push({
			file: fileName,
			line: line + 1,
			message,
		});
	}

	ts.forEachChild(sourceFile, (node) => {
		if (ts.isFunctionDeclaration(node)) {
			validateFunction(node, addWarning);
		} else if (ts.isClassDeclaration(node)) {
			validateClass(node, addWarning);
		} else if (ts.isVariableStatement(node)) {
			validateVariable(node, addWarning);
		}
	});

	return warnings;
}

function getCommentText(comment: string | ts.NodeArray<ts.JSDocComment> | undefined): string {
	if (!comment) return "";
	if (typeof comment === "string") return comment;
	return ts.displayPartsToString(comment as any);
}

function validateFunction(node: ts.FunctionDeclaration | ts.MethodDeclaration, addWarning: (node: ts.Node, message: string) => void) {
	const jsDoc = (node as any).jsDoc as ts.JSDoc[] | undefined;
	const name = node.name?.getText() || "anonymous";

	if (!jsDoc || jsDoc.length === 0) {
		addWarning(node, `Missing JSDoc for function/method "${name}"`);
		return;
	}

	const doc = jsDoc[0];
	const params = node.parameters;
	const jsDocParams = doc.tags?.filter(ts.isJSDocParameterTag) || [];

	// Check each parameter of the function
	params.forEach((param) => {
		const paramName = param.name.getText();
		const jsDocParam = jsDocParams.find((tag) => tag.name.getText() === paramName) as ts.JSDocParameterTag | undefined;

		if (!jsDocParam) {
			addWarning(node, `Missing JSDoc @param for "${paramName}" in function "${name}"`);
		} else {
			const commentText = getCommentText(jsDocParam.comment);

			// Format check: @param name - desc
			// We expect the comment to start with " - " followed by something
			if (!commentText || !/^ - \S+/.test(commentText)) {
				addWarning(jsDocParam, `JSDoc @param "${paramName}" must follow the format "@param ${paramName} - description" (with space before and after hyphen)`);
			}
		}
	});

	// 余分な JSDoc パラメータを確認する
	jsDocParams.forEach((jsDocParam) => {
		const jsDocParamName = (jsDocParam as ts.JSDocParameterTag).name.getText();
		if (!params.some((p) => p.name.getText() === jsDocParamName)) {
			addWarning(jsDocParam, `JSDoc @param "${jsDocParamName}" does not exist in function parameters for "${name}"`);
		}
	});

	// Check returns
	const isVoid = node.type?.kind === ts.SyntaxKind.VoidKeyword;

	if (!isVoid) {
		const returnTag = doc.tags?.find((tag) => tag.tagName.getText() === "returns" || tag.tagName.getText() === "return");
		if (!returnTag) {
			if (node.type) {
				addWarning(node, `Missing @returns tag for function/method "${name}"`);
			}
		} else {
			const commentText = getCommentText(returnTag.comment);
			if (!commentText || commentText.trim().length === 0) {
				addWarning(returnTag, `@returns tag must have a description for "${name}"`);
			}
		}
	}
}

function validateClass(node: ts.ClassDeclaration, addWarning: (node: ts.Node, message: string) => void) {
	const jsDoc = (node as any).jsDoc as ts.JSDoc[] | undefined;
	const className = node.name?.getText() || "anonymous";

	if (!jsDoc || jsDoc.length === 0) {
		addWarning(node, `Missing JSDoc for class "${className}"`);
	}

	node.members.forEach((member) => {
		if (ts.isMethodDeclaration(member)) {
			validateFunction(member, addWarning);
		} else if (ts.isPropertyDeclaration(member)) {
			validateProperty(member, addWarning);
		}
	});
}

function validateProperty(node: ts.PropertyDeclaration, addWarning: (node: ts.Node, message: string) => void) {
	const jsDoc = (node as any).jsDoc as ts.JSDoc[] | undefined;
	const propName = node.name.getText();

	if (!jsDoc || jsDoc.length === 0) {
		addWarning(node, `Missing JSDoc for property "${propName}"`);
	} else {
		const doc = jsDoc[0];
		const hasComment = getCommentText(doc.comment).trim().length > 0;
		const hasSummaryTag = doc.tags?.some((tag) => tag.tagName.getText() === "summary" && getCommentText(tag.comment).trim().length > 0);

		if (!hasComment && !hasSummaryTag) {
			addWarning(node, `JSDoc for property "${propName}" must have a description`);
		}
	}
}

function validateVariable(node: ts.VariableStatement, addWarning: (node: ts.Node, message: string) => void) {
	const isExported = node.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword);
	if (!isExported) return;

	const jsDoc = (node as any).jsDoc as ts.JSDoc[] | undefined;
	const varNames = node.declarationList.declarations.map((d) => d.name.getText()).join(", ");

	if (!jsDoc || jsDoc.length === 0) {
		addWarning(node, `Missing JSDoc for exported variable(s): ${varNames}`);
	} else {
		const doc = jsDoc[0];
		const hasComment = getCommentText(doc.comment).trim().length > 0;

		if (!hasComment) {
			addWarning(node, `JSDoc for exported variable(s) "${varNames}" must have a description`);
		}
	}
}
