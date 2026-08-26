'use client';

import React, { forwardRef, useImperativeHandle, useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { SupportedLanguage } from '@/types/problem';
import { ConstraintViolation } from '@/types/submission';

interface CodeEditorProps {
  value: string;
  onChange: (val: string) => void;
  language: SupportedLanguage;
  fontSize?: number;
  readOnly?: boolean;
  violations?: ConstraintViolation[];
  onCursorChange?: (line: number, column: number) => void;
}

export interface CodeEditorRef {
  getValue: () => string;
  setValue: (val: string) => void;
}

const CodeEditor = forwardRef<CodeEditorRef, CodeEditorProps>(({
  value,
  onChange,
  language,
  fontSize = 14,
  readOnly = false,
  violations = [],
  onCursorChange,
}, ref) => {
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<any>(null);
  const decorationsRef = useRef<string[]>([]);

  useImperativeHandle(ref, () => ({
    getValue: () => {
      return editorRef.current ? editorRef.current.getValue() : '';
    },
    setValue: (val: string) => {
      if (editorRef.current) {
        editorRef.current.setValue(val);
      }
    },
  }));

  const handleEditorWillMount = (monaco: any) => {
    monaco.editor.defineTheme('fiesta-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [],
      colors: {
        'editor.background': '#0d0d1f',
        'editorGutter.background': '#0a0a18',
        'editor.lineHighlightBackground': '#181832',
      },
    });
  };

  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // Track cursor position
    editor.onDidChangeCursorPosition((e: any) => {
      if (onCursorChange) {
        onCursorChange(e.position.lineNumber, e.position.column);
      }
    });

    applyDecorations();
  };

  const applyDecorations = () => {
    if (!editorRef.current || !monacoRef.current) return;
    const editor = editorRef.current;
    const monaco = monacoRef.current;

    // Clear existing decorations
    decorationsRef.current = editor.deltaDecorations(decorationsRef.current, []);

    if (!violations || violations.length === 0) return;

    const newDecorations = violations.map((v) => ({
      range: new monaco.Range(v.line, 1, v.line, 100),
      options: {
        isWholeLine: true,
        inlineClassName: 'text-decoration-squiggly-red',
        glyphMarginClassName: 'gutter-violation-icon',
        glyphMarginHoverMessage: { value: v.message },
        hoverMessage: { value: v.message },
      },
    }));

    decorationsRef.current = editor.deltaDecorations([], newDecorations);
  };

  useEffect(() => {
    applyDecorations();
  }, [violations]);

  // Map supported languages to Monaco languages
  const getMonacoLanguage = (lang: SupportedLanguage) => {
    switch (lang) {
      case 'cpp':
        return 'cpp';
      case 'python':
        return 'python';
      case 'java':
        return 'java';
      case 'javascript':
        return 'javascript';
      default:
        return 'cpp';
    }
  };

  return (
    <div className="absolute inset-0 w-full h-full">
      <link
        href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&display=swap"
        rel="stylesheet"
      />
      <style dangerouslySetInnerHTML={{ __html: `
        .text-decoration-squiggly-red {
          text-decoration: underline red wavy !important;
        }
        .gutter-violation-icon {
          background: #ef4444;
          border-radius: 50%;
          width: 8px !important;
          height: 8px !important;
          margin-left: auto;
          margin-right: auto;
          margin-top: 5px;
          box-shadow: 0 0 8px #ef4444;
        }
      `}} />
      <Editor
        height="100%"
        language={getMonacoLanguage(language)}
        value={value}
        onChange={(val) => onChange(val || '')}
        theme="fiesta-dark"
        beforeMount={handleEditorWillMount}
        onMount={handleEditorDidMount}
        options={{
          glyphMargin: true,
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: fontSize,
          lineNumbers: 'on',
          minimap: { enabled: false },
          wordWrap: 'off',
          readOnly: readOnly,
          automaticLayout: true,
          padding: { top: 12, bottom: 12 },
          contextmenu: true,
          scrollbar: {
            verticalScrollbarSize: 8,
            horizontalScrollbarSize: 8,
          },
        }}
      />
    </div>
  );
});

CodeEditor.displayName = 'CodeEditor';
export default CodeEditor;
