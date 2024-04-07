import {addTodo, deleteTodo, editTodo, getAllTodos} from "../services/api.js";

global.fetch = jest.fn(() =>
    Promise.resolve({
        json: () => Promise.resolve({}),
    })
);

describe('Todo Functions', () => {

    it('should fetch all todos', async () => {
        await getAllTodos();
        expect(fetch).toHaveBeenCalledWith('http://localhost:3001/tasks', {
            cache: 'no-store',
        });
    });

    it('should add a todo', async () => {
        const newTodo = {title: 'Test Todo', completed: false};
        await addTodo(newTodo);
        expect(fetch).toHaveBeenCalledWith('http://localhost:3001/tasks/', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(newTodo),
        });
    });

    it('should edit a todo', async () => {
        const todo = {id: 1, title: 'Edited Todo', completed: true};
        await editTodo(todo);
        expect(fetch).toHaveBeenCalledWith('http://localhost:3001/tasks/1', {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(todo),
        });
    });

    it('should delete a todo', async () => {
        const taskId = 1;
        await deleteTodo(taskId);
        expect(fetch).toHaveBeenCalledWith('http://localhost:3001/tasks/1', {
            method: 'DELETE',
        });
    });
});
