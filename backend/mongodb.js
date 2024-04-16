const { MongoClient } = require("mongodb");

// Replace the uri string with your connection string.
const uri = "mongodb://localhost:27017";

const client = new MongoClient(uri);

async function run() {
    try {
        const database = client.db('todo-db');
        const todos = database.collection('todo');

        const query = { "tasks": { $elemMatch: { "text": '12345' } } };
        const todo = await todos.findOne(query);
        let matchingTask;
        if (todo && todo.tasks) {
            matchingTask = todo.tasks.find(task => task.text === '12345');
        }
        console.log(matchingTask);


    } finally {
        await client.close();
    }
}
run().catch(console.dir);