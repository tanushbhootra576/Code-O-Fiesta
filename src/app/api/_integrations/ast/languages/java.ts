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

export const JavaAdapter: LanguageAdapter = {
  languageId: 'java',
  isFunctionDeclaration: (type) => ['method_declaration', 'constructor_declaration'].includes(type),
  isFunctionCall: (type) => ['method_invocation', 'object_creation_expression'].includes(type),
  getFunctionName: (node: any) => {
    if (node.type === 'method_declaration' || node.type === 'constructor_declaration') {
      const name = node.childForFieldName('name');
      if (name) return name.text;
    }
    if (node.type === 'method_invocation') {
      const name = node.childForFieldName('name');
      if (name) return name.text;
    }
    if (node.type === 'object_creation_expression') {
      const typeNode = node.childForFieldName('type');
      return extractIdentifier(typeNode);
    }
    return null;
  },
  isLoop: (type) => ['for_statement', 'enhanced_for_statement', 'while_statement', 'do_statement'].includes(type),
};
