const path = require('path')
const express = require('express')
const http = require('http')
const socketio = require('socket.io')
const {generateMessage, generateLocationmessage} = require('./utils/messages')
const {addUser, removeUser, getUser, getUsersInRoom} = require('./utils/users')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))


io.on('connection', (socket) => {
    console.log('new webscoket connection')
   
 
    socket.on('join', ({username, room}, callback) => {
        const{error, user} = addUser({id:socket.id, username, room})
        if(error) {
            return callback(error)
        }
      socket.join(user.room)

      socket.emit('message', generateMessage(`welcome!!${user.username}`))
      socket.broadcast.to(user.room).emit('message', generateMessage(`${user.username} has joined!`))
      callback()
    })
  
    socket.on('sendMessage', (message, callback) => {
        const user = getUser(socket.id)
        io.to(user.room).emit('message', generateMessage(user.username, message))
        callback()
    })
    socket.on('sendlocation', (coords, callback) => {
        const user = getUser(socket.id)
        io.to(user.room).emit('locationMessage', generateLocationmessage(user.username, `https://google.com/maps/?q=${coords.latitude},${coords.longitude}`) )
        callback()
    })


    socket.on('disconnect', () => {
        const user = removeUser(socket.id)

        if(user) {
            io.to(user.room).emit('message', generateMessage(`${user.username} has left!`))
        }
       
    })
})

const PORT = process.env.port || 4000
server.listen(PORT, () => console.log("server is running on port 4000"))



//client(emit) -> server(receive) --acknowledgement --> client
//server(emit) -> client(receive) --acknowledgement --> server

//whoever is emitting a event(socket.emit) sets up a callback function and 
//whoever is receiving the event(socket.io) receives a callback function that needs to call..


// socket.emit is sends an event to a specific client
// io.emit is which sends an event to every connected client
// socket.broadcast.emit is which is sends an event to every one except broadcast emitter
//io.emit.to is sending an event to everyone in a specific room
