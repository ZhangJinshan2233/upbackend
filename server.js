'use strict'

const http = require('http')

const app = require('./api')

const improveeServer = http.Server(app)

const io=require('socket.io')(improveeServer);

io.set('transports',['websocket','polling'])
require('./api/socket')(io)
// io.on('connection', (socket) => {
 
//     socket.on('disconnect', function(){
//       io.emit('users-changed', {user: socket.username, event: 'left'});   
//     });
   
//     socket.on('set-name', (name) => {
//       socket.username = name;
//       io.emit('users-changed', {user: name, event: 'joined'});    
//     });
    
//     socket.on('send-message', (message) => {
//       io.emit('message', {msg: message.text, user: socket.username, createdAt: new Date()});    
//     });
//   });
   
improveeServer.listen(process.env.PORT ||3000,()=>{
    console.log('improvee server is running')
})