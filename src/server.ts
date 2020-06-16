import express from 'express';

import { config } from './config/config';
import { verifyToken } from './middlewares/jwt';
import { IncomingMessage, OutgoingMessage } from './models'

(async () => {

  const app = express();
  const http = require('http').createServer(app);
  const io = require('socket.io')(http, {
    handlePreflightRequest: (req: any, res:any) => {
        const headers = {
            "Access-Control-Allow-Headers": "Content-Type, authorization",
            "Access-Control-Allow-Origin": req.headers.origin,
            "Access-Control-Allow-Credentials": true
        };
        res.writeHead(200, headers);
        res.end();
    }
});
  const port = process.env.PORT || 8080; // default port to listen
  
  io.use(verifyToken)

  const activeSockets: any = {};

  io.on('connection', (socket: any) => {
    const email: string = socket.user.email;
    activeSockets[email] = socket;
    socket.on('message', (incomingMessage: IncomingMessage) => {
      const { to, text, attachmentUrl } = incomingMessage;
      const outgoingMessage: OutgoingMessage = {from: socket.user.email, text, attachmentUrl};
      const receiverSocket = activeSockets[to];
      if (receiverSocket) {
        receiverSocket.emit('message', outgoingMessage)
      }
    });
  })

  // Start the Server
  http.listen( port, () => {
      console.log( `server running ` + config.url );
      console.log( `press CTRL+C to stop server` );
  } );
})();