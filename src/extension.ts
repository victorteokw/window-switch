import {
	Disposable, ExtensionContext, commands, window, ViewColumn, TextDocument, workspace, QuickPickItem, QuickPick, ThemeIcon, Uri, DocumentHighlight
} from 'vscode';
import shouldIgnoreDocument from "./shouldIgnoreDocument";
import TextDocumentItem from "./TextDocumentItem";

let lastEditorDisposable: Disposable | undefined;
let lastFileDisposable: Disposable | undefined;
let lastDocument: TextDocument | undefined;
let currentDocument: TextDocument | undefined;

export function activate(context: ExtensionContext) {

	lastEditorDisposable = window.onDidChangeActiveTextEditor((editor) => {
		if (editor) {
			if (currentDocument !== editor.document) {
				lastDocument = currentDocument;
				currentDocument = editor.document;
			}
		}
	});

	let disposable;

	disposable = commands.registerCommand('windowSwitch.switchToLastOpenedFile', () => {
		if (window.activeTextEditor) {
			if (lastDocument && (lastDocument !== window.activeTextEditor.document)) {
				window.showTextDocument(lastDocument, ViewColumn.Active, false);
			}
		}
	});
	context.subscriptions.push(disposable);

  disposable = commands.registerCommand('windowSwitch.listOpenedFiles', () => {
		let selected: TextDocumentItem | undefined;
		const quickPick = window.createQuickPick<TextDocumentItem>();
		quickPick.title = "Opened Files";
		const items: TextDocumentItem[] = [];
		quickPick.matchOnDescription = true;
		quickPick.matchOnDetail = true;
		workspace.textDocuments.forEach((doc) => {
			if (shouldIgnoreDocument(doc)) return;
			items.push(new TextDocumentItem(doc));
		});
		quickPick.onDidChangeSelection((e: TextDocumentItem[]) => {
			selected = e[0];
		});
		quickPick.onDidAccept(() => {
			if (selected) {
				window.showTextDocument(selected.textDocument, ViewColumn.Active, false);
			}
		});
		quickPick.items = items;
		quickPick.buttons = [{
			iconPath: ThemeIcon.File,
			tooltip: 'Learn More'
	}];
		quickPick.show();
	});
}

// this method is called when your extension is deactivated
export function deactivate() {
	(<Disposable>lastEditorDisposable).dispose();
}
