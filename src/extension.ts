import { Disposable, ExtensionContext, commands, window, TextEditor, ViewColumn } from 'vscode';

let lastBufferDispose: Disposable | undefined;
let lastEditor: TextEditor | undefined;
let currentEditor: TextEditor | undefined;

export function activate(context: ExtensionContext) {
	lastBufferDispose = window.onDidChangeActiveTextEditor((editor) => {
		if (editor === currentEditor) {
			return;
		}
		lastEditor = currentEditor;
		currentEditor = editor;
	});

	let disposable = commands.registerCommand('windowSwitch.switchToLastOpenedEditor', () => {
		if (lastEditor) {
			window.showTextDocument(lastEditor.document, ViewColumn.Active, false);
		}
	});
	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {
	(<Disposable>lastBufferDispose).dispose();
}
