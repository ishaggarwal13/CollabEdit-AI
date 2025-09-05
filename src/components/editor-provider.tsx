'use client';

import { createContext, useContext, Dispatch, SetStateAction, ReactNode } from 'react';
import type { Editor } from '@tiptap/react';

type EditorContextType = {
  editor: Editor | null;
  setEditor: Dispatch<SetStateAction<Editor | null>>;
};

const EditorContext = createContext<EditorContextType | undefined>(undefined);

export function EditorProvider({
  children,
  editor,
  setEditor,
}: {
  children: ReactNode;
  editor: Editor | null;
  setEditor: Dispatch<SetStateAction<Editor | null>>;
}) {
  return (
    <EditorContext.Provider value={{ editor, setEditor }}>
      {children}
    </EditorContext.Provider>
  );
}

export function useEditorContext() {
  const context = useContext(EditorContext);
  if (context === undefined) {
    throw new Error('useEditorContext must be used within an EditorProvider');
  }
  return context;
}
