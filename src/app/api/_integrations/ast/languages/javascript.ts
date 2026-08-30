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

export const JavaScriptAdapter: LanguageAdapter = {
  languageId: 'javascript',
  isFunctionDeclaration: (type) => ['function_declaration', 'arrow_function', 'function_expression'].includes(type),
  isFunctionCall: (type) => ['call_expression'].includes(type),
  getFunctionName: (node: any) => {
    if (node.type === 'function_declaration') {
      const name = node.childForFieldName('name');
      if (name) return name.text;
    }
    if (node.type === 'call_expression') {
      const func = node.childForFieldName('function');
      return extractIdentifier(func);
    }
    // Arrow functions and expressions might be assigned to variables, we won't strictly detect recursion via variable name unless we trace back up to the declarator
    // For simple recursion in JS, usually a named function is used.
    return null;
  },
  isLoop: (type) => ['for_statement', 'for_in_statement', 'for_of_statement', 'while_statement', 'do_statement'].includes(type),
};
