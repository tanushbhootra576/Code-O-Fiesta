import { ASTAnalysisResult, LanguageAdapter } from './types';
import type Parser from 'web-tree-sitter';

export function analyzeAST(
  sourceCode: string,
  tree: Parser.Tree,
  adapter: LanguageAdapter
): ASTAnalysisResult {
  let recursionDetected = false;
  let loopsDetected = false;

  const activeFunctions: string[] = [];

  function walk(node: Parser.Tree['rootNode']) {
    let isFunction = adapter.isFunctionDeclaration(node.type);
    let funcName = null;

    if (isFunction) {
      funcName = adapter.getFunctionName(node);
      console.log('Found function:', node.type, 'funcName:', funcName);
      if (funcName) {
        activeFunctions.push(funcName);
      }
    }

    if (adapter.isLoop(node.type)) {
      loopsDetected = true;
    }

    if (adapter.isFunctionCall(node.type)) {
      const callName = adapter.getFunctionName(node);
      console.log('Found function call:', node.type, 'callName:', callName, 'activeFunctions:', activeFunctions);
      if (callName && activeFunctions.includes(callName)) {
        recursionDetected = true;
      }
    }

    for (let i = 0; i < node.childCount; i++) {
      walk(node.child(i)!);
    }

    if (isFunction && funcName) {
      activeFunctions.pop();
    }
  }

  walk(tree.rootNode);

  // Line counter logic
  // "physical source lines minus completely blank lines and lines containing only braces ({ or })"
  const lines = sourceCode.split('\n');
  let lineCount = 0;
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed === '' || trimmed === '{' || trimmed === '}') {
      continue;
    }
    lineCount++;
  }

  return {
    analyzed: true,
    recursionDetected,
    loopsDetected,
    lineCount,
    errors: [],
  };
}
