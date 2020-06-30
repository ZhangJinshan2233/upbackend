'use strict'

const http = require('http')

const app = require('./api')

const improveeServer = http.Server(app)

const io = require('socket.io')(improveeServer);
// let PORT=3000+parseInt(process.env.NODE_APP_INSTANCE)
// if(parseInt(process.env.NODE_APP_INSTANCE)===0){
//     require('./api/shedule')()
// }
io.set('transports', ['websocket', 'polling'])
require('./api/socket')(io)
improveeServer.listen(process.env.PORT || 3000, () => {
    console.log('improvee server is running')
})