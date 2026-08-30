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

export const CppAdapter: LanguageAdapter = {
  languageId: 'cpp',
  isFunctionDeclaration: (type) => ['function_definition'].includes(type),
  isFunctionCall: (type) => ['call_expression'].includes(type),
  getFunctionName: (node: any) => {
    if (node.type === 'function_definition') {
      const declarator = node.childForFieldName('declarator');
      return extractIdentifier(declarator);
    }
    if (node.type === 'call_expression') {
      const func = node.childForFieldName('function');
      return extractIdentifier(func);
    }
    return null;
  },
  isLoop: (type) => ['for_statement', 'while_statement', 'do_statement'].includes(type),
};
