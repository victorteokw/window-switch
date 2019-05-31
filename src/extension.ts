import {
	Disposable, ExtensionContext, commands, window, ViewColumn, TextDocument, workspace, QuickPickItem, QuickPick, ThemeIcon, Uri, DocumentHighlight
} from 'vscode';
import shouldIgnoreDocument from "./shouldIgnoreDocument";
import TextDocumentItem from "./TextDocumentItem";

let lastEditorDisposable: Disposable | undefined;
let lastFileDisposable: Disposable | undefined;
let lastFileDisposable2: Disposable | undefined;
let lastDocument: TextDocument | undefined;
let currentDocument: TextDocument | undefined;
let openedDocuments: TextDocument[] = [];

export function activate(context: ExtensionContext) {

  workspace.textDocuments.forEach((doc) => {
		if (!shouldIgnoreDocument(doc)) {
			openedDocuments.push(doc);
		}
	});

	lastEditorDisposable = window.onDidChangeActiveTextEditor((editor) => {
		if (editor) {
			if (editor.document) {
				if (!shouldIgnoreDocument(editor.document)) {
					const index = openedDocuments.indexOf(editor.document);
					if (index > -1) {
						openedDocuments.splice(index, 1);
					}
					openedDocuments.unshift(editor.document);
				}
			}
			if (currentDocument !== editor.document) {
				lastDocument = currentDocument;
				currentDocument = editor.document;
			}
		}
	});

	lastFileDisposable = workspace.onDidOpenTextDocument((textDocument) => {
		if (shouldIgnoreDocument(textDocument)) return;
		if (openedDocuments.indexOf(textDocument) === -1) {
			openedDocuments.unshift(textDocument);
		}
	});

	lastFileDisposable2 = workspace.onDidCloseTextDocument((textDocument) => {
		const index = openedDocuments.indexOf(textDocument);
		if (index > -1) {
			openedDocuments.splice(index, 1);
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
		quickPick.matchOnDescription = true;
		quickPick.matchOnDetail = true;
		const items: TextDocumentItem[] = [];
		for (const doc of openedDocuments) {
			if (window.activeTextEditor && (doc === window.activeTextEditor.document)) {
				// just ignore
			} else {
				items.push(new TextDocumentItem(doc));
			}
		}
		quickPick.onDidChangeSelection((e: TextDocumentItem[]) => {
			selected = e[0];
		});
		quickPick.onDidAccept(() => {
			if (selected) {
				window.showTextDocument(selected.textDocument, ViewColumn.Active, false);
			}
		});
		quickPick.items = items;
		quickPick.show();
	});
	context.subscriptions.push(disposable);

	disposable = commands.registerCommand('windowSwitch.saveFileInActiveEditor', () => {
		commands.executeCommand('workbench.action.files.save');
	});
	context.subscriptions.push(disposable);

	disposable = commands.registerCommand('windowSwitch.saveAllFiles', () => {
		commands.executeCommand('workbench.action.files.saveAll');
	});
	context.subscriptions.push(disposable);

	disposable = commands.registerCommand('windowSwitch.closeCurrentEditor', () => {
		commands.executeCommand('workbench.action.closeActiveEditor');
	});
	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {
	(<Disposable>lastEditorDisposable).dispose();
	(<Disposable>lastFileDisposable).dispose();
	(<Disposable>lastFileDisposable2).dispose();
}
