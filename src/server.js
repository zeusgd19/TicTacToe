const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, '../public')));

let rooms = [];
io.on('connection', (socket) => {
    console.log('New client connected');

    socket.on('createRoom', (roomId) => {
        if (!rooms[roomId]) {
            rooms[roomId] = {
                players: [socket.id],
                board: Array(9).fill(''),
                currentTurn: 0,
                gameOver: false
            };
            socket.emit('givePlayer','X')
            socket.join(roomId);
            socket.emit('roomCreated', roomId);
        } else {
            socket.emit('error', 'Room already exists');
        }
    });

    socket.on('joinRoom', (roomId) => {
        if (rooms[roomId] && rooms[roomId].players.length < 2) {
            rooms[roomId].players.push(socket.id);
            socket.emit('givePlayer','O');
            socket.join(roomId);
            socket.emit('roomJoined', roomId);
            io.to(roomId).emit('startGame');
        } else {
            socket.emit('error', 'Room is full or does not exist');
        }
    });

    socket.on('makeMove', (roomId, index) => {
        const room = rooms[roomId];
        if (room && !room.gameOver && room.board[index] === '') {
            room.board[index] = room.currentTurn === 0 ? 'X' : 'O';
            if(room.currentTurn === 0){
                room.currentTurn = 1
            } else {
                room.currentTurn = 0
            }
            io.to(roomId).emit('moveMade', room.board, room.currentTurn);
            const winner = checkWinner(room.board);

            if (winner) {
                room.gameOver = true;
                io.to(roomId).emit('gameOver', winner);
                rooms.splice(rooms.indexOf(roomId),1)
            } else if (room.board.every(cell => cell !== '')) {
                room.gameOver = true;
                io.to(roomId).emit('gameOver', 'Draw');
                rooms.splice(rooms.indexOf(roomId),1)
            }
        }
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
        // Handle cleanup if necessary
    });
});

function checkWinner(board) {
    const winningCombos = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ];

    for (let combo of winningCombos) {
        const [a, b, c] = combo;
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return board[a];
        }
    }

    return null;
}

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
