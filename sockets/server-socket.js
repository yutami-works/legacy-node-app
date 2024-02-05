const { Server } = require('socket.io');

// ハンドラー
const inputHandler = require('./input-handler');
const uploadHandler = require('./upload-handler');

/* メインソケット */
const serverSocket = (server, session) => {
  const io = new Server(server);
  // express-session for Socket.IO
  io.use((socket, next) => {
    session(socket.request, socket.request.res. next);
  });

  /* handshake */
  io.on('connection', (socket) => {
    const sessionUser = socket.request.session.user;
    const accessToken = socket.request.session.token;

    // session expired => login
    if (typeof sessionUser === 'undefined') {
      socket.emit('reload');
    } else {
      console.log(`${sessionUser} connected`);

      /* input from client */
      socket.on('input', (file, fileName) => {
        inputHandler(io, socket, sessionUser, file, fileName);
      });

      /* upload from client */
      socket,on('upload', (file, fileName) => {
        uploadHandler(io, socket, sessionUser, file, fileName, accessToken);
      });

      /* client disconnect */
      socket.on('disconnect', () => {
        console.log(`Client disconnected with ID ${socket.id}`);
        console.log(`${sessionUser} disconnected`);
      });
    }
  });
}

module.exports = serverSocket;
