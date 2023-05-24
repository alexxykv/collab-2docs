const PORT = 3001;

const express = require('express');
const http = require('http');
const app = express();
const server = http.createServer(app);

const { Server } = require('socket.io');
const io = new Server(server, {
  cors: { origin: '*' },
});

const { ChangeSet, Text } = require('@codemirror/state');

// const UPDATES = [];
// const PENDING = [];
// let DOC = Text.of(['Hello, world!']);

const REPOSITORIES = {
  
}

io.on('connection', (socket) => {
  socket.on('pullUpdates', (version, repositoryId, fileId) => {
    console.log('----------------------')
    console.log('PULL UPDATES')
    console.log('Version: ', version)
    console.log('Updates: ', REPOSITORIES[repositoryId][fileId].updates.length)
    console.log('Pending: ', REPOSITORIES[repositoryId][fileId].pending.length)
    console.log('fileId: ', fileId)
    console.log('----------------------')
    let UPDATES = REPOSITORIES[repositoryId][fileId].updates;
    let PENDING = REPOSITORIES[repositoryId][fileId].pending;

    if (version < UPDATES.length) {
      socket.emit('pullUpdates', UPDATES.slice(version));
    } else {
      PENDING.push(socket);
    }
  });

  socket.on('pushUpdates', (version, updates, repositoryId, fileId) => {
    console.log('----------------------')
    console.log('PUSH UPDATES')
    console.log('Version: ', version)
    console.log('Updates: ', REPOSITORIES[repositoryId][fileId].updates.length)
    console.log('Pending: ', REPOSITORIES[repositoryId][fileId].pending.length)
    console.log('fileId: ', fileId)
    console.log('----------------------')
    let UPDATES = REPOSITORIES[repositoryId][fileId].updates;
    let PENDING = REPOSITORIES[repositoryId][fileId].pending;

    if (version !== UPDATES.length) {
      socket.emit('pushUpdates', false);
    } else {
      for (const update of updates) {
        const changes = ChangeSet.fromJSON(update.changes);
        UPDATES.push({
          changes,
          clientID: update.clientID
        });
        REPOSITORIES[repositoryId][fileId].doc = changes.apply(REPOSITORIES[repositoryId][fileId].doc);
      }
      socket.emit('pushUpdates', true);

      while (PENDING.length) {
        PENDING.pop().emit('pullUpdates', updates)
      }
    }
  });

  socket.on('getDocument', (repositoryId, fileId) => {
    console.log('----------------------')
    console.log('GET DOCUMENT')
    console.log('Updates: ', REPOSITORIES[repositoryId][fileId].updates.length)
    console.log('Pending: ', REPOSITORIES[repositoryId][fileId].pending.length)
    console.log('fileId: ', fileId)
    console.log('----------------------')
    let UPDATES = REPOSITORIES[repositoryId][fileId].updates;
    let DOC = REPOSITORIES[repositoryId][fileId].doc;

    socket.emit('getDocument', {
      version: UPDATES.length,
      doc: DOC.toString()
    });
  });

  socket.on('connectRepository', repository => {
    if (REPOSITORIES[repository.id]) {
      Object.keys(REPOSITORIES[repository.id]).forEach(fileId => {
        REPOSITORIES[repository.id][fileId].pending = REPOSITORIES[repository.id][fileId].pending.filter(sock => sock.id !== socket.id);
      });
      socket.emit('connectRepository', false);
      return;
    }
    REPOSITORIES[repository.id] = {};
    const files = dfs(repository.rootFolder);
    for (const file of files) {
      REPOSITORIES[repository.id][file.id] = {
        updates: [],
        pending: [],
        doc: Text.of([file.text])
      }
    }
    socket.emit('connectRepository', true);
  })
});

function dfs(folder) {
  const files = [];
  for (const f of folder.folders) {
    files.concat(dfs(f));
  }
  for (const f of folder.files) {
    files.push(f);
  }
  return files;
}

app.get('/', (_, res) => {
  res.send('No content.');
});

server.listen(PORT, () => {
  console.log(`Listening on http://localhost:${PORT}`);
});