import React from 'react';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

interface TextEditorProps {
  initialData?: string;
  onChange: (data: string) => void;
  height?: string;
}

const TextEditor: React.FC<TextEditorProps> = ({ initialData = '', onChange, height = '200px' }) => {
  return (
    <div className="text-editor-container" style={{ minHeight: height }}>
      <CKEditor
        editor={ClassicEditor as any}
        data={initialData}
        config={{
          toolbar: [
            'heading',
            '|',
            'bold',
            'italic',
            'link',
            'bulletedList',
            'numberedList',
            '|',
            'outdent',
            'indent',
            '|',
            'blockQuote',
            'insertTable',
            'undo',
            'redo'
          ]
        }}
        onChange={(_event, editor) => {
          const data = editor.getData();
          onChange(data);
        }}
      />
    </div>
  );
};

export default TextEditor; 