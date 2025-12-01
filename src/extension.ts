import * as vscode from 'vscode';
import { convertSublimeSnippets } from './sublimeConverter';

export function activate(context: vscode.ExtensionContext) {

	const disposable = vscode.commands.registerCommand('sublime.convertSnippets', async () => {
		try {
			const workspaceDir = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;

			const selection = await vscode.window.showOpenDialog({
				canSelectFiles: false,
				canSelectFolders: true,
				canSelectMany: false,
				openLabel: 'Select Sublime snippets folder',
			});

			if (!selection || selection.length === 0) {
				vscode.window.showInformationMessage('Snippet conversion canceled.');
				return;
			}

			const folderPath = selection[0].fsPath;
			const { userPath, workspacePath } = await convertSublimeSnippets(folderPath, workspaceDir);

			const destinations = workspacePath
				? `User snippets: ${userPath}\nWorkspace copy: ${workspacePath}`
				: `User snippets: ${userPath}\n(No workspace open, skipped workspace copy)`;

			vscode.window.showInformationMessage(`Sublime snippets converted.\n${destinations}`);
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error);
			vscode.window.showErrorMessage(`Snippet conversion failed: ${message}`);
		}
	});

	context.subscriptions.push(disposable);
}

export function deactivate() {}
