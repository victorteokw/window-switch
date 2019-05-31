import { QuickPickItem, TextDocument, workspace } from 'vscode';
import * as path from 'path';

export default class TextDocumentItem implements QuickPickItem {
  label: string;
  description?: string;
  detail?: string;
  textDocument: TextDocument;

  constructor(textDocument: TextDocument) {
    this.textDocument = textDocument;
    this.label = path.basename(textDocument.uri.path);
    if (workspace.workspaceFolders) {
      for (const folder of workspace.workspaceFolders) {
        if (textDocument.uri.path.indexOf(folder.uri.path) > -1) {
          this.description = path.relative(folder.uri.path, path.dirname(textDocument.uri.path));
          if (workspace.workspaceFolders.length > 1) {
            this.detail = path.basename(folder.uri.path);
          }
        }
      }
    }
  }
}
