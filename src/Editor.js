import React, { useState, useEffect, useRef } from 'react';
import { basicSetup } from 'codemirror';
import CodeMirror from '@uiw/react-codemirror';
import { langs } from '@uiw/codemirror-extensions-langs';
import { connectRepository, getDocument } from './socket';
import { collabExtension } from './collabExtension';
import { EditorState } from '@codemirror/state';
import { EditorView } from '@codemirror/view';

const EditorWithoutConnect = (
  <div style={{
    height: '500px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#282c34',
    color: '#e06c75'
  }}>
    <h4>
      Connect to edit the document...
    </h4>
  </div>
);

const Editor = ({ repository, file }) => {
  const ref = useRef();
  const [editor, setEditor] = useState(EditorWithoutConnect);
  // const [view, setView] = useState(null);

  useEffect(() => {
    // let view = null;
    setEditor(EditorWithoutConnect)
    connectRepository(repository).then((created) => {
      getDocument(repository.id, file.id).then(({ version, doc }) => {
        console.log(version, doc)
        setEditor(
          <CodeMirror
            height='500px'
            theme='dark'
            value={doc}
            extensions={[basicSetup, langs.javascript(), collabExtension(version, repository.id, file.id)]}
          />
        );

        // const state = EditorState.create({
        //   doc,
        //   extensions: [basicSetup, langs.javascript(), collabExtension(version, repository.id, file.id)]
        // });

        // view = new EditorView({ state, parent: ref.current });

        // if (view === null) {
        //   setView(new EditorView({ state, parent: ref.current }));
        // } else {
        //   view.setState(state);
        // }
      });
    });

    // return () => {
    //   view.destroy();
    // }
  }, [repository, file]);

  // return <div ref={ref}>

  // </div>

  return editor;
};

export default Editor;