const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../backend/jsonserver');

describe('Todo API', () => {
    beforeAll(async () => {
        // Connect to a test database before running tests
        await mongoose.connect('mongodb://localhost/todo-db-test', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false,
            useCreateIndex: true
        });
    });

    afterAll(async () => {
        await mongoose.connection.close();
    });

    it('should add a new todo', async () => {
        const todo = { text: 'New Todo',parentId:"" };
        const response = await request(app)
            .post('/tasks')
            .send(todo)
            .expect(201);

        expect(response.body.text).toBe('New Todo');
    });

    it('should get all todos', async () => {
        const response = await request(app)
            .get('/tasks')
            .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
    });

    it('should get a single todo by ID', async () => {
        // Create a sample todo
        const newTodo = await request(app)
            .post('/tasks')
            .send({ text: 'Sample Todo' })
            .expect(201);

        // Fetch the todo by ID
        const response = await request(app)
            .get(`/tasks/${newTodo.body._id}`)
            .expect(200);

        // Check if the fetched todo matches the created one
        expect(response.body.text).toBe('Sample Todo');
    });

    it('should update a todo', async () => {
        // Create a sample todo
        const newTodo = await request(app)
            .post('/tasks')
            .send({ text: 'Sample Todo',parentId:"" })
            .expect(201);


        // Update the todo
        const updatedTodo = { ...newTodo.body, text: 'Updated Todo' };
        const response = await request(app)
            .put('/tasks/edit')
            .send(updatedTodo)
            .expect(200);

        // Check if the updated todo matches the expected text
        expect(response.body.text).toBe('Updated Todo');
    });

    it('should delete a todo', async () => {
        // Create a sample todo
        const newTodo = await request(app)
            .post('/tasks')
            .send({ text: 'Sample Todo',parentId:"" })
            .expect(201);

        // Delete the todo
        await request(app)
            .delete(`/tasks/${newTodo.body._id}`)
            .expect(204);

        // Check if the todo has been deleted
        const deletedTodo = await request(app)
            .get(`/tasks/${newTodo.body._id}`)
            .expect(404);
    });
});
