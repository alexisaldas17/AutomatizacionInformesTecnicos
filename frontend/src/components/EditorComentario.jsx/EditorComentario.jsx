import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import 'prosemirror-view/style/prosemirror.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBold, faItalic, faUnderline, faAlignJustify } from '@fortawesome/free-solid-svg-icons';
import styled from 'styled-components';

const Toolbar = styled.div`
  margin-bottom: 1rem;
  display: flex;
  gap: 0.5rem;
`;

const StyledButton = styled.button`
  background: transparent;
  border: none;
  padding: 8px;
  cursor: pointer;
  font-size: 16px;
  transition: background 0.3s, color 0.3s;
  border-radius: 4px;

  &:hover {
    background-color: #e0e0e0;
  }

  &.active {
    background-color: #007bff;
    color: white;
  }
`;

const EditorContainer = styled.div`
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 12px;
  min-height: 200px;
`;

const EditorComentario = ({ value, onChange }) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  if (!editor) return null;

  return (
    <div style={{ marginBottom: '2rem' }}>
      <Toolbar>
        <StyledButton
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          title="Negrita"
          className={editor.isActive('bold') ? 'active' : ''}
        >
          <FontAwesomeIcon icon={faBold} />
        </StyledButton>
        <StyledButton
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          title="Cursiva"
          className={editor.isActive('italic') ? 'active' : ''}
        >
          <FontAwesomeIcon icon={faItalic} />
        </StyledButton>
        <StyledButton
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          title="Subrayado"
          className={editor.isActive('underline') ? 'active' : ''}
        >
          <FontAwesomeIcon icon={faUnderline} />
        </StyledButton>
        <StyledButton
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('justify').run()}
          title="Justificar"
          className={editor.isActive({ textAlign: 'justify' }) ? 'active' : ''}
        >
          <FontAwesomeIcon icon={faAlignJustify} />
        </StyledButton>
      </Toolbar>
      <EditorContainer>
        <EditorContent editor={editor} />
      </EditorContainer>
    </div>
  );
};

export default EditorComentario;
