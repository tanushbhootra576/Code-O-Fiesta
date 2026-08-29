import { LanguageAdapter } from '../types';

function extractIdentifier(node: any): string | null {
  if (!node) return null;
  if (node.type === 'identifier') return node.text;
  for (let i = 0; i < node.childCount; i++) {
    const res = extractIdentifier(node.child(i));
    if (res) return res;
  }
  return null;
}

export const PythonAdapter: LanguageAdapter = {
  languageId: 'python',
  isFunctionDeclaration: (type) => ['function_definition'].includes(type),
  isFunctionCall: (type) => ['call'].includes(type),
  getFunctionName: (node: any) => {
    if (node.type === 'function_definition') {
      const name = node.childForFieldName('name');
      if (name) return name.text;
    }
    if (node.type === 'call') {
      const func = node.childForFieldName('function');
      return extractIdentifier(func);
    }
    return null;
  },
  isLoop: (type) => ['for_statement', 'while_statement'].includes(type),
};
