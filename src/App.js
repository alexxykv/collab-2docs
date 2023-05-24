import React, { useEffect, useState } from 'react';
import Editor from './Editor';
import { socket } from './socket';

const App = () => {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [repository, setRepository] = useState({
    id: 'repository',
    rootFolder: {
      id: 1,
      files: [
        {
          id: 1,
          text: ''
        },
        {
          id: 2,
          text: ''
        }
      ],
      folders: [

      ]
    }
  });
  const [selectedFile, setSelectedFile] = useState(repository.rootFolder.files[0]);

  //#region Connect & Disconnect
  useEffect(() => {
    function onConnect() {
      setIsConnected(true);
    }

    function onDisconnect() {
      setIsConnected(false);
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
    };
  }, []);
  //#endregion

  return (
    <div>
      <Editor repository={repository} file={selectedFile} />
      <div style={{ padding: '0.5rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', padding: '0.5rem' }}>
          {
            repository.rootFolder.files.map(file => {
              return (
                <button key={file.id} onClick={() => setSelectedFile(file)}>
                  {'fileId: ' + file.id}
                </button>
              );
            })
          }
        </div>
        <div style={{ padding: '0.5rem', paddingTop: 0 }}>
          {
            `selectedFile: ${selectedFile?.id}`
          }
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', padding: '0.5rem' }}>
          <button onClick={() => socket.connect()}>Connect</button>
          <button onClick={() => socket.disconnect()}>Disconnect</button>
        </div>
        <div style={{ padding: '0.5rem', paddingTop: 0 }}>
          {
            isConnected ? 'Connected' : 'Disconnected'
          }
        </div>
      </div>
    </div>
  );
}

export default App;