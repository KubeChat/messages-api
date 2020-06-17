import express from 'express';

import { config } from './config/config';
import { verifyToken } from './middlewares/jwt';
import { Message } from './models/Message'

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
    socket.on('message', (message: Message) => {
      const receiverSocket = activeSockets[message.to];
      if (receiverSocket) {
        receiverSocket.emit('message', message);
      } else {
        pub.publish('message', JSON.stringify(message));
      }
    });
  })

  const Redis = require('ioredis')
  const sub = new Redis(config.redisPort, config.redisEndpoint);
  const pub = new Redis(config.redisPort, config.redisEndpoint);

  sub.subscribe('message');
  sub.on('message', (channel: any, messageString: string) => {
    const message: Message = JSON.parse(messageString);
    const receiverSocket = activeSockets[message.to];
    receiverSocket.emit('message', message);
  })

  // Start the Server
  http.listen( port, () => {
      console.log( `server running ` + config.url );
      console.log( `press CTRL+C to stop server` );
  } );
})();