'use client';

import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import { useEffect } from 'react';
import { useEditorContext } from './editor-provider';
import FloatingToolbar from './floating-toolbar';

const TiptapEditor = () => {
  const { setEditor } = useEditorContext();

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Start writing your document or ask the AI for help...',
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableCell,
      TableHeader,
    ],
    content: `
      <h2 style="font-family: 'Space Grotesk', sans-serif;">Welcome to CollabEdit AI</h2>
      <p>This is a collaborative editor with AI-powered features. Try selecting some text to see the AI options. You can also use the chat on the right to interact with the AI assistant.</p>
      <p>For example, you can ask the AI to "summarize the latest news on Next.js 15" using the search tab, or ask it to "create a powerpoint on the benefits of AI in writing" using the agent tab.</p>
    `,
    editorProps: {
      attributes: {
        class: 'tiptap',
      },
    },
  });
  
  useEffect(() => {
    if (editor) {
      setEditor(editor);
    }
    return () => {
      setEditor(null);
    };
  }, [editor, setEditor]);

  if (!editor) {
    return null;
  }

  return (
    <>
      <BubbleMenu editor={editor} tippyOptions={{ duration: 100, animation: 'fade' }}
        shouldShow={({ state, from, to }) => {
          // only show if text is selected
          return from !== to;
        }}
      >
        <FloatingToolbar editor={editor} />
      </BubbleMenu>
      <EditorContent editor={editor} />
    </>
  );
};

export default TiptapEditor;
