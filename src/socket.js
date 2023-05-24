import { io } from 'socket.io-client';
import { ChangeSet } from '@codemirror/state';

export const URL = 'ws://localhost:3001';

export const socket = io(URL, {
  autoConnect: false,
  extraHeaders: {
    'ngrok-skip-browser-warning': true
  },
  transports: ['websocket'],
});

export const getDocument = (repositoryId, fileId) => {
  socket.emit('getDocument', repositoryId, fileId);

  return new Promise((resolve, _) => {
    socket.once('getDocument', document => {
      resolve(document);
    });
  });
}

export const pullUpdates = (version, repositoryId, fileId) => {
  socket.emit('pullUpdates', version, repositoryId, fileId);

  return new Promise((resolve, _) => {
    socket.once('pullUpdates', updates => {
      resolve(updates.map(u => {
        return {
          changes: ChangeSet.fromJSON(u.changes),
          clientID: u.clientID
        }
      }));
    });
  });
}

export const pushUpdates = (version, fullUpdates, repositoryId, fileId) => {
  const updates = fullUpdates.map(u => ({
    clientID: u.clientID,
    changes: u.changes.toJSON()
  }));

  socket.emit('pushUpdates', version, updates, repositoryId, fileId);

  return new Promise((resolve, _) => {
    socket.once('pushUpdates', success => {
      resolve(success);
    });
  });
}

export const connectRepository = (repository) => {
  socket.emit('connectRepository', repository);
  
  return new Promise((resolve, _) => {
    socket.once('connectRepository', success => {
      resolve(success);
    });
  });
}