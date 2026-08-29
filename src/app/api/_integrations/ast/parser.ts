import type ParserType from 'web-tree-sitter';
const Parser = require('web-tree-sitter');
import path from 'path';
import fs from 'fs';

let isInitialized = false;

/**
 * Initializes the parser and parses the source code into a SyntaxTree.
 * Assumes `language` corresponds to our adapter languageIds.
 */
export async function parseSourceCode(sourceCode: string, language: string): Promise<ParserType.Tree> {
  if (!isInitialized) {
    await Parser.init({
      locateFile(scriptName: string) {
        if (scriptName === 'tree-sitter.wasm' || scriptName === 'web-tree-sitter.wasm') {
          return path.join(process.cwd(), 'node_modules', 'web-tree-sitter', 'tree-sitter.wasm');
        }
        return scriptName;
      }
    });
    isInitialized = true;
  }
  
  const parser = new Parser();
  
  let wasmFileName = '';
  switch (language) {
    case 'cpp': wasmFileName = 'tree-sitter-cpp.wasm'; break;
    case 'c': wasmFileName = 'tree-sitter-c.wasm'; break;
    case 'java': wasmFileName = 'tree-sitter-java.wasm'; break;
    case 'python': wasmFileName = 'tree-sitter-python.wasm'; break;
    case 'javascript': wasmFileName = 'tree-sitter-javascript.wasm'; break;
    case 'go': wasmFileName = 'tree-sitter-go.wasm'; break;
    default: throw new Error(`Unsupported language: ${language}`);
  }
  
  const wasmPath = path.join(process.cwd(), 'node_modules', 'tree-sitter-wasms', 'out', wasmFileName);
  
  if (!fs.existsSync(wasmPath)) {
    throw new Error(`Grammar file not found: ${wasmPath}`);
  }
  
  const lang = await Parser.Language.load(wasmPath);
  parser.setLanguage(lang);
  
  return parser.parse(sourceCode);
}
