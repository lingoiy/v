const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

let users = {};

io.on('connection', (socket) => {
    console.log('Новое подключение:', socket.id);
    
    users[socket.id] = { connectedTo: null };
    
    socket.emit('yourId', socket.id);
    
    socket.on('offer', (offer, toId) => {
        console.log(`Offer от ${socket.id} к ${toId}`);
        if (users[toId]) {
            socket.to(toId).emit('offer', offer, socket.id);
        }
    });
    
    socket.on('answer', (answer, toId) => {
        console.log(`Answer от ${socket.id} к ${toId}`);
        if (users[toId]) {
            socket.to(toId).emit('answer', answer);
        }
    });
    
    socket.on('iceCandidate', (candidate, toId) => {
        console.log(`ICE Candidate от ${socket.id} к ${toId}`);
        if (users[toId]) {
            socket.to(toId).emit('iceCandidate', candidate, socket.id);
        }
    });
    
    socket.on('callEnded', (toId) => {
        console.log(`CallEnded от ${socket.id} к ${toId}`);
        if (users[toId]) {
            socket.to(toId).emit('callEnded');
        }
    });
    
    socket.on('disconnect', () => {
        console.log('Отключение:', socket.id);
        delete users[socket.id];
    });
});

server.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});
