import { LanguageAdapter } from '../types';

function extractIdentifier(node: any): string | null {
  if (!node) return null;
  if (node.type === 'identifier' || node.type === 'field_identifier') return node.text;
  for (let i = 0; i < node.childCount; i++) {
    const res = extractIdentifier(node.child(i));
    if (res) return res;
  }
  return null;
}

export const GoAdapter: LanguageAdapter = {
  languageId: 'go',
  isFunctionDeclaration: (type) => ['function_declaration', 'method_declaration'].includes(type),
  isFunctionCall: (type) => ['call_expression'].includes(type),
  getFunctionName: (node: any) => {
    if (node.type === 'function_declaration' || node.type === 'method_declaration') {
      const nameNode = node.childForFieldName('name');
      return extractIdentifier(nameNode);
    }
    if (node.type === 'call_expression') {
      const func = node.childForFieldName('function');
      return extractIdentifier(func);
    }
    return null;
  },
  isLoop: (type) => ['for_statement'].includes(type),
};
