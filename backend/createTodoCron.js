const {uuid} = require("uuidv4");
const baseUrl = "http://localhost:3001";
const http = require('http');
const { Server } = require("socket.io");
const PORT = 3002;

const server = http.createServer();
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
    },
});

io.on('connection', (socket) => {
    console.log('Client connected');

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

const createTodo = async () => {
    const newTodo = {
        text: uuid(),
        parentId:""
    };
    try {
        const res = await fetch(`${baseUrl}/tasks/`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(newTodo),
        });
        if (!res.ok) {
            throw new Error('Failed to add todo');
        }
        const createdTodo = await res.json();
        io.emit('newTodo', createdTodo);
        console.log('Todo created:', createdTodo);
    } catch (error) {
        console.error(error);
    }
};

setInterval(createTodo, 10000);

console.log('Cron job started. A new todo will be created every 10 seconds.');
server.listen(PORT, () => console.log(`Listening on port ${PORT}`));