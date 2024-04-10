const baseUrl = "http://localhost:3001";

export const getAllTodos = async () => {
    try {
        const res = await fetch(`${baseUrl}/tasks`, {cache: "no-store"});
        if (!res.ok) {
            throw new Error('Failed to fetch todos');
        }
        return res.json();
    } catch (error) {
        throw error;
    }
};

export const addTodo = async (newTodo) => {
    try {
        const res = await fetch(`${baseUrl}/tasks/`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(newTodo),
        });
        if (!res.ok) {
            throw new Error('Failed to add todo');
        }
        return await res.json();
    } catch (error) {
        throw error;
    }
};

export const editTodo = async (todo) => {
    try {
        const res = await fetch(`${baseUrl}/tasks/${todo.id}`, {
            method: "PUT",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(todo),
        });
        if (!res.ok) {
            throw new Error('Failed to edit todo');
        }
        return await res.json();
    } catch (error) {
        throw error;
    }
};

export const deleteTodo = async (taskId) => {
    try {
        const res = await fetch(`${baseUrl}/tasks/${taskId}`, {method: "DELETE"});
        if (!res.ok) {
            throw new Error('Failed to delete todo');
        }
    } catch (error) {
        throw error;
    }
};
