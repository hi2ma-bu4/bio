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
		name: "jsdoc-check",
		hooks: {
			"astro:config:setup": ({ updateConfig }) => {
				updateConfig({
					vite: {
						plugins: [
							{
								name: "vite-plugin-jsdoc-check",
								enforce: "pre",
								transform(code, id) {
									if (!id.endsWith(".ts") || isExcluded(id)) {
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
					const uniqueWarnings = Array.from(new Set(warnings.map((w) => JSON.stringify(w)))).map((s) => JSON.parse(s) as Warning);
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

/**
 * NodeのJSDocを取得
 */
function getJSDocs(node: ts.Node, sourceFile: ts.SourceFile): ts.JSDoc[] {
	if ((node as any).jsDoc) {
		return (node as any).jsDoc;
	}

	const fullText = sourceFile.getFullText();
	const comments = ts.getLeadingCommentRanges(fullText, node.getFullStart());
	const jsDocs: ts.JSDoc[] = [];

	if (comments) {
		for (const comment of comments) {
			if (comment.kind === ts.SyntaxKind.MultiLineCommentTrivia) {
				const text = fullText.substring(comment.pos, comment.end);
				if (text.startsWith("/**")) {
					const tempSource = ts.createSourceFile("temp.ts", text + "\nfunction dummy() {}", ts.ScriptTarget.Latest, true);
					const dummy = tempSource.statements[0];
					if ((dummy as any).jsDoc) {
						jsDocs.push(...(dummy as any).jsDoc);
					}
				}
			}
		}
	}
	return jsDocs;
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
			validateFunction(node, addWarning, sourceFile);
		} else if (ts.isClassDeclaration(node)) {
			validateClass(node, addWarning, sourceFile);
		} else if (ts.isVariableStatement(node)) {
			validateVariable(node, addWarning, sourceFile);
		}
	});

	return warnings;
}

function getCommentText(comment: string | ts.NodeArray<ts.JSDocComment> | undefined): string {
	if (!comment) return "";
	if (typeof comment === "string") return comment;
	return ts.displayPartsToString(comment as any);
}

function validateFunction(node: ts.FunctionDeclaration | ts.MethodDeclaration | ts.ConstructorDeclaration, addWarning: (node: ts.Node, message: string) => void, sourceFile: ts.SourceFile) {
	const jsDocs = getJSDocs(node, sourceFile);
	const name = ts.isConstructorDeclaration(node) ? "constructor" : node.name?.getText() || "anonymous";

	if (jsDocs.length === 0) {
		addWarning(node, `Missing JSDoc for function/method "${name}"`);
		return;
	}

	const doc = jsDocs[0];
	const params = node.parameters;
	const jsDocParams = doc.tags?.filter(ts.isJSDocParameterTag) || [];

	params.forEach((param) => {
		const paramName = param.name.getText();
		const jsDocParam = jsDocParams.find((tag) => (tag as ts.JSDocParameterTag).name.getText() === paramName) as ts.JSDocParameterTag | undefined;

		if (!jsDocParam) {
			addWarning(node, `Missing JSDoc @param for "${paramName}" in function "${name}"`);
		} else {
			const commentText = getCommentText(jsDocParam.comment).trim();
			if (!commentText || !/^- \S+/.test(commentText)) {
				addWarning(jsDocParam, `JSDoc @param "${paramName}" must follow the format "@param ${paramName} - description" (with space before and after hyphen)`);
			}
		}
	});

	jsDocParams.forEach((jsDocParam) => {
		const jsDocParamName = (jsDocParam as ts.JSDocParameterTag).name.getText();
		if (!params.some((p) => p.name.getText() === jsDocParamName)) {
			addWarning(jsDocParam, `JSDoc @param "${jsDocParamName}" does not exist in function parameters for "${name}"`);
		}
	});

	const isVoid = node.type?.kind === ts.SyntaxKind.VoidKeyword;
	const isPromiseVoid = node.type && ts.isTypeReferenceNode(node.type) && node.type.typeName.getText() === "Promise" && node.type.typeArguments?.[0]?.kind === ts.SyntaxKind.VoidKeyword;
	const isConstructor = ts.isConstructorDeclaration(node);

	if (!isVoid && !isPromiseVoid && !isConstructor) {
		const returnTag = doc.tags?.find((tag) => tag.tagName.getText() === "returns");
		if (!returnTag) {
			if (node.type) {
				if (doc.tags?.some((tag) => tag.tagName.getText() === "return")) {
					addWarning(node, `@return tag should be @returns for function/method "${name}"`);
				} else {
					addWarning(node, `Missing @returns tag for function/method "${name}"`);
				}
			}
		} else {
			const commentText = getCommentText(returnTag.comment);
			if (!commentText || commentText.trim().length === 0) {
				addWarning(returnTag, `@returns tag must have a description for "${name}"`);
			}
		}
	}
}

function validateClass(node: ts.ClassDeclaration, addWarning: (node: ts.Node, message: string) => void, sourceFile: ts.SourceFile) {
	const jsDocs = getJSDocs(node, sourceFile);
	const className = node.name?.getText() || "anonymous";

	if (jsDocs.length === 0) {
		addWarning(node, `Missing JSDoc for class "${className}"`);
	}

	node.members.forEach((member) => {
		if (ts.isMethodDeclaration(member)) {
			validateFunction(member, addWarning, sourceFile);
		} else if (ts.isPropertyDeclaration(member)) {
			validateProperty(member, addWarning, sourceFile);
		} else if (ts.isConstructorDeclaration(member)) {
			validateFunction(member, addWarning, sourceFile);
		}
	});
}

function validateProperty(node: ts.PropertyDeclaration, addWarning: (node: ts.Node, message: string) => void, sourceFile: ts.SourceFile) {
	const jsDocs = getJSDocs(node, sourceFile);
	const propName = node.name.getText();

	if (jsDocs.length === 0) {
		addWarning(node, `Missing JSDoc for property "${propName}"`);
	} else {
		const doc = jsDocs[0];
		const hasComment = getCommentText(doc.comment).trim().length > 0;
		const hasSummaryTag = doc.tags?.some((tag) => tag.tagName.getText() === "summary" && getCommentText(tag.comment).trim().length > 0);

		if (!hasComment && !hasSummaryTag) {
			addWarning(node, `JSDoc for property "${propName}" must have a description`);
		}
	}
}

function validateVariable(node: ts.VariableStatement, addWarning: (node: ts.Node, message: string) => void, sourceFile: ts.SourceFile) {
	const isExported = node.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword);
	if (!isExported) return;

	const jsDocs = getJSDocs(node, sourceFile);
	const varNames = node.declarationList.declarations.map((d) => d.name.getText()).join(", ");

	if (jsDocs.length === 0) {
		addWarning(node, `Missing JSDoc for exported variable(s): ${varNames}`);
	} else {
		const doc = jsDocs[0];
		const hasComment = getCommentText(doc.comment).trim().length > 0;

		if (!hasComment) {
			addWarning(node, `JSDoc for exported variable(s) "${varNames}" must have a description`);
		}
	}
}
