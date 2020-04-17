'use strict'

const http = require('http')

const app = require('./api')

const improveeServer = http.Server(app)

const io = require('socket.io')(improveeServer);

io.set('transports', ['websocket', 'polling'])
require('./api/socket')(io)
improveeServer.listen(process.env.PORT || 3000, () => {
    console.log('improvee server is running')
})