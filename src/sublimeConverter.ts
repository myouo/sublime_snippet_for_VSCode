import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { parseStringPromise } from 'xml2js';

interface SnippetDefinition {
	prefix: string;
	body: string[];
	description: string;
	scope?: string;
}

interface ConversionResult {
	userPath: string;
	workspacePath?: string;
}

function getSnippetDirectory(): string {
	const platform = os.platform();

	if (platform === 'win32') {
		const appData = process.env.APPDATA || path.join(os.homedir(), 'AppData', 'Roaming');
		return path.join(appData, 'Code', 'User', 'snippets');
	}

	if (platform === 'darwin') {
		return path.join(os.homedir(), 'Library', 'Application Support', 'Code', 'User', 'snippets');
	}

	return path.join(os.homedir(), '.config', 'Code', 'User', 'snippets');
}

async function parseSublimeSnippet(filePath: string): Promise<SnippetDefinition> {
	const xml = await fs.promises.readFile(filePath, 'utf8');
	const parsed = await parseStringPromise(xml, { trim: false });
	const snippetNode = parsed?.snippet;

	if (!snippetNode) {
		throw new Error('Missing <snippet> root element');
	}

	const contentRaw = snippetNode.content?.[0];
	if (!contentRaw || typeof contentRaw !== 'string') {
		throw new Error('Missing <content> element');
	}

	const prefixRaw = snippetNode.tabTrigger?.[0];
	if (!prefixRaw || typeof prefixRaw !== 'string') {
		throw new Error('Missing <tabTrigger> element');
	}

	const scopeRaw = snippetNode.scope?.[0];
	const normalized = contentRaw.replace(/\r\n/g, '\n');

	return {
		prefix: prefixRaw,
		body: normalized.split('\n'),
		description: 'Converted from Sublime Text',
		scope: typeof scopeRaw === 'string' ? scopeRaw : undefined,
	};
}

export async function convertSublimeSnippets(sourceDir: string, workspaceDir?: string): Promise<ConversionResult> {
	const entries = await fs.promises.readdir(sourceDir, { withFileTypes: true });
	const targets = entries
		.filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith('.sublime-snippet'))
		.map((entry) => path.join(sourceDir, entry.name));

	if (targets.length === 0) {
		throw new Error('No .sublime-snippet files found in the selected folder');
	}

	const snippets: Record<string, SnippetDefinition> = {};

	for (const filePath of targets) {
		const name = path.basename(filePath, '.sublime-snippet');
		const definition = await parseSublimeSnippet(filePath);
		snippets[name] = definition;
	}

	const outputDir = getSnippetDirectory();
	await fs.promises.mkdir(outputDir, { recursive: true });

	const serialized = JSON.stringify(snippets, null, 2);

	const userPath = path.join(outputDir, 'sublime-converted.code-snippets');
	await fs.promises.writeFile(userPath, serialized, 'utf8');

	let workspacePath: string | undefined;

	if (workspaceDir) {
		const workspaceSnippetDir = path.join(workspaceDir, '.vscode');
		await fs.promises.mkdir(workspaceSnippetDir, { recursive: true });
		workspacePath = path.join(workspaceSnippetDir, 'sublime-converted.code-snippets');
		await fs.promises.writeFile(workspacePath, serialized, 'utf8');
	}

	return { userPath, workspacePath };
}
