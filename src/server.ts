import express from 'express';
import http from 'http';
import cors from 'cors';
import expressJwt from 'express-jwt';
import WebSocket from 'ws';

const PORT = 4000;

const {JWT_SECRET = 'secret'} = process.env;

const app = express();

app.use(cors());
// comment out this line if you want to bypass JWT check during development
// app.use(expressJwt({secret: JWT_SECRET}).unless({path: '/'}));

app.get('/', (req, res) => {
    res.send('Hi there!');
});

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws: WebSocket) => {

    //connection is up, let's add a simple simple event
    ws.on('message', (message: string) => {

        //log the received message and send it back to the client
        console.log('received: %s', message);
        ws.send(`Hello, you sent -> ${message}`);
    });

    //send immediatly a feedback to the incoming connection    
    ws.send('Hi there, I am a WebSocket server');
});

server.listen(PORT, () => console.log(`Server is up at ${PORT}`));