const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const PORT = 3001;

mongoose.connect('mongodb://localhost/todo-db')
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch((error) => {
        console.error('Error connecting to MongoDB:', error);
    });

// Define Todo schema
const todoSchema = new mongoose.Schema({
    id: String,
    text: String,
    parentId: String
}, {collection:"todo"});

// Create Todo model
const Todo = mongoose.model('todo', todoSchema);

app.use(bodyParser.json());
app.use(cors());

// Get all todos
app.get('/tasks', async (req, res) => {
    try {
        const todos = await Todo.find();
        res.json(todos);
    } catch (err) {
        console.error('Error fetching todos:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get a single todo by ID
app.get('/tasks/:id', async (req, res) => {
    try {
        const todo = await Todo.findById(req.params.id);
        if (!todo) {
            return res.status(404).json({ error: 'Todo not found' });
        }
        res.json(todo);
    } catch (err) {
        console.error('Error fetching todo:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Add a new todo
app.post('/tasks', async (req, res) => {
    try {
        const newTodo = await Todo.create(req.body);
        res.status(201).json(newTodo);
    } catch (err) {
        console.error('Error creating todo:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update a todo
app.put('/tasks/edit', async (req, res) => {
    try {
        console.log("req.body",req.body)
        const updatedTodo = await Todo.findByIdAndUpdate(req.body._id, req.body,{new:true});
        if (!updatedTodo) {
            return res.status(404).json({ error: 'Todo not found' });
        }
        console.log("UPPPPP", updatedTodo)
        res.json(updatedTodo);
    } catch (err) {
        console.error('Error updating todo:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete a todo
app.delete('/tasks/:id', async (req, res) => {
    try {
        const id = req.params.id;

        await Todo.deleteMany({ parentId: id });
        await Todo.findByIdAndDelete(id);

        res.sendStatus(204);
    } catch (err) {
        console.error('Error deleting todo:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

module.exports = app;

