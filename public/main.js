const socket = io();
let turno = 0;
let player = "X"
document.getElementById('createRoomButton').addEventListener('click', () => {
    const roomId = document.getElementById('roomIdInput').value.trim();
    if (roomId) {
        socket.emit('createRoom', roomId);
    }
});

document.getElementById('joinRoomButton').addEventListener('click', () => {
    const roomId = document.getElementById('roomIdInput').value.trim();
    if (roomId) {
        socket.emit('joinRoom', roomId);
    }
});

socket.on('roomCreated', (roomId) => {
    alert(`Room ${roomId} created!`);
    document.getElementById('menu').style.display = 'none';
    document.getElementById('game').style.display = 'block';
});

socket.on('roomJoined', (roomId) => {
    alert(`Joined room ${roomId}!`);
    document.getElementById('menu').style.display = 'none';
    document.getElementById('game').style.display = 'block';
});

socket.on('givePlayer',(player) =>{
    document.getElementById("player").textContent = player;
})

socket.on('startGame', () => {
    alert('Game started!');
});

socket.on('moveMade', (board,turn) => {
    updateBoard(board);
    updateTurn(turn);
});

socket.on('gameOver', (result) => {
    alert(result === 'Draw' ? 'It\'s a draw!' : `${result} wins!`);
});

socket.on('error', (message) => {
    alert(message);
});

document.querySelectorAll('.cell').forEach(cell => {
    cell.addEventListener('click', () => {
        const index = cell.getAttribute('data-index');
        const roomId = document.getElementById('roomIdInput').value.trim();
        if(document.getElementById("player").textContent == player){
        socket.emit('makeMove', roomId, index);
        }
    });
});

function updateBoard(board) {
    document.querySelectorAll('.cell').forEach((cell, index) => {
        cell.textContent = board[index];
    });
}

function updateTurn(turn){
    turno = turn
    console.log(turn)
    player = turno === 0 ? "X":"O"
    console.log(player)
}
