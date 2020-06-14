import express from 'express';

import { config } from './config/config';
import { verifyToken } from './middlewares/jwt';

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

  io.on('connection', (socket: any) => {
    console.log(socket.user.email)
  })

  // Start the Server
  http.listen( port, () => {
      console.log( `server running ` + config.url );
      console.log( `press CTRL+C to stop server` );
  } );
})();