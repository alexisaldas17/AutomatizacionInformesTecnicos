// TiptapEditor.jsx
import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

export default function TiptapEditor({ value, onChange }) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value,
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  return (
    <div>
      <div style={{ marginBottom: '8px' }}>
        <button onClick={() => editor.chain().focus().toggleBold().run()}><b>B</b></button>
        <button onClick={() => editor.chain().focus().toggleItalic().run()}><i>I</i></button>
        <button onClick={() => editor.chain().focus().toggleBulletList().run()}>• Lista</button>
        <button onClick={() => editor.chain().focus().setParagraph().run()}>Párrafo</button>
        <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>H2</button>
        <button onClick={() => editor.chain().focus().undo().run()}>↺</button>
        <button onClick={() => editor.chain().focus().redo().run()}>↻</button>
      </div>

      <EditorContent
        editor={editor}
        style={{
          border: '1px solid #ccc',
          borderRadius: '8px',
          padding: '12px',
          minHeight: '150px',
          fontFamily: 'Arial, sans-serif',
          fontSize: '14px',
          backgroundColor: 'white',
        }}
      />
    </div>
  );
}
