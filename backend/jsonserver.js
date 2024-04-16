const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors'); // Import cors middleware
const fs = require('fs').promises;

const app = express();
const PORT = 3001;
const todosFilePath = 'data/todos.json';

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Enable CORS for all routes
app.use(cors());

// Middleware to load todos from file
app.use(async (req, res, next) => {
    try {
        const todosData = await fs.readFile(todosFilePath, 'utf8');
        req.todos = JSON.parse(todosData).tasks; // Assuming tasks is the array of todos
        next();
    } catch (err) {
        console.error('Error reading todos file:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Middleware to save todos to file
app.use(async (req, res, next) => {
    try {
        await fs.writeFile(todosFilePath, JSON.stringify({ tasks: req.todos }, null, 2)); // Assuming tasks is the array of todos
        next();
    } catch (err) {
        console.error('Error writing todos file:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get all todos
app.get('/tasks', (req, res) => {
    res.json(req.todos);
});

// Get a single todo by ID
app.get('/tasks/:id', (req, res) => {
    const todoId = req.params.id;
    const todo = req.todos.find(todo => todo.id === todoId);
    if (!todo) {
        return res.status(404).json({ error: 'Todo not found' });
    }
    res.json(todo);
});

// Add a new todo
app.post('/tasks', (req, res) => {
    const newTodo = req.body;
    req.todos.push(newTodo);
    res.status(201).json(newTodo);
});

// Update a todo
app.put('/tasks/:id', (req, res) => {
    const todoId = req.params.id;
    const updatedTodo = req.body;
    let index = req.todos.findIndex(todo => todo.id === todoId);
    if (index === -1) {
        return res.status(404).json({ error: 'Todo not found' });
    }
    req.todos[index] = updatedTodo;
    res.json(updatedTodo);
});

// Delete a todo
app.delete('/tasks/:id', (req, res) => {
    const todoId = req.params.id;
    let index = req.todos.findIndex(todo => todo.id === todoId);
    if (index === -1) {
        return res.status(404).json({ error: 'Todo not found' });
    }
    req.todos.splice(index, 1);
    res.sendStatus(204);
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
