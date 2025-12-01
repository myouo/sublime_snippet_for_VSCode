# Sublime Snippet Converter

`sublime_snippet` helps you reuse your existing Sublime Text snippets in VS Code. The extension scans a folder of `.sublime-snippet` files, parses each definition, and generates the equivalent VS Code snippet JSON so you do not have to rebuild them manually.

## Features

- Converts every `.sublime-snippet` file in a folder with one command (`Sublime: Convert Snippets`).
- Normalizes line endings and keeps your Sublime `tabTrigger`, content, scope, and a default description.
- Writes the converted snippets to both the global VS Code snippet directory _and_ the current workspace’s `.vscode/sublime-converted.code-snippets` file for easy sharing with teammates.
- Provides clear success and error notifications so you always know where the snippets were written.

## Requirements

- VS Code `1.90.0` or newer.
- A folder containing one or more valid Sublime Text snippet files (`*.sublime-snippet`) using the standard `<snippet>` schema (must include `<content>` and `<tabTrigger>` nodes).

No external CLI tools are required—the extension embeds the conversion logic and uses `xml2js` under the hood.

## Usage

1. Ensure your Sublime snippets are grouped in a folder (nested folders are not required; every file in the selected folder must be a Sublime snippet file).
2. In VS Code, run the **Command Palette** (`Ctrl+Shift+P` / `Cmd+Shift+P`) and execute **`Sublime: Convert Snippets`**.
3. Pick the folder that contains the `.sublime-snippet` files when prompted.
4. Wait for the success toast. It will list:
   - The path of the generated user snippet file (usually under `~/Library/Application Support/Code/User/snippets` on macOS, `%APPDATA%\Code\User\snippets` on Windows, or `~/.config/Code/User/snippets` on Linux).
   - The workspace copy at `<workspace>/.vscode/sublime-converted.code-snippets` when applicable. If no folder is open, the workspace copy is skipped automatically.
5. Reload VS Code (or use *Preferences: Configure User Snippets* → *Reload Snippets*) to start using the imported snippets.

## Extension Settings

This extension does not add custom settings. Conversion behavior is intentionally simple: every `.sublime-snippet` file becomes one entry in the generated `sublime-converted.code-snippets` collection.

## Known Issues & Limitations

- Nested folders are not traversed—select the exact folder that contains the snippet files.
- Custom Sublime fields outside of `<content>`, `<tabTrigger>`, and `<scope>` are ignored.
- Conversion stops when a malformed XML file is detected to avoid producing partial results.

If you hit other edge cases, please open an issue with the problematic snippet file attached.

## Development

1. `npm install`
2. Run the **Launch Extension** configuration (`F5`) to open a new Extension Development Host.
3. Trigger the `Sublime: Convert Snippets` command inside the dev host and select a folder with sample snippets (see `testcases/` for small fixtures).
4. Run `npm test` to execute the VS Code extension tests or `npm run lint` for ESLint.

## Release Notes

### 0.0.1

- Initial release with folder-based conversion and user/workspace snippet output.
