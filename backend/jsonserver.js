const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 3001;

const secretKey = process.env.AUTH_SECRET;

mongoose.connect('mongodb://localhost/todo-db')
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch((error) => {
        console.error('Error connecting to MongoDB:', error);
    });


// Define Todo schema
const userSchema = new mongoose.Schema({
    id: String,
    email: String,
    password: String,
}, {collection:"user"});

// Create Todo model
const User = mongoose.model('user', userSchema);


// Define Todo schema
const todoSchema = new mongoose.Schema({
    id: String,
    text: String,
    parentId: String,
    createdAt: { type: Date, default: Date.now }
}, {collection:"todo"});

// Create Todo model
const Todo = mongoose.model('todo', todoSchema);

app.use(bodyParser.json());
app.use(cors());

const rateLimit = require('express-rate-limit');
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes max: 100, // Limit each IP to 100 requests
})
app.use('/api/', apiLimiter);


// Registration endpoint
app.post('/register', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }

        // Create new user
        const newUser = new User({ email, password });
        await newUser.save();

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Authentication endpoint
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        console.log(email,password)
        // Find user by email
        const user = await User.findOne({ email });
        console.log(user)
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }


        // Verify password
        const passwordMatch = password=== user.password;
        console.log(passwordMatch)
        console.log(password,user.password)
        if (!passwordMatch) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // const secretKey = crypto.randomBytes(32).toString('hex');
        const token = jwt.sign({ userId: user._id }, secretKey, { expiresIn: '1h' });

        res.json({ token });
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Protected route example
app.get('/protected', verifyToken, (req, res) => {
    res.json({ message: 'Protected route accessed successfully' });
});

function verifyToken(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1];
    console.log("??",token)
    if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    jwt.verify(token, secretKey, (err, decoded) => {
        if (err) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        console.log(decoded.userId)
        req.userId = decoded.userId;
        next();
    });
}





// Get all todos
app.get('/tasks', verifyToken, async (req, res) => {
    try {
        console.log("ADSADSADAS")
        const { page = 1, limit = 20, time } = req.query;
        const skipIndex = (page - 1) * limit;
        let todos;

        if (time && time.toUpperCase() === 'DESC') {
            todos = await Todo.find().sort({ createdAt: -1 }).limit(limit).skip(skipIndex);
        } else {
            todos = await Todo.find().sort({ createdAt: 1 }).limit(limit).skip(skipIndex);
        }

        res.json(todos);
    } catch (err) {
        console.error('Error fetching todos:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});


// Get a single todo by ID
app.get('/tasks/:id', verifyToken, async (req, res) => {
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
app.post('/tasks', verifyToken, async (req, res) => {
    try {
        req.body.createdAt = new Date();
        console.log("AA",req.body)
        const newTodo = await Todo.create(req.body);
        res.status(201).json(newTodo);
    } catch (err) {
        console.error('Error creating todo:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});


// Update a todo
app.put('/tasks/edit', verifyToken, async (req, res) => {
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
app.delete('/tasks/:id', verifyToken, async (req, res) => {
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

