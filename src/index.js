const express = require('express');
const path = require('path');
const http =  require('http');
const scoketio = require('socket.io');
const badWordsFilter = require('bad-words');
const { getMessageDate, getUrlDate } = require('./util/timestamps');
const { users, addUser, removeUser, getUerFromRoom, getUser } = require('./util/users');

const app = express();
const PORT = process.env.PORT || 3000;

//Socket expects pure http server object
const server = http.createServer(app);
const io = scoketio(server);

app.use(express.static(path.resolve(__dirname,'../public')));

io.on('connection', (socket) => {
    //Join
    socket.on('join', ({ username, roomname }, callback)=>{
        //checking user already exist.
        const index = users.findIndex((user) => {
            return user.username===username
        });

        //calling callback function with error.
        if(index!=-1){
            return callback({
                "error":"User already exist."
            })
        }

        addUser({
            id:socket.id,
            username,
            roomname
        })

        socket.join(roomname);
        socket.emit('message',getMessageDate("welcome", 'Admin'));
        socket.broadcast.to(roomname).emit('message',getMessageDate(`${username} has joined`, 'Admin'));
        io.to(roomname).emit("renderUserList", {"roomname":roomname,"users":getUerFromRoom(roomname)});
        callback()
    })

    socket.on('sendMessage', (message, acknowledgementCallback) => {
        const user = getUser(socket.id);
        const filter = new badWordsFilter();
        if(filter.isProfane(message)){
            return acknowledgementCallback(new Error('content profane!'));
        }
        io.to(user.roomname).emit('message',getMessageDate(message, user.username));
        acknowledgementCallback();
    });

    socket.on('disconnect', () => {
        const user = removeUser(socket.id);
        if(user){
            //broadcast will send message to all connected sockets except current one.
            io.to(user.roomname).emit('message', getMessageDate(`${user.username} left!`, 'Admin'));
            io.to(user.roomname).emit("renderUserList",{"roomname":user.roomname,"users":getUerFromRoom(user.roomname)});
        }
    });

    socket.on('sendLocation', (location, callback)=>{
        const user = getUser(socket.id);
        io.to(user.roomname).emit('locationShared',getUrlDate(`https://www.google.com/maps?q=${location.latitude},${location.longitude}`,user.username));
        callback('location shared!');
    });
});

server.listen(PORT, () => {
    console.log(`server running on ${PORT}`);
});