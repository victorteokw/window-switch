import { TextDocument } from "vscode";

const shouldIgnoreDocument = (textDocument: TextDocument) => {
  const { uri } = textDocument;
  if (uri.scheme === 'git') return true;
  if (uri.scheme === 'vscode') return true;
  if (uri.path.startsWith('/Applications')) return true;
  if (uri.path.match(`^/Users/[^/]+/\.vscode/.+`)) return true;
  return false;
};

export default shouldIgnoreDocument;
