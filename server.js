const express = require("express");
const path= require("path");
const http =require('http');
const socketio = require('socket.io');
const formatMessage= require('./utils/messages');
const joinColor = ' #5cb85c';
const {userJoin,getCurrentUser,userLeave,getRoomUsers}= require('./utils/users');

const app= express();
const server= http.createServer(app);
const io= socketio(server);

//set static folder
app.use(express.static(path.join(__dirname,'public')));

const botName = 'chatbot';

//run when client can connects
io.on('connection',(socket)=>{
    socket.on('joinRoom',({username,room})=>{      //turns on the connection in the io room 
        const user= userJoin(socket.id,username,room);
        socket.join(user.room);

    //Welcoming the user
    socket.emit('message',formatMessage(botName,'welcome to Bubbletalk'))

    //broadcast when a user connects ...notifies everyone except the user that's connecting

    socket.broadcast.to(user.room).emit('message',formatMessage(botName,`${user.username} has joined the chat`,joinColor));

      //send users and room info
      io.to(user.room).emit('roomUsers',{
        room:user.room,
        users:getRoomUsers(user.room)

      });

    //all clients in general
    // io.emit();

   

    //listen for chatMessage
    socket.on('chatMessage',(msg)=>{
        const user=getCurrentUser(socket.id);
        io.to(user.room).emit('message',formatMessage(user.username,msg));
    })

      //runs when client disconnects
      socket.on('disconnect',()=>{
        const user= userLeave(socket.id);

        if (user){
            io.to(user.room).emit('message',formatMessage(botName,
            `${user.username} has left the chat`));

            //send users and room info
      io.to(user.room).emit('roomUsers',{
        room:user.room,
        users:getRoomUsers(user.room)

      });

        }
        
    })
    //all clients in general
    // io.emit();

   
    });
    
})



const port = 3000 || process.env.port;

server.listen(port,()=>{
    console.log(`server runninng on port ${port}`)
})