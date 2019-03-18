import Server from './index';
import { resolve } from 'path';
import fetch from 'node-fetch';
const server = new Server(3000, resolve(__dirname, './Endpoints/'));
server.on('routesLoaded', r => console.log(`Loaded routes from ${r}`));
server.on('error', console.error);

setTimeout(() => {
  fetch('http://localhost:3000/players/@me/friends/invites/13554141541', {
        method: 'PUT',
        body:    JSON.stringify({ monkey: 'donkey' }),
        headers: { 'Content-Type': 'application/json' }
    })
    .then(res => console.log(res.status))
}, 1500)
