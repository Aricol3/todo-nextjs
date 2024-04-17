import {addTodo, deleteTodo, editTodo, getAllTodos} from "../services/api.js";

describe('getAllTodos', () => {
    it('should fetch todos successfully', async () => {
        const mockResponse = [{id: 1, text: 'Todo 1', parentId: ""}, {id: 2, text: 'Todo 2', parentId: ""}];
        global.fetch = jest.fn().mockResolvedValue({ok: true, json: () => Promise.resolve(mockResponse)});

        const todos = await getAllTodos();
        expect(todos).toEqual(mockResponse);
    });

    it('should throw an error when fetching todos fails', async () => {
        global.fetch = jest.fn().mockResolvedValue({ok: false});

        await expect(getAllTodos()).rejects.toThrow('Failed to fetch todos');
    });
});

describe('addTodo', () => {
    it('should add a todo successfully', async () => {
        const newTodo = {text: 'New Todo', parentId: ""};
        const mockResponse = {id: 3, ...newTodo};
        global.fetch = jest.fn().mockResolvedValue({ok: true, json: () => Promise.resolve(mockResponse)});

        const addedTodo = await addTodo(newTodo);
        expect(addedTodo).toEqual(mockResponse);
    });

    it('should throw an error when adding todo fails', async () => {
        global.fetch = jest.fn().mockResolvedValue({ok: false});

        await expect(addTodo({text: 'New Todo'})).rejects.toThrow('Failed to add todo');
    });
});

describe('editTodo', () => {
    it('should edit a todo successfully', async () => {
        const todo = {id: 1, text: 'Updated Todo', parentId: ""};
        const mockResponse = {id: 1, text: 'Updated Todo', parentId: ""};
        global.fetch = jest.fn().mockResolvedValue({ok: true, json: () => Promise.resolve(mockResponse)});

        const editedTodo = await editTodo(todo);
        expect(editedTodo).toEqual(mockResponse);
    });

    it('should throw an error when editing todo fails', async () => {
        const todo = {id: 1, text: 'Updated Todo', parentId: ""};
        global.fetch = jest.fn().mockResolvedValue({ok: false});

        await expect(editTodo(todo)).rejects.toThrow('Failed to edit todo');
    });
});

describe('deleteTodo', () => {
    it('should delete a todo successfully', async () => {
        const taskId = 1;
        global.fetch = jest.fn().mockResolvedValue({ok: true});

        await expect(deleteTodo(taskId)).resolves.toBeUndefined();
    });

    it('should throw an error when deleting todo fails', async () => {
        const taskId = 1;
        global.fetch = jest.fn().mockResolvedValue({ok: false});

        await expect(deleteTodo(taskId)).rejects.toThrow('Failed to delete todo');
    });
});
