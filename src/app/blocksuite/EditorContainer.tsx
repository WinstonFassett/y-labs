import { useEffect, useRef, useState } from 'react';
import { useEditor } from './context';
import { Button } from '@/components/ui/button';

const EditorContainer = () => {
  const { editor } = useEditor() || {};

  const editorContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editorContainerRef.current && editor) {
      editorContainerRef.current.innerHTML = '';
      editorContainerRef.current.appendChild(editor);
    }
  }, [editor]);

  return <>
    
    <div className="editor-container" ref={editorContainerRef}>
    </div>;
  </>
};

export default EditorContainer;
