export interface ASTAnalysisResult {
  analyzed: boolean;
  recursionDetected: boolean;
  loopsDetected: boolean;
  lineCount: number;
  errors: string[];
}

export interface LanguageAdapter {
  /**
   * The name of the language this adapter handles (e.g., 'cpp', 'python')
   */
  languageId: string;
  
  /**
   * Identifies if a node is a function declaration.
   */
  isFunctionDeclaration(nodeType: string): boolean;
  
  /**
   * Identifies if a node is a function call.
   */
  isFunctionCall(nodeType: string): boolean;
  
  /**
   * Extracts the name of the function being declared or called from the node.
   */
  getFunctionName(node: any): string | null;
  
  /**
   * Identifies if a node represents a loop construct.
   */
  isLoop(nodeType: string): boolean;
}
