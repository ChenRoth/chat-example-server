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

function sendJSON(ws: WebSocket, msg: any) {
    ws.send(JSON.stringify(msg));
}

wss.on('connection', (ws: WebSocket) => {    
    const sender = {
        name: null,
    };

    ws.on('message', (message: string) => {
        const action = JSON.parse(message);
        switch (action.type) {
            case 'SIGN_IN': {
                const {name} = action.payload;
                console.log('sender\'s name is', name);
                sender.name = name;
                sendJSON(ws, {type: 'SIGNED_IN', payload: {}});
                break;
            }
            case 'SEND_MSG': {
                const {text} = action.payload;
                console.log('sender sent the following text', text);
                wss.clients.forEach((client) => {
                    sendJSON(client, {type: 'RECEIVE_MSG', payload: {
                        timestamp: Date.now(),
                        text,
                        sender: sender.name,
                    }});
                }); 
                break;               
            }
            case 'START_TYPING': {
                wss.clients.forEach((client) => {
                    if (client === ws) {
                        return;
                    }
                    sendJSON(client, {type: 'SOMEONE_IS_TYPING', payload: {
                        name: sender.name,
                    }});
                });            
                break;    
            }
            case 'STOP_TYPING': {
                wss.clients.forEach((client) => {
                    if (client === ws) {
                        return;
                    }
                    sendJSON(client, {type: 'SOMEONE_STOPPED_TYPING', payload: {
                        name: sender.name,
                    }});
                });   
                break;             
            }
        }
    });

});

server.listen(PORT, () => console.log(`Server is up at ${PORT}`));