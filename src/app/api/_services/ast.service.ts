import { ASTAnalysisResult, LanguageAdapter } from '../_integrations/ast/types';
import { parseSourceCode } from '../_integrations/ast/parser';
import { analyzeAST } from '../_integrations/ast/analyzer';

import { CppAdapter } from '../_integrations/ast/languages/cpp';
import { JavaAdapter } from '../_integrations/ast/languages/java';
import { PythonAdapter } from '../_integrations/ast/languages/python';
import { JavaScriptAdapter } from '../_integrations/ast/languages/javascript';

const ADAPTERS: Record<string, LanguageAdapter> = {
  cpp: CppAdapter,
  java: JavaAdapter,
  python: PythonAdapter,
  javascript: JavaScriptAdapter,
};

export async function analyzeSourceCode(sourceCode: string, language: string): Promise<ASTAnalysisResult> {
  const adapter = ADAPTERS[language];

  if (!adapter) {
    return {
      analyzed: false,
      recursionDetected: false,
      loopsDetected: false,
      lineCount: 0,
      errors: ['Unsupported language'],
    };
  }

  try {
    const tree = await parseSourceCode(sourceCode, language);
    return analyzeAST(sourceCode, tree, adapter);
  } catch (error: any) {
    console.error('AST parsing failed:', error);
    return {
      analyzed: false,
      recursionDetected: false,
      loopsDetected: false,
      lineCount: 0,
      errors: ['AST parsing failed: ' + error.message],
    };
  }
}
