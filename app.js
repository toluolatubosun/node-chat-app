const express = require('express');
const uuid = require('uuid');
const port = process.env.PORT || 3000;

// server set up
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);

// middleware
app.use(express.static('public'));
app.set('view engine', 'ejs');

server.listen(port, () => {
    console.log(`App listening on port ${port}`);
});

// routes
app.get('/', (req, res) => {
    res.redirect(`/public`);
});

app.get('/private', (req, res) => {
    res.redirect(`/${uuid.v4()}`);
});

app.get('/public', (req, res) => {
    id = uuid.v1();
    id = id.substring(0,4);
    res.render('chat', { chatId: "123456789", userId: id, public: true });
});

app.get('/:chatId', (req, res) => {
    if( uuid.validate(req.params.chatId) ){
        id = uuid.v1();
        id = id.substring(0,4);
        res.render('chat', { chatId: req.params.chatId, userId: id, public: false });
    }else{
        res.render('404');
    }
});

io.on('connection', socket => {
    console.log('a user just connected', socket.id);

    // chat
    socket.on('join-chat', (data) => {
        // join a private or public chat room
        socket.join(data.chatId);

        var room = io.sockets.adapter.rooms[data.chatId];

         // send number of active users ( only fires when user joins )
        if( room ){
            io.to(socket.id).emit('count', room.length);
        }else{
            io.to(socket.id).emit('count', 1);
        }
        
        // send message when new user connects
        if( room ){
            socket.to(data.chatId).broadcast.emit('new-user', { userID: data.userId, number: room.length } );
        }else{
            socket.to(data.chatId).broadcast.emit('new-user', { userID: data.userId, number: 1 } );
        }
       

        // send message to others in the chat room
        socket.on('send-message', (msg_data) => {
            socket.to(data.chatId).broadcast.emit('recieve-message', msg_data);
        });
    
        // send message when user is typing
        socket.on('typing', (typing_data) => {
            socket.to(data.chatId).broadcast.emit('typing', typing_data);
        });

        // send message when a user disconnects
        socket.on('disconnect', () => {
            var room = io.sockets.adapter.rooms[data.chatId];
            if( room ){
                socket.to(data.chatId).broadcast.emit('user-disconnected', { userID: data.userId, number: room.length } );
            }else{
                socket.to(data.chatId).broadcast.emit('user-disconnected', { userID: data.userId, number: 1 } );
            }
           
        });
    });
});

app.use((req, res) => {
    res.render('404');
})

