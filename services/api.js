const baseUrl = "http://localhost:3001"

export const getAllTodos = async () => {
    const res = await fetch(`${baseUrl}/tasks`, {cache: "no-store"});
    const todo = res.json();
    return todo;
};

export const addTodo = async () => {
    const res = await fetch(`${baseUrl}/tasks/`, {
        method: "PUT",
        headers: {"Content-Type": "application/json",},
        body: JSON.stringify(todo),
    });
    const updatedTodo = await res.json();
    return updatedTodo;
};

export const editTodo = async (todo) => {
    const res = await fetch(`${baseUrl}/tasks/${todo.id}`, {
        method: "PUT",
        headers: {"Content-Type": "application/json",},
        body: JSON.stringify(todo),
    });
    const updatedTodo = await res.json();
    return updatedTodo;
};

export const deleteTodo = async (taskId) => {
    await fetch(`${baseUrl}/tasks/${taskId}`, {method: "DELETE",});
};