const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const https = require('https');

const app = express();
const PORT = 3001;

const secretKey = '25dfc5508b6ebbda0a36a6063ff6bf88d26545c43a4ee5be9a4d8ce81f5821f9';

// Read SSL certificate and key
const sslOptions = {
    key: fs.readFileSync('server.key'),
    cert: fs.readFileSync('server.cert')
};

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
    role: String,
}, {collection: "user"});

// Create Todo model
const User = mongoose.model('user', userSchema);


// Define Todo schema
const todoSchema = new mongoose.Schema({
    id: String,
    text: String,
    parentId: String,
    createdAt: {type: Date, default: Date.now},
    idUser: {type: mongoose.Schema.Types.ObjectId, ref: 'User'} // Reference to User model
}, {collection: "todo"});


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
        const {email, password, role = 'user'} = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({email});
        if (existingUser) {
            return res.status(400).json({error: 'User already exists'});
        }

        // Create new user
        const newUser = new User({email, password, role});
        await newUser.save();

        res.status(201).json({message: 'User registered successfully'});
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({error: 'Internal server error'});
    }
});

// Authentication endpoint
app.post('/login', async (req, res) => {
    try {
        const {email, password} = req.body;

        console.log(email, password)
        // Find user by email
        const user = await User.findOne({email});
        console.log(user)
        if (!user) {
            return res.status(401).json({error: 'Invalid email or password'});
        }


        // Verify password
        const passwordMatch = password === user.password;
        console.log(passwordMatch)
        console.log(password, user.password)
        if (!passwordMatch) {
            return res.status(401).json({error: 'Invalid email or password'});
        }

        // const secretKey = crypto.randomBytes(32).toString('hex');
        const token = jwt.sign({userId: user._id}, secretKey, {expiresIn: '1h'});

        res.json({token});
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({error: 'Internal server error'});
    }
});

// Protected route example
app.get('/protected', verifyToken, (req, res) => {
    res.json({message: 'Protected route accessed successfully'});
});

function verifyToken(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({error: 'Unauthorized'});
    }

    jwt.verify(token, secretKey, (err, decoded) => {
        if (err) {
            return res.status(401).json({error: 'Unauthorized'});
        }
        req.userId = decoded.userId; // Extracted userId from the decoded JWT
        console.log("USER ID IS", decoded.userId)
        next();
    });
}

async function checkAdminOrManagerRole(req, res, next) {
    try {
        const user = await User.findById(req.userId);
        if (!user || (user.role !== 'admin' && user.role !== 'manager')) {
            return res.status(401).json({error: 'Permission denied'});
        }
        next();
    } catch (err) {
        return res.status(500).json({error: 'Internal server error'});
    }
}

async function checkAdminRole(req, res, next) {
    try {
        const user = await User.findById(req.userId);
        if (!user || user.role !== 'admin') {
            return res.status(401).json({error: 'Permission denied'});
        }
        next();
    } catch (err) {
        return res.status(500).json({error: 'Internal server error'});
    }
}

app.get('/user/role', verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({error: 'User not found'});
        }
        res.json({role: user.role});
    } catch (err) {
        console.error('Error fetching user role:', err);
        res.status(500).json({error: 'Internal server error'});
    }
});


// Get all todos
app.get('/tasks', verifyToken, async (req, res) => {
    try {
        const {page = 1, limit = 20, time} = req.query;
        const skipIndex = (page - 1) * limit;

        let todos;

        if (time && time.toUpperCase() === 'DESC') {
            todos = await Todo.find().sort({createdAt: -1}).limit(limit).skip(skipIndex);
        } else {
            todos = await Todo.find().sort({createdAt: 1}).limit(limit).skip(skipIndex);
        }

        res.json(todos);
    } catch (err) {
        console.error('Error fetching todos:', err);
        res.status(500).json({error: 'Internal server error'});
    }
});


// Get a single todo by ID
app.get('/tasks/:id', verifyToken, async (req, res) => {
    try {
        const todo = await Todo.findById(req.params.id);
        if (!todo) {
            return res.status(404).json({error: 'Todo not found'});
        }
        res.json(todo);
    } catch (err) {
        console.error('Error fetching todo:', err);
        res.status(500).json({error: 'Internal server error'});
    }
});


// Add a new todo
app.post('/tasks', verifyToken, checkAdminOrManagerRole, async (req, res) => {
    try {
        req.body.createdAt = new Date();
        req.body.idUser = req.userId;
        const newTodo = await Todo.create(req.body);
        res.status(201).json(newTodo);
    } catch (err) {
        console.error('Error creating todo:', err);
        res.status(500).json({error: 'Internal server error'});
    }
});


// Update a todo
app.put('/tasks/edit', verifyToken, checkAdminOrManagerRole, async (req, res) => {
    try {
        console.log("req.body", req.body)
        const updatedTodo = await Todo.findByIdAndUpdate(req.body._id, req.body, {new: true});
        if (!updatedTodo) {
            return res.status(404).json({error: 'Todo not found'});
        }
        console.log("UPPPPP", updatedTodo)
        res.json(updatedTodo);
    } catch (err) {
        console.error('Error updating todo:', err);
        res.status(500).json({error: 'Internal server error'});
    }
});


// Delete a todo
app.delete('/tasks/:id', verifyToken, checkAdminOrManagerRole, async (req, res) => {
    try {
        const id = req.params.id;

        await Todo.deleteMany({parentId: id});
        await Todo.findByIdAndDelete(id);

        res.sendStatus(204);
    } catch (err) {
        console.error('Error deleting todo:', err);
        res.status(500).json({error: 'Internal server error'});
    }
});

// Get all users
app.get('/users', verifyToken, checkAdminRole, async (req, res) => {
    try {
        let users;

        users = await User.find();

        res.json(users);
    } catch (err) {
        console.error('Error fetching users:', err);
        res.status(500).json({error: 'Internal server error'});
    }
});

// Get a single user by ID
app.get('/user', verifyToken, async (req, res) => {
    try {
        console.log("GET THE USER", req.userId)
        const user = await User.findById({ _id: req.userId });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(user);
    } catch (err) {
        console.error('Error fetching user:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Add a new user
app.post('/users', verifyToken, checkAdminRole, async (req, res) => {
    try {
        const newUser = await User.create(req.body);
        res.status(201).json(newUser);
    } catch (err) {
        console.error('Error creating user:', err);
        res.status(500).json({error: 'Internal server error'});
    }
});

// Update a user
app.put('/users/edit', verifyToken, checkAdminRole, async (req, res) => {
    try {
        console.log("req.body", req.body)
        const updatedUser = await User.findByIdAndUpdate(req.body._id, req.body, {new: true});
        if (!updatedUser) {
            return res.status(404).json({error: 'User not found'});
        }
        console.log("UPPPPP", updatedUser)
        res.json(updatedUser);
    } catch (err) {
        console.error('Error updating user:', err);
        res.status(500).json({error: 'Internal server error'});
    }
});

// Delete a user
app.delete('/users/:id', verifyToken, checkAdminRole, async (req, res) => {
    try {
        console.log("DELETE USER", req.params.id)
        const id = req.params.id;

        await User.findByIdAndDelete(id);

        res.sendStatus(204);
    } catch (err) {
        console.error('Error deleting user:', err);
        res.status(500).json({error: 'Internal server error'});
    }
});

https.createServer(sslOptions, app).listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

module.exports = app;

